import { createHmac, randomBytes, scryptSync } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import * as OTPAuth from 'otpauth'
import { createApp } from '../../apps/server/createApp'
import { initializeAppConfig, resetAppConfigCache } from '../../apps/server/config/env'
import {
  createMemoryRefreshTokenBlacklist,
  setRefreshTokenBlacklistForTests,
} from '../../apps/server/lib/refreshTokenBlacklist'
import {
  createMemoryMfaChallengeStore,
  setMfaChallengeStoreForTests,
} from '../../apps/server/lib/mfaChallengeStore'
import { encryptMfaSecret } from '../../apps/server/lib/mfaSecrets'
import { hashPassword } from '../../apps/server/passwordHash'

function hashPw(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function hashToken(token: string, jwtSecret: string): string {
  return createHmac('sha256', jwtSecret).update(token).digest('hex')
}

function currentTotp(secretBase32: string, label: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'BizCode',
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
  return totp.generate()
}

describe('auth MFA TOTP (#213)', () => {
  const loginName = `u_${randomBytes(4).toString('hex')}`
  const loginSecret = `p_${randomBytes(8).toString('hex')}`
  const totpSecret = new OTPAuth.Secret({ size: 20 }).base32
  let jwtSecret: string
  let mfaEnabled = false
  let totpEncrypted: string | null = null
  const backupRows: Array<{ id: number; codeHash: string; usedAt: Date | null }> = []
  let nextBackupId = 1
  const sessionStore = new Map<string, { id: number; userId: number; expiresAt: Date; tokenFamily: string }>()
  const refreshStore = new Map<string, { id: number }>()

  function userRow() {
    return {
      id: 7,
      tenantId: 11,
      username: loginName,
      passwordHash: hashPw(loginSecret),
      role: 'owner' as const,
      active: true,
      mfaEnabled,
      totpSecretEncrypted: totpEncrypted,
      mfaVerifiedAt: mfaEnabled ? new Date() : null,
      scopeBranchIds: [] as number[],
      scopeWarehouseIds: [] as number[],
      scopeRouteIds: [] as number[],
      scopeChannels: ['backoffice'],
    }
  }

  function buildPrisma(): PrismaClient {
    const prisma = {
      cliente: { findMany: vi.fn().mockResolvedValue([]) },
      articulo: { findMany: vi.fn().mockResolvedValue([]) },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: { findMany: vi.fn().mockResolvedValue([]) },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
      loginAttempt: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 1 }),
      },
      appUser: {
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn(async (args: { where: Record<string, unknown>; include?: { mfaBackupCodes?: unknown }; select?: unknown }) => {
          const where = args.where
          if ('id' in where && where.id === 7) {
            if (args.include?.mfaBackupCodes) {
              return { ...userRow(), mfaBackupCodes: backupRows.filter((r) => r.usedAt == null) }
            }
            if (args.select) {
              return { mfaEnabled, role: 'owner', active: true }
            }
            return userRow()
          }
          if (
            'tenantId_username' in where &&
            (where.tenantId_username as { username: string }).username === loginName
          ) {
            return userRow()
          }
          return null
        }),
        update: vi.fn(async (args: { where: { id: number }; data: Record<string, unknown> }) => {
          if (typeof args.data.mfaEnabled === 'boolean') mfaEnabled = args.data.mfaEnabled
          if ('totpSecretEncrypted' in args.data) {
            totpEncrypted = args.data.totpSecretEncrypted as string | null
          }
          return userRow()
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn(async () => userRow()),
      },
      appMfaBackupCode: {
        deleteMany: vi.fn(async () => {
          backupRows.length = 0
          return { count: 0 }
        }),
        createMany: vi.fn(async (args: { data: Array<{ userId: number; codeHash: string }> }) => {
          for (const row of args.data) {
            backupRows.push({ id: nextBackupId++, codeHash: row.codeHash, usedAt: null })
          }
          return { count: args.data.length }
        }),
        update: vi.fn(async (args: { where: { id: number }; data: { usedAt: Date } }) => {
          const row = backupRows.find((r) => r.id === args.where.id)
          if (row) row.usedAt = args.data.usedAt
          return row
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
        findFirst: vi.fn(async (args: { where: { tokenHash: string } }) => {
          const session = sessionStore.get(args.where.tokenHash)
          if (!session) return null
          return {
            id: session.id,
            user: userRow(),
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
        update: vi.fn().mockResolvedValue({ id: 200 }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(async (arg: unknown) => {
        if (Array.isArray(arg)) return Promise.all(arg)
        if (typeof arg === 'function') {
          return (arg as (tx: unknown) => Promise<unknown>)(prisma)
        }
        throw new Error('unexpected transaction')
      }),
    }
    return prisma as unknown as PrismaClient
  }

  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    jwtSecret = `jwt_${randomBytes(16).toString('hex')}`
    process.env.JWT_SECRET = jwtSecret
    process.env.BIZCODE_MFA_ENCRYPTION_KEY = `mfa_${randomBytes(16).toString('hex')}`
    delete process.env.REDIS_URL
    initializeAppConfig()
    setRefreshTokenBlacklistForTests(createMemoryRefreshTokenBlacklist())
    setMfaChallengeStoreForTests(createMemoryMfaChallengeStore())
    mfaEnabled = false
    totpEncrypted = null
    backupRows.length = 0
    nextBackupId = 1
    sessionStore.clear()
    refreshStore.clear()
  })

  it('login without MFA issues cookies', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    expect(res.status).toBe(200)
    expect(res.body.data.userId).toBe(7)
    expect(res.body.data.mfaRequired).toBeUndefined()
    expect(res.headers['set-cookie']).toBeTruthy()
  })

  it('login with MFA returns challenge without cookies', async () => {
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({
      mfaRequired: true,
      mfaToken: expect.any(String),
    })
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  it('mfa/verify with TOTP issues session cookies', async () => {
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    const mfaToken = loginRes.body.data.mfaToken as string
    const code = currentTotp(totpSecret, loginName)
    const verifyRes = await request(app).post('/api/auth/mfa/verify').send({ mfaToken, code })
    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.data.userId).toBe(7)
    expect(verifyRes.headers['set-cookie']).toBeTruthy()
  })

  it('rejects wrong MFA code and challenge reuse', async () => {
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    const mfaToken = loginRes.body.data.mfaToken as string

    const bad = await request(app).post('/api/auth/mfa/verify').send({ mfaToken, code: '000000' })
    expect(bad.status).toBe(401)

    // Wrong code consumes challenge (single-use take) — re-login for reuse test
    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    const token2 = login2.body.data.mfaToken as string
    const code = currentTotp(totpSecret, loginName)
    const ok = await request(app).post('/api/auth/mfa/verify').send({ mfaToken: token2, code })
    expect(ok.status).toBe(200)
    const reuse = await request(app).post('/api/auth/mfa/verify').send({ mfaToken: token2, code })
    expect(reuse.status).toBe(401)
  })

  it('backup code is single-use', async () => {
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const plainBackup = 'abcd1234'
    backupRows.push({ id: 1, codeHash: hashPassword(plainBackup), usedAt: null })
    nextBackupId = 2
    const app = createApp(buildPrisma())

    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    const ok = await request(app)
      .post('/api/auth/mfa/verify')
      .send({ mfaToken: login1.body.data.mfaToken, code: plainBackup })
    expect(ok.status).toBe(200)
    expect(backupRows[0]?.usedAt).not.toBeNull()

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ tenantSlug: 'platform', username: loginName, password: loginSecret })
    const again = await request(app)
      .post('/api/auth/mfa/verify')
      .send({ mfaToken: login2.body.data.mfaToken, code: plainBackup })
    expect(again.status).toBe(401)
  })

  it('setup start/confirm enables MFA and returns backup codes', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrisma())

    const start = await request(app).post('/api/auth/mfa/setup/start')
    expect(start.status).toBe(200)
    expect(start.body.data.secret).toBeTruthy()
    expect(start.body.data.qrDataUrl).toMatch(/^data:image\/png/)
    expect(totpEncrypted).toBeTruthy()

    const code = currentTotp(start.body.data.secret as string, loginName)
    const confirm = await request(app).post('/api/auth/mfa/setup/confirm').send({ code })
    expect(confirm.status).toBe(200)
    expect(confirm.body.data.mfaEnabled).toBe(true)
    expect(confirm.body.data.backupCodes).toHaveLength(8)
    expect(mfaEnabled).toBe(true)
  })

  it('disable MFA with TOTP clears secret', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())

    const code = currentTotp(totpSecret, loginName)
    const res = await request(app).post('/api/auth/mfa/disable').send({ code })
    expect(res.status).toBe(200)
    expect(res.body.data.mfaEnabled).toBe(false)
    expect(mfaEnabled).toBe(false)
    expect(totpEncrypted).toBeNull()
  })

  it('/me reports mfaSetupRequired for owner without MFA', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    mfaEnabled = false
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.data.mfaEnabled).toBe(false)
    expect(res.body.data.mfaSetupRequired).toBe(true)
  })

  it('setup/start rejects when MFA already enabled', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    mfaEnabled = true
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/auth/mfa/setup/start')
    expect(res.status).toBe(409)
  })

  it('disable rejects when MFA is off', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    mfaEnabled = false
    totpEncrypted = null
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/auth/mfa/disable').send({ code: '123456' })
    expect(res.status).toBe(400)
  })

  it('setup/confirm rejects invalid TOTP', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_USER_ID = '7'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    mfaEnabled = false
    totpEncrypted = encryptMfaSecret(totpSecret)
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/auth/mfa/setup/confirm').send({ code: '000000' })
    expect(res.status).toBe(401)
  })
})

// silence unused hashToken if needed for future assertions
void hashToken
