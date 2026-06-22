import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { periodKeyForDate } from '../../apps/server/reportesPeriodUtils'
import { ReportesOperacionalesService } from '../../apps/server/services/ReportesOperacionalesService'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn() },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
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

describe('reportesPeriodUtils', () => {
  it('groups by day, week monday, and month', () => {
    const wed = new Date(2026, 4, 13, 15, 0, 0)
    expect(periodKeyForDate(wed, 'dia')).toBe('2026-05-13')
    expect(periodKeyForDate(wed, 'semana')).toBe('2026-05-11')
    expect(periodKeyForDate(wed, 'mes')).toBe('2026-05')
  })
})

describe('ReportesOperacionalesService', () => {
  it('returns empty ventas for empty period', async () => {
    const prisma = buildPrismaMock()
    const svc = new ReportesOperacionalesService(prisma)
    const from = new Date(2026, 0, 1)
    const to = new Date(2026, 0, 31)
    const rows = await svc.getVentasPorPeriodo(1, from, to, 'dia')
    expect(rows).toEqual([])
  })

  it('aggregates ventas by day', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            fecha: new Date(2026, 0, 10),
            total: new Decimal(100),
            neto1: new Decimal(80),
            neto2: new Decimal(0),
            iva1: new Decimal(20),
            iva2: new Decimal(0),
          },
          {
            fecha: new Date(2026, 0, 10),
            total: new Decimal(50),
            neto1: new Decimal(40),
            neto2: new Decimal(0),
            iva1: new Decimal(10),
            iva2: new Decimal(0),
          },
        ]),
      },
    })
    const svc = new ReportesOperacionalesService(prisma)
    const rows = await svc.getVentasPorPeriodo(
      1,
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
      'dia',
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.periodo).toBe('2026-01-10')
    expect(rows[0]?.count).toBe(2)
    expect(rows[0]?.total).toBe('150.00')
  })

  it('lists only critical stock rows', async () => {
    const prisma = buildPrismaMock({
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, codigo: 1, descripcion: 'A', stock: 2, minimo: 5 },
          { id: 2, codigo: 2, descripcion: 'B', stock: 10, minimo: 5 },
        ]),
      },
    })
    const svc = new ReportesOperacionalesService(prisma)
    const rows = await svc.getStockCritico(1)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.deficit).toBe(3)
  })
})

describe('GET /api/reportes/ventas', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('returns ventas JSON', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            fecha: new Date(2026, 0, 5),
            total: new Decimal(10),
            neto1: new Decimal(8),
            neto2: new Decimal(0),
            iva1: new Decimal(2),
            iva2: new Decimal(0),
          },
        ]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/ventas')
      .query({ from: '2026-01-01', to: '2026-01-31', agrupar: 'dia' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns ventas CSV', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/ventas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .set('Accept', 'text/csv')
      .expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain('periodo,count,total')
  })

  it('returns 403 for finance role without operational', async () => {
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(buildPrismaMock())
    await request(app)
      .get('/api/reportes/ventas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .expect(403)
  })
})

describe('GET /api/reportes/stock-critico', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('returns stock critico JSON', async () => {
    const prisma = buildPrismaMock({
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, codigo: 1, descripcion: 'X', stock: 1, minimo: 2 },
        ]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/stock-critico').expect(200)
    expect(res.body.data[0].deficit).toBe(1)
  })
})

describe('GET /api/reportes/cobranzas', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('returns cobranzas grouped by day', async () => {
    const prisma = buildPrismaMock({
      cobro: {
        findMany: vi.fn().mockResolvedValue([
          {
            fecha: new Date(2026, 0, 15, 10, 0, 0),
            monto: new Decimal(100),
            formaPagoId: 1,
            formaPago: { id: 1, descripcion: 'Efectivo' },
          },
        ]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/cobranzas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .expect(200)
    expect(res.body.data[0].fecha).toBe('2026-01-15')
    expect(res.body.data[0].porFormaPago[0].descripcion).toBe('Efectivo')
  })

  it('returns 403 for warehouse_op without financial', async () => {
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    const app = createApp(buildPrismaMock())
    await request(app)
      .get('/api/reportes/cobranzas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .expect(403)
  })
})
