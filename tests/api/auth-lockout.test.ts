/**
 * Tests for Issue #26 — rate limiting and account lockout on login.
 *
 * Rate limiting is skipped in NODE_ENV=test (via the `skip` option in the limiter),
 * so we only exercise the lockout and no-enumeration logic here.
 * The IP rate-limit behaviour is verified by a dedicated smoke test that temporarily
 * re-enables the limiter.
 */
import { randomBytes, scryptSync } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

type LoginAttemptRow = { success: boolean }

/**
 * Builds a Prisma mock where loginAttempt.findMany returns `attempts` (newest first)
 * and loginAttempt.create appends to that list so countConsecutiveFailures stays in sync.
 */
function buildPrismaMock(opts: {
  username: string
  password: string
  userActive?: boolean
  initialAttempts?: LoginAttemptRow[]
}): PrismaClient {
  const { username, password, userActive = true, initialAttempts = [] } = opts
  const storedPassword = hashPassword(password)

  // Mutable list that grows as recordLoginAttempt calls loginAttempt.create
  const attempts: LoginAttemptRow[] = [...initialAttempts]

  const appUserUpdateMany = vi.fn().mockResolvedValue({ count: 1 })

  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockImplementation(
        async (args: { where: { tenantId_username?: { username: string } } }) => {
          const u = args.where.tenantId_username?.username
          if (u !== username) return null
          return { id: 7, tenantId: 1, username, passwordHash: storedPassword, role: 'seller', active: userActive,
                   scopeBranchIds: [], scopeWarehouseIds: [], scopeRouteIds: [], scopeChannels: [] }
        },
      ),
      update: vi.fn().mockResolvedValue(null),
      updateMany: appUserUpdateMany,
      create: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 99 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 99 }),
    },
    loginAttempt: {
      create: vi.fn().mockImplementation(
        async (args: { data: { success: boolean } }) => {
          attempts.unshift({ success: args.data.success }) // newest first
          return { id: attempts.length }
        },
      ),
      findMany: vi.fn().mockImplementation(async () => [...attempts]),
    },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn({} as PrismaClient)
      return fn
    }),
  } as unknown as PrismaClient
}

const VALID_BODY = (username: string, password: string) => ({
  tenantSlug: 'demo',
  username,
  password,
})

// ─── Account lockout ─────────────────────────────────────────────────────────

describe('POST /api/auth/login — account lockout', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('returns Invalid credentials on first wrong password', async () => {
    const user = `u${randomBytes(4).toString('hex')}`
    const app = createApp(buildPrismaMock({ username: user, password: 'correct' }))

    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_BODY(user, 'wrong'))
      .expect(401)

    expect(res.body).toEqual({ success: false, error: 'Invalid credentials' })
  })

  it('returns ACCOUNT_LOCKED after 5 consecutive failures', async () => {
    const user = `u${randomBytes(4).toString('hex')}`
    const prisma = buildPrismaMock({ username: user, password: 'correct' })
    const app = createApp(prisma)

    // 4 failures
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/login').send(VALID_BODY(user, 'wrong'))
    }

    // 5th failure — crosses the threshold
    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_BODY(user, 'wrong'))
      .expect(401)

    expect(res.body).toEqual({ success: false, error: 'ACCOUNT_LOCKED' })
  })

  it('locks the AppUser account (sets active=false) on 5th failure', async () => {
    const user = `u${randomBytes(4).toString('hex')}`
    const prisma = buildPrismaMock({ username: user, password: 'correct' })
    const app = createApp(prisma)

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send(VALID_BODY(user, 'wrong'))
    }

    expect((prisma.appUser.updateMany as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } }),
    )
  })

  it('subsequent attempts after lockout return ACCOUNT_LOCKED (pre-check)', async () => {
    const user = `u${randomBytes(4).toString('hex')}`
    // Start with 5 pre-existing failures so the pre-check fires immediately
    const prisma = buildPrismaMock({
      username: user,
      password: 'correct',
      initialAttempts: [
        { success: false },
        { success: false },
        { success: false },
        { success: false },
        { success: false },
      ],
    })
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_BODY(user, 'correct')) // even correct password
      .expect(401)

    expect(res.body).toEqual({ success: false, error: 'ACCOUNT_LOCKED' })
  })

  it('a successful login resets the failure streak', async () => {
    const user = `u${randomBytes(4).toString('hex')}`
    const pass = randomBytes(8).toString('hex')
    const prisma = buildPrismaMock({ username: user, password: pass })
    const app = createApp(prisma)

    // 4 failures then a success
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/login').send(VALID_BODY(user, 'wrong'))
    }
    await request(app).post('/api/auth/login').send(VALID_BODY(user, pass)).expect(200)

    // Next failure should be 1, not 5
    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_BODY(user, 'wrong'))
      .expect(401)

    expect(res.body).toEqual({ success: false, error: 'Invalid credentials' })
  })
})

// ─── No enumeration ───────────────────────────────────────────────────────────

describe('POST /api/auth/login — no enumeration', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('non-existent user gets ACCOUNT_LOCKED after 5 attempts (same as real user)', async () => {
    const ghost = `ghost_${randomBytes(4).toString('hex')}`
    // buildPrismaMock with a different username so ghost never matches
    const prisma = buildPrismaMock({ username: 'real_user', password: 'irrelevant' })
    const app = createApp(prisma)

    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/login').send(VALID_BODY(ghost, 'any'))
    }
    const res = await request(app)
      .post('/api/auth/login')
      .send(VALID_BODY(ghost, 'any'))
      .expect(401)

    expect(res.body).toEqual({ success: false, error: 'ACCOUNT_LOCKED' })
  })

  it('non-existent user does NOT lock any AppUser account', async () => {
    const ghost = `ghost_${randomBytes(4).toString('hex')}`
    const prisma = buildPrismaMock({ username: 'real_user', password: 'irrelevant' })
    const app = createApp(prisma)

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send(VALID_BODY(ghost, 'any'))
    }

    // updateMany is called but matches 0 rows (mock returns { count: 1 } but we check the call args)
    const calls = (prisma.appUser.updateMany as ReturnType<typeof vi.fn>).mock.calls
    // username in the where clause should be ghost, not real_user
    for (const [arg] of calls) {
      expect((arg as { where: { username: string } }).where.username).toBe(ghost)
    }
  })
})

// ─── Admin unlock ────────────────────────────────────────────────────────────

describe('PUT /api/users/:id — admin unlock', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('owner can set active=true to unlock a user', async () => {
    const lockedUser = { id: 7, username: 'locked_user', role: 'seller', active: false,
                         tenantId: 1, scopeBranchIds: [], scopeWarehouseIds: [], scopeRouteIds: [], scopeChannels: [] }
    const unlockedUser = { ...lockedUser, active: true }
    const userUpdate = vi.fn().mockResolvedValue(unlockedUser)
    const prisma = buildPrismaMock({ username: 'locked_user', password: 'x', userActive: false })
    ;(prisma.appUser.findFirst as ReturnType<typeof vi.fn>) = vi.fn().mockResolvedValue(lockedUser)
    ;(prisma.appUser.update as ReturnType<typeof vi.fn>) = userUpdate

    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/users/7')
      .send({ active: true })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ active: true }) }),
    )
  })
})
