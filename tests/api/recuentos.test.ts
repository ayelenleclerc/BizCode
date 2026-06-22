import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

function buildRecuentoRow(estado: 'in_progress' | 'closed' = 'in_progress', cantFisica: number | null = null) {
  return {
    id: 1,
    tenantId: 1,
    operadorId: 1,
    estado,
    fecha: new Date('2026-05-20T10:00:00Z'),
    closedAt: estado === 'closed' ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    operador: { id: 1, username: 'owner' },
    items: [
      {
        id: 10,
        recuentoId: 1,
        articuloId: 3,
        cantSistema: 5,
        cantFisica,
        articulo: { id: 3, codigo: 100, descripcion: 'Prod' },
      },
    ],
  }
}

const recuentoIncludeRow = buildRecuentoRow()

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 3, stock: 5 }]),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue({ id: 3, stock: 5 }),
      update: vi.fn().mockResolvedValue({ id: 3, stock: 7 }),
    },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn() },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    recuento: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([recuentoIncludeRow]),
      findFirst: vi.fn().mockResolvedValue(recuentoIncludeRow),
      create: vi.fn().mockResolvedValue(recuentoIncludeRow),
      update: vi.fn().mockResolvedValue({ ...recuentoIncludeRow, estado: 'closed', closedAt: new Date() }),
    },
    recuentoItem: { update: vi.fn().mockResolvedValue({}) },
    stockAjuste: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn(), findFirst: vi.fn() },
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

function setupRecuentosAuth(role = 'warehouse_lead') {
  process.env.NODE_ENV = 'test'
  process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  process.env.BIZCODE_TEST_ROLE = role
}

describe('GET /api/recuentos', () => {
  beforeEach(() => {
    setupRecuentosAuth()
  })

  it('returns paginated inventory counts', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/recuentos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 without inventory.count', async () => {
    setupRecuentosAuth('driver')
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/recuentos').expect(403)
  })
})

describe('POST /api/recuentos', () => {
  beforeEach(() => {
    setupRecuentosAuth()
  })

  it('starts inventory count', async () => {
    const prisma = buildPrismaMock({
      recuento: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(recuentoIncludeRow),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/recuentos').expect(201)
    expect(res.body.data.estado).toBe('in_progress')
  })

  it('returns 422 when count already open', async () => {
    const prisma = buildPrismaMock({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 2 }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/recuentos').expect(422)
    expect(res.body.error).toBe('RECUENTO_ALREADY_OPEN')
  })
})

describe('PUT /api/recuentos/:id/items', () => {
  beforeEach(() => {
    setupRecuentosAuth()
  })

  it('updates physical quantities', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/recuentos/1/items')
      .send({ lines: [{ articuloId: 3, cantFisica: 5 }] })
      .expect(200)
    expect(res.body.data.id).toBe(1)
  })
})

describe('POST /api/recuentos/:id/close', () => {
  beforeEach(() => {
    setupRecuentosAuth()
  })

  it('closes count when all items counted', async () => {
    const counted = buildRecuentoRow('in_progress', 7)
    const closed = { ...counted, estado: 'closed' as const, closedAt: new Date() }
    const prisma = buildPrismaMock({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(counted)
          .mockResolvedValueOnce(closed),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(closed),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/recuentos/1/close').expect(200)
    expect(res.body.data.estado).toBe('closed')
  })
})

describe('RECUENTO_IN_PROGRESS stock block', () => {
  beforeEach(() => {
    setupRecuentosAuth()
  })

  it('blocks stock adjustment while count is open', async () => {
    const prisma = buildPrismaMock({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      articulo: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 3, stock: 5, activo: true }),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/articulos/3/stock-ajuste')
      .send({ cantidad: 1, motivo: 'rotura' })
      .expect(422)
    expect(res.body.error).toBe('RECUENTO_IN_PROGRESS')
  })
})
