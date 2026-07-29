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
import {
  getByTokenHashFilter,
  matchesTokenHashFilter,
  type TokenHashWhere,
} from '../helpers/tokenHashFilter'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function hashToken(token: string, jwtSecret: string): string {
  return createHmac('sha256', jwtSecret).update(token).digest('hex')
}

type SessionRow = {
  id: number
  userId: number
  tokenHash: string
  tokenFamily: string
  expiresAt: Date
  revokedAt: Date | null
}

type RefreshRow = {
  id: number
  userId: number
  tokenHash: string
  tokenFamily: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}

function cookieValue(setCookie: string | string[] | undefined, name: string): string | null {
  const list = !setCookie ? [] : Array.isArray(setCookie) ? setCookie : [setCookie]
  for (const raw of list) {
    const part = raw.split(';')[0]
    const eq = part.indexOf('=')
    if (eq < 0) continue
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1))
    }
  }
  return null
}

function buildPrismaMock(loginName: string, loginSecret: string): PrismaClient {
  const storedPassword = hashPassword(loginSecret)
  const sessions = new Map<string, SessionRow>()
  const refreshes = new Map<string, RefreshRow>()
  let sessionSeq = 100
  let refreshSeq = 200

  const userRow = {
    id: 7,
    tenantId: 11,
    username: loginName,
    passwordHash: storedPassword,
    role: 'super_admin',
    active: true,
    mfaEnabled: false,
    scopeBranchIds: [] as number[],
    scopeWarehouseIds: [] as number[],
    scopeRouteIds: [] as number[],
    scopeChannels: ['backoffice'],
    tenant: { id: 11, slug: 'platform', active: true, maintenanceMode: false },
  }

  const appSession = {
    create: vi.fn(async (args: { data: SessionRow & { userAgent?: string; ipAddress?: string } }) => {
      const id = ++sessionSeq
      const row: SessionRow = {
        id,
        userId: args.data.userId,
        tokenHash: args.data.tokenHash,
        tokenFamily: args.data.tokenFamily,
        expiresAt: args.data.expiresAt,
        revokedAt: null,
      }
      sessions.set(row.tokenHash, row)
      return { id }
    }),
    findFirst: vi.fn(async (args: {
      where: { tokenHash?: TokenHashWhere; revokedAt?: null; expiresAt?: { gt: Date } }
    }) => {
      const hit = getByTokenHashFilter(sessions, args.where.tokenHash)
      if (!hit) return null
      const session = hit.value
      if (session.revokedAt) return null
      if (args.where.expiresAt?.gt && session.expiresAt <= args.where.expiresAt.gt) return null
      return { ...session, user: userRow }
    }),
    updateMany: vi.fn(async (args: { where: Record<string, unknown>; data: { revokedAt: Date } }) => {
      let count = 0
      for (const row of sessions.values()) {
        if (
          args.where.tokenHash != null
          && !matchesTokenHashFilter(row.tokenHash, args.where.tokenHash as TokenHashWhere)
        ) {
          continue
        }
        if (args.where.userId && row.userId !== args.where.userId) continue
        if (args.where.tokenFamily && row.tokenFamily !== args.where.tokenFamily) continue
        if (args.where.revokedAt === null && row.revokedAt != null) continue
        row.revokedAt = args.data.revokedAt
        count++
      }
      return { count }
    }),
    update: vi.fn().mockResolvedValue({ id: 100 }),
  }

  const appRefreshToken = {
    create: vi.fn(async (args: { data: Omit<RefreshRow, 'id' | 'revokedAt'> & { userAgent?: string; ipAddress?: string } }) => {
      const id = ++refreshSeq
      const row: RefreshRow = {
        id,
        userId: args.data.userId,
        tokenHash: args.data.tokenHash,
        tokenFamily: args.data.tokenFamily,
        expiresAt: args.data.expiresAt,
        createdAt: new Date(),
        revokedAt: null,
      }
      refreshes.set(row.tokenHash, row)
      return { id }
    }),
    findFirst: vi.fn(async (args: { where: { tokenHash: TokenHashWhere }; include?: { user: boolean } }) => {
      const hit = getByTokenHashFilter(refreshes, args.where.tokenHash)
      if (!hit) return null
      const row = hit.value
      if (args.include?.user) return { ...row, user: userRow }
      return row
    }),
    findMany: vi.fn(async (args: { where: { userId?: number; tokenFamily?: string; revokedAt?: null } }) => {
      return [...refreshes.values()].filter((row) => {
        if (args.where.userId != null && row.userId !== args.where.userId) return false
        if (args.where.tokenFamily && row.tokenFamily !== args.where.tokenFamily) return false
        if (args.where.revokedAt === null && row.revokedAt != null) return false
        return true
      })
    }),
    update: vi.fn(async (args: { where: { id: number }; data: { revokedAt: Date } }) => {
      for (const row of refreshes.values()) {
        if (row.id === args.where.id) {
          row.revokedAt = args.data.revokedAt
          return row
        }
      }
      return null
    }),
    updateMany: vi.fn(async (args: { where: Record<string, unknown>; data: { revokedAt: Date } }) => {
      let count = 0
      for (const row of refreshes.values()) {
        if (args.where.id != null && row.id !== args.where.id) continue
        if (args.where.userId != null && row.userId !== args.where.userId) continue
        if (args.where.tokenFamily && row.tokenFamily !== args.where.tokenFamily) continue
        if (args.where.revokedAt === null && row.revokedAt != null) continue
        row.revokedAt = args.data.revokedAt
        count++
      }
      return { count }
    }),
  }

  const prisma = {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findUnique: vi.fn(async (args: { where: { tenantId_username?: { username: string }; id?: number } }) => {
        if (args.where.id === 7) return userRow
        if (args.where.tenantId_username?.username !== loginName) return null
        return userRow
      }),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({
        id: 11,
        slug: 'platform',
        active: true,
        maintenanceMode: false,
      }),
    },
    appSession,
    appRefreshToken,
    loginAttempt: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg)
      }
      if (typeof arg === 'function') {
        return (arg as (tx: unknown) => Promise<unknown>)(prisma)
      }
      throw new Error('unexpected transaction callback')
    }),
  }
  return prisma as unknown as PrismaClient
}

