import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { Prisma } from '@prisma/client'
import { createApp } from '../../server/createApp'

/** Aggregate result shape returned by prisma.factura.aggregate */
type FacturaAggregateResult = { _count: { id: number }; _sum: { total: string | null } }
type CobroAggregateResult = { _count: { id: number }; _sum: { monto: string | null } }

const EMPTY_FACTURA_AGGREGATE: FacturaAggregateResult = { _count: { id: 0 }, _sum: { total: null } }
const FILLED_FACTURA_AGGREGATE: FacturaAggregateResult = { _count: { id: 3 }, _sum: { total: '150000.00' } }
const EMPTY_COBRO_AGGREGATE: CobroAggregateResult = { _count: { id: 0 }, _sum: { monto: null } }
const FILLED_COBRO_AGGREGATE: CobroAggregateResult = { _count: { id: 2 }, _sum: { monto: '5000.00' } }

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue(EMPTY_FACTURA_AGGREGATE),
    },
    cobro: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue(EMPTY_COBRO_AGGREGATE),
    },
    alertaProveedorConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    reciboPagoFactura: {
      groupBy: vi.fn().mockResolvedValue([]),
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
    $queryRaw: vi
      .fn()
      .mockResolvedValueOnce([{ period: '2026-05-01', count: BigInt(1), total: new Prisma.Decimal(10) }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]),
    ...overrides,
  } as unknown as PrismaClient
}

describe('GET /api/dashboard/summary', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/dashboard/summary').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('returns summary for authenticated owner', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.success).toBe(true)
    const d = res.body.data
    expect(d).toHaveProperty('ventasHoy')
    expect(d).toHaveProperty('facturasVencidas')
    expect(d).toHaveProperty('cobrosHoy')
    expect(d).toHaveProperty('alertasActivas')
    expect(d).toHaveProperty('facturasPagar')
    expect(d.facturasPagar).toEqual({
      vencido: { count: 0, total: '0.00' },
      proximoVencer: { count: 0, total: '0.00' },
    })
  })

  it('returns summary for authenticated seller', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.success).toBe(true)
  })

  it('returns summary for authenticated driver', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.success).toBe(true)
  })

  it('ventasHoy reflects aggregate results', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.factura.aggregate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      FILLED_FACTURA_AGGREGATE,
    )
    ;(prisma.factura.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.ventasHoy.count).toBe(3)
    expect(res.body.data.ventasHoy.total).toBe('150000.00')
  })

  it('facturasVencidas uses creditDays past-due rule', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.factura.aggregate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      EMPTY_FACTURA_AGGREGATE,
    )
    ;(prisma.factura.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        total: new Decimal(1000),
        fecha: new Date('2020-01-01'),
        cliente: { creditDays: 30 },
      },
      {
        total: new Decimal(500),
        fecha: new Date('2099-01-01'),
        cliente: { creditDays: 30 },
      },
    ])
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.facturasVencidas.count).toBe(1)
    expect(res.body.data.facturasVencidas.total).toBe('1000.00')
  })

  it('cobrosHoy reflects cobro aggregate and alertasActivas is zero', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.cobro.aggregate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(FILLED_COBRO_AGGREGATE)
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.cobrosHoy).toEqual({ count: 2, total: '5000.00' })
    expect(res.body.data.alertasActivas).toBe(0)
  })

  it('returns 500 on database error', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.factura.aggregate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('DB connection lost'),
    )
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(500)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('DB connection lost')
  })

  it('calls factura.aggregate once, factura.findMany once, cobro.aggregate once', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).get('/api/dashboard/summary').expect(200)
    expect(prisma.factura.aggregate).toHaveBeenCalledTimes(1)
    expect(prisma.factura.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.cobro.aggregate).toHaveBeenCalledTimes(1)
    expect(prisma.comprobanteCompra.findMany).toHaveBeenCalledTimes(1)
  })

  it('facturasPagar aggregates overdue and due-soon payables', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.comprobanteCompra.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 1,
        proveedorId: 2,
        fecha: new Date('2026-05-01'),
        vencimiento: new Date('2026-05-15'),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        total: new Decimal(800),
        proveedor: {
          id: 2,
          codigo: 10,
          rsocial: 'Proveedor SA',
          plazoHabitual: 0,
          condicionPago: 'contado',
        },
      },
      {
        id: 2,
        proveedorId: 2,
        fecha: new Date('2026-06-01'),
        vencimiento: new Date('2026-06-10'),
        tipo: 'B',
        prefijo: '0001',
        numero: 2,
        total: new Decimal(200),
        proveedor: {
          id: 2,
          codigo: 10,
          rsocial: 'Proveedor SA',
          plazoHabitual: 0,
          condicionPago: 'contado',
        },
      },
    ])
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.facturasPagar.vencido.count).toBeGreaterThanOrEqual(1)
    expect(res.body.data.facturasPagar.proximoVencer.count).toBeGreaterThanOrEqual(0)
  })
})

describe('GET /api/dashboard/ventas-historico', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: '2026-05-01', to: '2026-05-20' })
      .expect(401)
    expect(res.body.error).toBe('Authentication required')
  })

  it('returns 403 for seller without reports permission', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: '2026-05-01', to: '2026-05-20' })
      .expect(403)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for invalid dates', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: 'bad', to: '2026-05-20' })
      .expect(400)
    expect(res.body.success).toBe(false)
  })

  it('returns aggregated JSON for owner', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw)
      .mockReset()
      .mockResolvedValueOnce([{ period: '2026-05-01', count: BigInt(2), total: new Prisma.Decimal(200) }])
      .mockResolvedValueOnce([
        {
          articuloId: 5,
          codigo: 10,
          descripcion: 'Prod',
          quantity: BigInt(4),
          total: new Prisma.Decimal(80),
        },
      ])
      .mockResolvedValueOnce([
        { vendedorId: null, username: null, count: BigInt(2), total: new Prisma.Decimal(200) },
      ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: '2026-05-01', to: '2026-05-20', groupBy: 'week' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.series).toHaveLength(1)
    expect(res.body.data.topArticles).toHaveLength(1)
    expect(res.body.data.bySeller).toHaveLength(1)
  })

  it('returns CSV when Accept is text/csv', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw)
      .mockReset()
      .mockResolvedValueOnce([{ period: '2026-05', count: BigInt(1), total: new Prisma.Decimal(50) }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .set('Accept', 'text/csv')
      .query({ from: '2026-01-01', to: '2026-05-20', groupBy: 'month' })
      .expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain('period,count,total')
  })
})
