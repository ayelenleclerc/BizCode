import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA' }
const DRIVER_USER = { id: 5, username: 'driver1', role: 'driver' as const }

const ORDEN_BASE = {
  id: 1,
  tenantId: 1,
  facturaId: null,
  clienteId: 1,
  zonaId: 10,
  driverId: 5,
  fecha: new Date('2026-05-16T12:00:00.000Z'),
  estado: 'in_transit',
  nota: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: CLIENTE_REF,
  zona: { id: 10, nombre: 'Norte' },
  driver: DRIVER_USER,
  factura: null,
}

const ORDEN_CREATE_BODY = {
  clienteId: 1,
  fecha: '2026-05-16',
  zonaId: 10,
  driverId: 5,
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 10, tenantId: 1 }),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
    },
    ordenEntrega: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ORDEN_BASE]),
      findFirst: vi.fn().mockResolvedValue(ORDEN_BASE),
      create: vi.fn().mockResolvedValue({ ...ORDEN_BASE, id: 2, estado: 'assigned' }),
      update: vi.fn().mockResolvedValue({ ...ORDEN_BASE, estado: 'delivered' }),
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
      findFirst: vi.fn().mockResolvedValue(DRIVER_USER),
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

describe('GET /api/ordenes-entrega', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
  })

  it('returns paginated orders for logistics_planner', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/ordenes-entrega').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].estado).toBe('in_transit')
  })

  it('returns 403 for billing role', async () => {
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/ordenes-entrega').expect(403)
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('forces driverId filter for driver role', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const findMany = vi.fn().mockResolvedValue([ORDEN_BASE])
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn().mockResolvedValue(1),
        findMany,
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    await request(app).get('/api/ordenes-entrega?driverId=99').expect(200)
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ driverId: 0 }),
      }),
    )
    delete process.env.BIZCODE_TEST_ROLE
  })
})

describe('POST /api/ordenes-entrega', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  it('creates order and writes audit', async () => {
    const create = vi.fn().mockResolvedValue({ ...ORDEN_BASE, id: 2, estado: 'assigned' })
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create,
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/ordenes-entrega').send(ORDEN_CREATE_BODY).expect(201)
    expect(res.body.data.id).toBe(2)
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('returns 403 without orders.create', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    await request(app).post('/api/ordenes-entrega').send(ORDEN_CREATE_BODY).expect(403)
    delete process.env.BIZCODE_TEST_ROLE
  })
})

describe('PUT /api/ordenes-entrega/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('transitions to delivered with entrega_confirmed audit', async () => {
    const update = vi.fn().mockResolvedValue({ ...ORDEN_BASE, estado: 'delivered' })
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ ...ORDEN_BASE, estado: 'in_transit' }),
        create: vi.fn(),
        update,
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/ordenes-entrega/1')
      .send({ estado: 'delivered' })
      .expect(200)
    expect(res.body.data.estado).toBe('delivered')
    expect(prisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'entrega_confirmed' }),
      }),
    )
  })

  it('returns 422 on invalid transition', async () => {
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ ...ORDEN_BASE, estado: 'pending' }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/ordenes-entrega/1')
      .send({ estado: 'delivered' })
      .expect(422)
    expect(res.body.error).toContain('Invalid transition')
  })

  it('allows driver to confirm own in_transit order', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const update = vi.fn().mockResolvedValue({ ...ORDEN_BASE, estado: 'delivered', driverId: 0 })
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ ...ORDEN_BASE, driverId: 0, estado: 'in_transit' }),
        create: vi.fn(),
        update,
      },
    })
    const app = createApp(prisma)
    await request(app).put('/api/ordenes-entrega/1').send({ estado: 'delivered' }).expect(200)
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('returns 403 when driver tries another drivers order', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const prisma = buildPrismaMock({
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ ...ORDEN_BASE, driverId: 99, estado: 'in_transit' }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    await request(app).put('/api/ordenes-entrega/1').send({ estado: 'delivered' }).expect(403)
    delete process.env.BIZCODE_TEST_ROLE
  })
})
