import { createHmac, randomBytes, scryptSync } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { initializeAppConfig, resetAppConfigCache } from '../../apps/server/config/env'
import {
  createMemoryRefreshTokenBlacklist,
  setRefreshTokenBlacklistForTests,
} from '../../apps/server/lib/refreshTokenBlacklist'
import { getByTokenHashFilter, type TokenHashWhere } from '../helpers/tokenHashFilter'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function hashToken(token: string, jwtSecret: string): string {
  return createHmac('sha256', jwtSecret).update(token).digest('hex')
}

/**
 * @en Per-test login identity and secret from random bytes so static secret scanners do not see paired credentials.
 * @es Identidad y secreto de login por prueba con bytes aleatorios para que los escáneres no vean pares estáticos.
 * @pt-BR Identidade e segredo de login por teste com bytes aleatórios para scanners não verem pares estáticos.
 */
function buildPrismaMock(loginName: string, loginSecret: string): PrismaClient {
  const storedPassword = hashPassword(loginSecret)
  const sessionStore = new Map<string, { id: number; userId: number; expiresAt: Date; tokenFamily: string }>()
  const refreshStore = new Map<string, { id: number }>()

  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findUnique: vi.fn(async (args: {
        where: { tenantId_username?: { tenantId: number; username: string }; id?: number }
        select?: { mfaEnabled?: boolean; role?: boolean; active?: boolean }
      }) => {
        if (args.where.id === 7) {
          if (args.select) {
            return { mfaEnabled: false, role: 'super_admin', active: true }
          }
          return {
            id: 7,
            tenantId: 11,
            username: loginName,
            passwordHash: storedPassword,
            role: 'super_admin',
            active: true,
            mfaEnabled: false,
            scopeBranchIds: [],
            scopeWarehouseIds: [],
            scopeRouteIds: [],
            scopeChannels: ['backoffice'],
          }
        }
        if (args.where.tenantId_username?.username !== loginName) {
          return null
        }
        return {
          id: 7,
          tenantId: 11,
          username: loginName,
          passwordHash: storedPassword,
          role: 'super_admin',
          active: true,
          mfaEnabled: false,
          scopeBranchIds: [],
          scopeWarehouseIds: [],
          scopeRouteIds: [],
          scopeChannels: ['backoffice'],
        }
      }),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 11, slug: 'platform', active: true }),
    },
    appSession: {
      create: vi.fn(async (args: { data: { userId: number; tokenHash: string; expiresAt: Date; tokenFamily: string } }) => {
        sessionStore.set(args.data.tokenHash, {
          id: 100,
          userId: args.data.userId,
          expiresAt: args.data.expiresAt,
          tokenFamily: args.data.tokenFamily,
        })
        return { id: 100 }
      }),
      findFirst: vi.fn(async (args: { where: { tokenHash: TokenHashWhere } }) => {
        const hit = getByTokenHashFilter(sessionStore, args.where.tokenHash)
        if (!hit) {
          return null
        }
        return {
          id: hit.value.id,
          user: {
            id: 7,
            tenantId: 11,
            username: loginName,
            role: 'super_admin',
            active: true,
            mfaEnabled: false,
            scopeBranchIds: [],
            scopeWarehouseIds: [],
            scopeRouteIds: [],
            scopeChannels: ['backoffice'],
          },
        }
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 100 }),
    },
    appRefreshToken: {
      create: vi.fn(async (args: { data: { tokenHash: string } }) => {
        refreshStore.set(args.data.tokenHash, { id: 200 })
        return { id: 200 }
      }),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    loginAttempt: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (Array.isArray(arg)) return Promise.all(arg)
      throw new Error('unexpected transaction')
    }),
  } as unknown as PrismaClient
}

describe('Auth session endpoints', () => {
  let loginName: string
  let loginSecret: string
  const jwtSecret = 'auth-session-test-jwt-secret'

  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = jwtSecret
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.REDIS_URL
    initializeAppConfig()
    setRefreshTokenBlacklistForTests(createMemoryRefreshTokenBlacklist())
    loginName = `u${randomBytes(8).toString('hex')}`
    loginSecret = randomBytes(16).toString('hex')
  })

  it('creates session on valid login and allows /api/auth/me', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))

    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })

    expect(login.status).toBe(200)
    expect(login.body.success).toBe(true)
    expect(login.body.data.username).toBe(loginName)
    const cookiesRaw = login.headers['set-cookie']
    const cookies = !cookiesRaw ? [] : Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw]
    const sessionCookie = cookies.find((c) => c.startsWith('bizcode_session='))
    const refreshCookie = cookies.find((c) => c.startsWith('bizcode_refresh='))
    expect(sessionCookie).toBeTruthy()
    expect(refreshCookie).toBeTruthy()

    const token = decodeURIComponent(sessionCookie!.split(';')[0].split('=')[1])
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(20)

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `bizcode_session=${encodeURIComponent(token)}`)

    expect(me.status).toBe(200)
    expect(me.body.success).toBe(true)
    expect(me.body.data.role).toBe('super_admin')

    expect(hashToken(token, jwtSecret).length).toBe(64)
  })

  it('rejects session cookie when JWT_SECRET differs from login', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))

    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })

    expect(login.status).toBe(200)
    const cookiesRaw = login.headers['set-cookie']
    const cookies = !cookiesRaw ? [] : Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw]
    const sessionCookie = cookies.find((c) => c.startsWith('bizcode_session='))
    const token = decodeURIComponent(sessionCookie!.split(';')[0].split('=')[1])

    resetAppConfigCache()
    process.env.JWT_SECRET = 'different-jwt-secret'
    initializeAppConfig()

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `bizcode_session=${encodeURIComponent(token)}`)

    expect(me.status).toBe(401)
  })

  it('returns 401 for invalid credentials', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))
    const wrongSecret = `${loginSecret}0`

    const res = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: wrongSecret,
    })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ success: false, error: 'Invalid credentials' })
  })
})
