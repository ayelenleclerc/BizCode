import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const ARTICULO_ROW = {
  id: 1,
  codigo: 100,
  descripcion: 'Tornillo M8',
  stock: 10,
  minimo: 5,
}

const AJUSTE_ROW = {
  id: 1,
  tenantId: 1,
  articuloId: 1,
  cantidad: -2,
  motivo: 'Rotura',
  userId: 1,
  createdAt: new Date('2026-05-18T12:00:00.000Z'),
  user: { id: 1, username: 'owner1' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const articuloUpdate = vi.fn().mockResolvedValue({ ...ARTICULO_ROW, stock: 8 })
  const stockAjusteCreate = vi.fn().mockResolvedValue(AJUSTE_ROW)

  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue(ARTICULO_ROW),
      findMany: vi.fn().mockResolvedValue([]),
      update: articuloUpdate,
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
    ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }),
    },
    stockAjuste: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([AJUSTE_ROW]),
      create: stockAjusteCreate,
    },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return fn({
          articulo: { update: articuloUpdate },
          stockAjuste: { create: stockAjusteCreate },
        })
      }
      return fn
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('/api/articulos stock', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('POST stock-ajuste applies adjustment and audits', async () => {
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = buildPrismaMock({ auditEvent: { create: auditCreate } })
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/articulos/1/stock-ajuste')
      .send({ cantidad: -2, motivo: 'Rotura' })
      .expect(200)

    expect(res.body.data.stockAfter).toBe(8)
    expect(auditCreate).toHaveBeenCalled()
  })

  it('POST stock-ajuste returns 422 when stock would go negative', async () => {
    const prisma = buildPrismaMock({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ ...ARTICULO_ROW, stock: 1 }),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/articulos/1/stock-ajuste')
      .send({ cantidad: -5, motivo: 'Salida' })
      .expect(422)

    expect(res.body.error).toBe('INSUFFICIENT_STOCK')
  })

  it('GET stock-historial returns paginated rows for owner', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/articulos/1/stock-historial').expect(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('GET stock-historial returns 403 for seller', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/articulos/1/stock-historial').expect(403)
    expect(res.body.success).toBe(false)
  })
})
