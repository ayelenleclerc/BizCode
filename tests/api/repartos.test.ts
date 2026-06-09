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
    repartoUbicacion: {
      create: vi.fn().mockResolvedValue({
        lat: { toString: () => '-34.6' },
        lng: { toString: () => '-58.4' },
        recordedAt: new Date('2026-05-26T12:00:00.000Z'),
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ordenEntrega: {
      count: vi.fn(),
      findMany: vi.fn().mockResolvedValue([{ id: 5, estado: 'ready' }]),
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

  it('GET /api/repartos/activos returns 403 for driver', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/repartos/activos').expect(403)
  })

  it('GET /api/repartos/activos returns 200 for logistics_planner', async () => {
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const activo = {
      ...repartoRow,
      estado: 'on_route',
      items: [
        {
          secuencia: 1,
          estado: 'pending',
          ordenEntrega: {
            cliente: { id: 1, codigo: 1, rsocial: 'Cliente', domicilio: null },
            zona: null,
          },
        },
      ],
    }
    const prisma = buildPrismaMock({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn().mockResolvedValue([activo]),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoUbicacion: {
        create: vi.fn(),
        deleteMany: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/repartos/activos').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('POST /api/repartos/:id/ubicacion records position for driver on_route', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const prisma = buildPrismaMock({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, choferId: 2, estado: 'on_route', tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/repartos/1/ubicacion')
      .send({ lat: -34.6, lng: -58.4 })
      .expect(200)
    expect(res.body.data.lat).toBeCloseTo(-34.6)
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

const TEST_FIRMA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('API /api/repartos POD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  })

  it('PUT item pod returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    await request(app)
      .put('/api/repartos/1/items/10')
      .send({ outcome: 'delivered', receptorNombre: 'A', firmaBase64: TEST_FIRMA })
      .expect(401)
  })

  it('PUT item pod returns 403 without orders.deliver.confirm', async () => {
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const app = createApp(buildPrismaMock())
    await request(app)
      .put('/api/repartos/1/items/10')
      .send({ outcome: 'delivered', receptorNombre: 'A', firmaBase64: TEST_FIRMA })
      .expect(403)
  })

  it('PUT item pod returns 200 for driver on own route', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const itemBase = {
      id: 10,
      repartoId: 1,
      ordenEntregaId: 5,
      secuencia: 1,
      estado: 'pending',
      entregadoAt: null,
      motivoNoEntrega: null,
      receptorNombre: null,
      receptorDni: null,
      notasEntrega: null,
      podMedia: null,
      ordenEntrega: {
        id: 5,
        tenantId: 1,
        clienteId: 1,
        estado: 'in_transit',
        fecha: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
        zona: null,
        factura: null,
      },
    }
    const prisma = buildPrismaMock({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 2, tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(itemBase),
        update: vi.fn().mockResolvedValue({
          ...itemBase,
          estado: 'delivered',
          entregadoAt: new Date(),
          receptorNombre: 'Ana',
          podMedia: { firmaBase64: TEST_FIRMA },
        }),
        updateMany: vi.fn(),
      },
      ordenEntrega: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn(),
      },
    })
    prisma.$transaction = vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
      return arg
    }) as PrismaClient['$transaction']
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/repartos/1/items/10')
      .send({ outcome: 'delivered', receptorNombre: 'Ana', firmaBase64: TEST_FIRMA })
      .expect(200)
    expect(res.body.data.estado).toBe('delivered')
    expect(res.body.data.hasPod).toBe(true)
  })

  it('GET pod returns 403 for driver', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/repartos/1/items/10/pod').expect(403)
  })

  it('GET pod returns 200 for logistics_planner', async () => {
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const itemRow = {
      id: 10,
      repartoId: 1,
      ordenEntregaId: 5,
      secuencia: 1,
      estado: 'delivered',
      entregadoAt: new Date(),
      motivoNoEntrega: null,
      receptorNombre: 'Ana',
      receptorDni: null,
      notasEntrega: null,
      podMedia: { firmaBase64: TEST_FIRMA },
      ordenEntrega: {
        id: 5,
        tenantId: 1,
        clienteId: 1,
        estado: 'delivered',
        fecha: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
        zona: null,
        factura: null,
      },
    }
    const prisma = buildPrismaMock({
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(itemRow),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/repartos/1/items/10/pod').expect(200)
    expect(res.body.data.podMedia.firmaBase64).toBe(TEST_FIRMA)
  })
})
