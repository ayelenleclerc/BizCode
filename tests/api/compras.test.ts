import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

const ordenIncludeRow = {
  id: 1,
  tenantId: 1,
  proveedorId: 2,
  estado: 'draft',
  total: new Decimal(50),
  fechaEstimada: null,
  nota: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  proveedor: { id: 2, codigo: 1, rsocial: 'Prov SA' },
  items: [
    {
      id: 10,
      ordenCompraId: 1,
      articuloId: 3,
      cantidad: 5,
      cantidadRecibida: 0,
      costoUnitario: new Decimal(10),
      subtotal: new Decimal(50),
      articulo: { id: 3, codigo: 100, descripcion: 'Prod' },
    },
  ],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: {
      findMany: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue({ id: 3, stock: 1 }),
      update: vi.fn().mockResolvedValue({ id: 3, stock: 6 }),
    },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ordenIncludeRow]),
      findFirst: vi.fn().mockResolvedValue(ordenIncludeRow),
      create: vi.fn().mockResolvedValue(ordenIncludeRow),
      update: vi.fn().mockResolvedValue({ ...ordenIncludeRow, estado: 'sent' }),
    },
    ordenCompraItem: { deleteMany: vi.fn(), update: vi.fn().mockResolvedValue({}) },
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

describe('GET /api/compras', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
  })

  it('returns paginated purchase orders', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/compras').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 without suppliers.read', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/compras').expect(403)
  })
})

describe('POST /api/compras/:id/receive', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
  })

  it('returns 403 without inventory.adjust', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 1 }] })
      .expect(403)
  })

  it('receives stock with audit', async () => {
    const sentOrder = { ...ordenIncludeRow, estado: 'sent' }
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = buildPrismaMock({
      auditEvent: { create: auditCreate },
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(sentOrder),
        update: vi.fn().mockResolvedValue({
          ...sentOrder,
          estado: 'received',
          items: [{ ...sentOrder.items[0], cantidadRecibida: 5 }],
        }),
      },
    })
    prisma.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(prisma)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 5 }] })
      .expect(200)
    expect(res.body.data.estado).toBe('received')
    expect(auditCreate).toHaveBeenCalled()
  })
})
