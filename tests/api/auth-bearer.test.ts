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
    role: 'seller',
    active: true,
    mfaEnabled: false,
    scopeBranchIds: [] as number[],
    scopeWarehouseIds: [] as number[],
    scopeRouteIds: [] as number[],
    scopeChannels: ['field'],
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
    create: vi.fn(async (args: {
      data: Omit<RefreshRow, 'id' | 'revokedAt'> & { userAgent?: string; ipAddress?: string }
    }) => {
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

describe('Auth Bearer dual mode (#167)', () => {
  let loginName: string
  let loginSecret: string
  const jwtSecret = 'auth-bearer-test-jwt-secret'

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

  it('returns access/refresh tokens in login body and authenticates via Authorization Bearer', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))

    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })

    expect(login.status).toBe(200)
    expect(login.body.success).toBe(true)
    expect(login.body.data.role).toBe('seller')
    expect(typeof login.body.data.accessToken).toBe('string')
    expect(typeof login.body.data.refreshToken).toBe('string')
    expect(login.body.data.expiresIn).toBe(900)
    expect(hashToken(login.body.data.accessToken, jwtSecret).length).toBe(64)

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)

    expect(me.status).toBe(200)
    expect(me.body.data.role).toBe('seller')
  })

  it('refreshes using JSON body refreshToken without cookies', async () => {
    const app = createApp(buildPrismaMock(loginName, loginSecret))

    const login = await request(app).post('/api/auth/login').send({
      tenantSlug: 'platform',
      username: loginName,
      password: loginSecret,
    })
    expect(login.status).toBe(200)
    const { refreshToken } = login.body.data

    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken })
    expect(refreshed.status).toBe(200)
    expect(refreshed.body.data.refreshed).toBe(true)
    expect(typeof refreshed.body.data.accessToken).toBe('string')
    expect(typeof refreshed.body.data.refreshToken).toBe('string')
    expect(refreshed.body.data.accessToken).not.toBe(login.body.data.accessToken)

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshed.body.data.accessToken}`)
    expect(me.status).toBe(200)
  })
})
