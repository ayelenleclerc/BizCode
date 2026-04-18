import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

// ─── Shared fixture ────────────────────────────────────────────────────────────

const ZONE_BASE = {
  id: 10,
  tenantId: 1,
  nombre: 'Barrio Norte',
  tipo: 'barrio',
  diasEntrega: '1,3',
  horario: '08:00-12:00',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([ZONE_BASE]),
      findFirst: vi.fn().mockResolvedValue(ZONE_BASE),
      create: vi.fn().mockResolvedValue(ZONE_BASE),
      update: vi.fn().mockResolvedValue(ZONE_BASE),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
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

// ─── GET /api/zonas-entrega ────────────────────────────────────────────────────

describe('GET /api/zonas-entrega', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  it('returns list of zones for authenticated manager', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app).get('/api/zonas-entrega').expect(200)

    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0].nombre).toBe('Barrio Norte')
  })

  it('returns 403 for billing role (missing logistics.read)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    await request(app).get('/api/zonas-entrega').expect(403)
  })
})

// ─── POST /api/zonas-entrega ──────────────────────────────────────────────────

describe('POST /api/zonas-entrega', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  it('creates a zone and returns 201 with the new zone', async () => {
    const newZone = {
      ...ZONE_BASE,
      id: 11,
      nombre: 'Zona Sur',
      tipo: 'manual',
    }
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(newZone),
        update: vi.fn().mockResolvedValue(newZone),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/zonas-entrega')
      .send({ nombre: 'Zona Sur', tipo: 'manual' })
      .expect(201)

    expect(res.body.success).toBe(true)
    expect(res.body.data.nombre).toBe('Zona Sur')
    expect((prisma.deliveryZone.create as ReturnType<typeof vi.fn>)).toHaveBeenCalledOnce()
  })

  it('returns 400 when nombre is missing', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/zonas-entrega')
      .send({ tipo: 'barrio' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/nombre/)
  })

  it('returns 400 when tipo is invalid on create', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/zonas-entrega')
      .send({ nombre: 'Zona', tipo: 'invalid' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/tipo/)
    expect(vi.mocked(prisma.deliveryZone.create)).not.toHaveBeenCalled()
  })

  it('returns 400 when nombre exceeds max length on create', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/zonas-entrega')
      .send({ nombre: 'n'.repeat(61) })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.deliveryZone.create)).not.toHaveBeenCalled()
  })

  it('returns 403 for logistics_planner (has logistics.manage)', async () => {
    // logistics_planner has logistics.manage — should succeed
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/zonas-entrega')
      .send({ nombre: 'Test Zone' })
      .expect(201)

    expect(res.body.success).toBe(true)
  })
})

// ─── PUT /api/zonas-entrega/:id ──────────────────────────────────────────────

describe('PUT /api/zonas-entrega/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('updates the zone and returns the updated data', async () => {
    const updated = { ...ZONE_BASE, nombre: 'Barrio Norte Actualizado', activo: false }
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(ZONE_BASE),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(updated),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/zonas-entrega/10')
      .send({ nombre: 'Barrio Norte Actualizado', activo: false })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.nombre).toBe('Barrio Norte Actualizado')
    expect(res.body.data.activo).toBe(false)
  })

  it('returns 400 when tipo is invalid on update', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/zonas-entrega/10')
      .send({ tipo: 'not-an-enum' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/tipo/)
    expect(vi.mocked(prisma.deliveryZone.update)).not.toHaveBeenCalled()
  })

  it('returns 400 when nombre is empty string on update', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/zonas-entrega/10')
      .send({ nombre: '  ' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.deliveryZone.update)).not.toHaveBeenCalled()
  })

  it('returns 404 when zone does not belong to the tenant', async () => {
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null), // not found
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(null),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/zonas-entrega/999')
      .send({ nombre: 'X' })
      .expect(404)

    expect(res.body.success).toBe(false)
  })

  it('returns 403 for seller role (has logistics.read but not logistics.manage)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    await request(app)
      .put('/api/zonas-entrega/10')
      .send({ nombre: 'X' })
      .expect(403)
  })

  it('updates tipo, diasEntrega and horario fields', async () => {
    const updated = { ...ZONE_BASE, tipo: 'manual', diasEntrega: '2,4', horario: '09:00-13:00' }
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(ZONE_BASE),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(updated),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/zonas-entrega/10')
      .send({ tipo: 'manual', diasEntrega: '2,4', horario: '09:00-13:00' })
      .expect(200)

    expect(res.body.data.tipo).toBe('manual')
    expect(res.body.data.diasEntrega).toBe('2,4')
    expect(res.body.data.horario).toBe('09:00-13:00')
  })
})

// ─── 500 error branches ───────────────────────────────────────────────────────

describe('zonas-entrega 500 error branches', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  it('GET returns 500 when prisma throws', async () => {
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockRejectedValue(new Error('DB error')),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const res = await request(createApp(prisma)).get('/api/zonas-entrega').expect(500)
    expect(res.body.success).toBe(false)
  })

  it('POST returns 500 when prisma.create throws', async () => {
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockRejectedValue(new Error('DB error')),
        update: vi.fn(),
      },
    })
    const res = await request(createApp(prisma))
      .post('/api/zonas-entrega')
      .send({ nombre: 'Zone A' })
      .expect(500)
    expect(res.body.success).toBe(false)
  })

  it('PUT returns 500 when prisma.update throws', async () => {
    const prisma = buildPrismaMock({
      deliveryZone: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(ZONE_BASE),
        create: vi.fn(),
        update: vi.fn().mockRejectedValue(new Error('DB error')),
      },
    })
    const res = await request(createApp(prisma))
      .put('/api/zonas-entrega/10')
      .send({ nombre: 'Zone A' })
      .expect(500)
    expect(res.body.success).toBe(false)
  })
})
