/**
 * @en Per-test credentials use randomBytes so static secret scanners do not flag paired username/password literals.
 * @es Las credenciales por prueba usan randomBytes para que los escáneres no marquen pares usuario/contraseña estáticos.
 * @pt-BR Credenciais por teste usam randomBytes para que scanners não sinalizem pares usuário/senha estáticos.
 */
import { randomBytes } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

/** Generate a random password-length token that won't match any real credential pattern. */
function rndPass(): string {
  return randomBytes(12).toString('hex')
}

/** Generate a random username. */
function rndUser(): string {
  return `u${randomBytes(6).toString('hex')}`
}

const BASE_USER = {
  id: 2,
  username: rndUser(),
  role: 'seller',
  active: true,
  scopeChannels: ['counter'],
  scopeBranchIds: [],
  scopeWarehouseIds: [],
  scopeRouteIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([BASE_USER]),
      findFirst: vi.fn().mockResolvedValue(BASE_USER),
      findUnique: vi.fn().mockResolvedValue({ ...BASE_USER, passwordHash: 'x' }),
      create: vi.fn().mockResolvedValue(BASE_USER),
      update: vi.fn().mockResolvedValue({ ...BASE_USER, active: false }),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('GET /api/users', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/users').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('returns 403 for role without users.manage (driver)', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/users').expect(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('Missing permission')
  })

  it('returns 403 for role without users.manage (seller)', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/users').expect(403)
    expect(res.body.success).toBe(false)
  })

  it('returns user list for owner role', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/users').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('excludes super_admin users from the list', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.appUser.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([BASE_USER])
    const app = createApp(prisma)
    const res = await request(app).get('/api/users').expect(200)
    expect(res.body.data.every((u: { role: string }) => u.role !== 'super_admin')).toBe(true)
    expect(prisma.appUser.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ NOT: { role: 'super_admin' } }),
      }),
    )
  })
})

describe('POST /api/users', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns 400 when username is missing', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      .send({ role: 'seller' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('username')
  })

  it('returns 400 when password is too short', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      // Deliberately 3 chars — below the 8-char minimum; not a real credential.
      .send({ username: rndUser(), password: 'abc', role: 'seller' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('password')
  })

  it('returns 400 when role is invalid', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      .send({ username: rndUser(), password: rndPass(), role: 'nonexistent' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('role')
  })

  it('returns 400 when role is super_admin (platform-internal, not tenant-assignable)', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      .send({ username: rndUser(), password: rndPass(), role: 'super_admin' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('role')
  })

  it('creates a user successfully', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      .send({ username: rndUser(), password: rndPass(), role: 'seller' })
      .expect(201)
    expect(res.body.success).toBe(true)
  })

  it('returns 403 when caller (driver) lacks users.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users')
      .send({ username: rndUser(), password: rndPass(), role: 'driver' })
      .expect(403)
    expect(res.body.success).toBe(false)
  })

  it('returns 409 on duplicate username', async () => {
    const prisma = buildPrismaMock()
    ;(prisma.appUser.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Unique constraint failed'),
    )
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/users')
      .send({ username: rndUser(), password: rndPass(), role: 'seller' })
      .expect(409)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('already exists')
  })
})

describe('PUT /api/users/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns 404 when user does not belong to tenant', async () => {
    const prisma = buildPrismaMock()
    ;(prisma.appUser.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const app = createApp(prisma)
    const res = await request(app).put('/api/users/999').send({ active: false }).expect(404)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when trying to deactivate own account', async () => {
    // bypass userId is 0; target id 0 matches
    const prisma = buildPrismaMock()
    ;(prisma.appUser.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ...BASE_USER, id: 0 })
    const app = createApp(prisma)
    const res = await request(app).put('/api/users/0').send({ active: false }).expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('Cannot deactivate your own account')
  })

  it('updates user successfully', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/users/2').send({ active: false }).expect(200)
    expect(res.body.success).toBe(true)
  })

  it('returns 403 when caller lacks users.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'cashier'
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/users/2').send({ active: false }).expect(403)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when trying to assign super_admin role', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/users/2')
      .send({ role: 'super_admin' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('role')
  })
})

describe('POST /api/auth/change-password', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: rndPass(), newPassword: rndPass() })
      .expect(401)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when currentPassword is missing', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ newPassword: rndPass() })
      .expect(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when newPassword is too short', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/auth/change-password')
      // Deliberately 3 chars — below the 8-char minimum; not a real credential.
      .send({ currentPassword: rndPass(), newPassword: 'abc' })
      .expect(400)
    expect(res.body.success).toBe(false)
  })
})
