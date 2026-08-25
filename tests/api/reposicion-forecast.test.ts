import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 3,
          codigo: 100,
          descripcion: 'Prod A',
          stock: new Decimal(10),
          minimo: new Decimal(5),
          tipo: 'articulo',
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue({
        id: 3,
        codigo: 100,
        descripcion: 'Prod A',
        stock: new Decimal(10),
        minimo: new Decimal(5),
        tipo: 'articulo',
        esPadre: false,
      }),
      update: vi.fn(),
    },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    proveedorArticulo: {
      findFirst: vi.fn().mockResolvedValue({ precioLista: new Decimal(12) }),
      findMany: vi.fn().mockResolvedValue([
        {
          articuloId: 3,
          proveedorId: 2,
          precioLista: new Decimal(12),
          proveedor: { plazoHabitual: 7 },
        },
      ]),
    },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: 99,
        tenantId: 1,
        proveedorId: 2,
        estado: 'draft',
        total: new Decimal(180),
        fechaEstimada: null,
        nota: 'OC sugerida por reposición (#198)',
        createdAt: new Date(),
        updatedAt: new Date(),
        proveedor: { id: 2, codigo: 1, rsocial: 'Prov SA' },
        items: [
          {
            id: 1,
            ordenCompraId: 99,
            articuloId: 3,
            codigoProveedor: null,
            descripcionProveedor: null,
            cantidad: 15,
            cantidadRecibida: 0,
            costoUnitario: new Decimal(12),
            subtotal: new Decimal(180),
            articulo: { id: 3, codigo: 100, descripcion: 'Prod A' },
          },
        ],
      }),
      update: vi.fn(),
    },
    ordenCompraItem: { deleteMany: vi.fn(), update: vi.fn() },
    stockAjuste: { create: vi.fn() },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
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
    $queryRaw: vi.fn().mockResolvedValue([
      { articuloId: 3, units90: 90n, units60: 60n, units30: 30n },
    ]),
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

function setupAuth(role = 'warehouse_lead') {
  process.env.NODE_ENV = 'test'
  process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  process.env.BIZCODE_TEST_ROLE = role
}

describe('reposicion forecast API (#198)', () => {
  beforeEach(() => {
    setupAuth()
  })

  it('GET /api/articulos/:id/reposicion-forecast returns forecast', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/articulos/3/reposicion-forecast').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ok')
    expect(res.body.data.velocityPerDay).toBeCloseTo(1)
    await assertMatchesOpenApi('/api/articulos/{id}/reposicion-forecast', 'get', '200', res.body)
  })

  it('GET /api/catalogo/reposicion returns candidates', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/catalogo/reposicion?horizonDays=30').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    await assertMatchesOpenApi('/api/catalogo/reposicion', 'get', '200', res.body)
  })

  it('POST orden-compra-sugerida returns prefill', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/catalogo/reposicion/orden-compra-sugerida')
      .send({ proveedorId: 2, articuloIds: [3] })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.prefill.lines.length).toBe(1)
    await assertMatchesOpenApi('/api/catalogo/reposicion/orden-compra-sugerida', 'post', '200', res.body)
  })

  it('returns 403 without products.read', async () => {
    setupAuth('driver')
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/catalogo/reposicion').expect(403)
  })
})
