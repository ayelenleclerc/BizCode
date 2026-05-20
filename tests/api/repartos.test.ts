import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const repartoRow = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-20'),
  choferId: 2,
  estado: 'planned',
  vehiculo: null,
  observaciones: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [],
  progress: { total: 0, delivered: 0, pending: 0 },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn() },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    recuento: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    reparto: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([repartoRow]),
      findFirst: vi.fn().mockResolvedValue(repartoRow),
      create: vi.fn().mockResolvedValue(repartoRow),
      update: vi.fn().mockResolvedValue({ ...repartoRow, estado: 'on_route' }),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ordenEntrega: {
      count: vi.fn(),
      findMany: vi.fn().mockResolvedValue([{ id: 5, estado: 'pending' }]),
      findFirst: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue({ id: 2, role: 'driver', active: true }),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('API /api/repartos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  })

  it('GET /api/repartos returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/repartos').expect(401)
  })

  it('GET /api/repartos returns 403 without logistics.read', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/repartos').expect(403)
  })

  it('GET /api/repartos returns 200 for logistics_planner', async () => {
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/repartos').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('POST /api/repartos returns 403 without orders.dispatch', async () => {
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/repartos')
      .send({ fecha: '2026-05-20', choferId: 2, ordenEntregaIds: [5] })
      .expect(403)
  })

  it('POST /api/repartos creates route with logistics_planner', async () => {
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/repartos')
      .send({ fecha: '2026-05-20', choferId: 2, ordenEntregaIds: [5] })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(1)
  })

  it('POST /api/repartos/:id/iniciar transitions planned to on_route', async () => {
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const prisma = buildPrismaMock({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ ...repartoRow, items: [{ ordenEntregaId: 5, estado: 'pending' }] })
          .mockResolvedValueOnce({ ...repartoRow, estado: 'on_route' }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...repartoRow, estado: 'on_route' }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/repartos/1/iniciar').expect(200)
    expect(res.body.data.estado).toBe('on_route')
  })
})