describe('Auth refresh token rotation (#212)', () => {
  let loginName: string
  let loginSecret: string
  const jwtSecret = 'auth-refresh-test-jwt-secret'

  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = jwtSecret
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.REDIS_URL
    initializeAppConfig()
    setRefreshTokenBlacklistForTests(createMemoryRefreshTokenBlacklist())
    loginName = `u${randomBytes(8).toString('hex')}`
    loginSecret = randomBytes(16).toString('hex')
  })

  it('issues access+refresh cookies on login and refreshes the pair', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))
    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })
    expect(login.status).toBe(200)
    const access = cookieValue(login.headers['set-cookie'], 'bizcode_session')
    const refresh = cookieValue(login.headers['set-cookie'], 'bizcode_refresh')
    expect(access).toBeTruthy()
    expect(refresh).toBeTruthy()
    expect(hashToken(access!, jwtSecret).length).toBe(64)

    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `bizcode_refresh=${encodeURIComponent(refresh!)}`)
    expect(refreshed.status).toBe(200)
    expect(refreshed.body).toEqual({ success: true, data: { refreshed: true } })
    const newAccess = cookieValue(refreshed.headers['set-cookie'], 'bizcode_session')
    const newRefresh = cookieValue(refreshed.headers['set-cookie'], 'bizcode_refresh')
    expect(newAccess).toBeTruthy()
    expect(newRefresh).toBeTruthy()
    expect(newRefresh).not.toBe(refresh)

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `bizcode_session=${encodeURIComponent(newAccess!)}`)
    expect(me.status).toBe(200)
  })

  it('rejects revoked refresh token reuse and invalidates the family', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))
    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })
    const refresh = cookieValue(login.headers['set-cookie'], 'bizcode_refresh')!

    const first = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `bizcode_refresh=${encodeURIComponent(refresh)}`)
    expect(first.status).toBe(200)

    const reuse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `bizcode_refresh=${encodeURIComponent(refresh)}`)
    expect(reuse.status).toBe(401)
    expect(reuse.body.error).toBe('SESSION_EXPIRED')
  })

  it('logout blacklists refresh so it cannot be reused', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))
    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })
    const access = cookieValue(login.headers['set-cookie'], 'bizcode_session')!
    const refresh = cookieValue(login.headers['set-cookie'], 'bizcode_refresh')!

    const logout = await request(app)
      .post('/api/auth/logout')
      .set(
        'Cookie',
        `bizcode_session=${encodeURIComponent(access)}; bizcode_refresh=${encodeURIComponent(refresh)}`,
      )
    expect(logout.status).toBe(200)

    const afterLogout = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `bizcode_refresh=${encodeURIComponent(refresh)}`)
    expect(afterLogout.status).toBe(401)
    expect(afterLogout.body.error).toBe('SESSION_EXPIRED')
  })
})
