import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import {
  bucketLabelForDaysPastDue,
  buildAgingFromInvoices,
  computeDaysPastDue,
} from '../../server/services/ReportesFinancierosService'
import { Decimal } from '@prisma/client/runtime/library'

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
    movimientoClienteCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    paramEmpresa: { findFirst: vi.fn().mockResolvedValue(null) },
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

describe('ReportesFinancierosService helpers', () => {
  it('assigns bucket by days past due', () => {
    expect(bucketLabelForDaysPastDue(0)).toBe('0-30d')
    expect(bucketLabelForDaysPastDue(30)).toBe('0-30d')
    expect(bucketLabelForDaysPastDue(31)).toBe('31-60d')
    expect(bucketLabelForDaysPastDue(91)).toBe('>90d')
  })

  it('uses creditDays for due date', () => {
    const invoiceDate = new Date('2026-01-01')
    const asOf = new Date('2026-02-15')
    expect(computeDaysPastDue(invoiceDate, 30, asOf)).toBe(15)
    expect(computeDaysPastDue(invoiceDate, 60, asOf)).toBe(0)
  })

  it('builds aging buckets from invoice totals', () => {
    const asOf = new Date('2026-05-15')
    const result = buildAgingFromInvoices(
      [
        {
          total: new Decimal(100),
          fecha: new Date('2026-01-01'),
          cliente: { creditDays: 30 },
        },
        {
          total: new Decimal(200),
          fecha: new Date('2026-05-01'),
          cliente: { creditDays: 30 },
        },
      ],
      asOf,
    )
    expect(result.totalDeuda).toBe('300.00')
    expect(result.resumen.deudaVencida).toBe('100.00')
    expect(result.resumen.deudaPorVencer).toBe('200.00')
    const bucket030 = result.buckets.find((b) => b.label === '0-30d')
    const bucket90 = result.buckets.find((b) => b.label === '>90d')
    expect(bucket030?.count).toBe(1)
    expect(bucket030?.total).toBe('200.00')
    expect(bucket90?.count).toBe(1)
    expect(bucket90?.total).toBe('100.00')
  })
})

describe('GET /api/reportes/aging', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
  })

  it('returns aging summary', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            total: new Decimal(500),
            fecha: new Date('2026-01-01'),
            cliente: { creditDays: 30 },
          },
        ]),
        aggregate: vi.fn(),
        findFirst: vi.fn(),
      },
      cliente: { count: vi.fn().mockResolvedValue(2), findMany: vi.fn(), findFirst: vi.fn() },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/aging').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.buckets).toHaveLength(4)
    expect(res.body.data.totalDeuda).toBe('500.00')
    expect(res.body.data.resumen.clientesSuspendidos).toBe(2)
  })

  it('returns 403 without reports.financial.read', async () => {
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/reportes/aging').expect(403)
  })
})

describe('GET /api/reportes/cuenta-corriente/:clienteId', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('returns 404 when cliente missing', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/reportes/cuenta-corriente/99').expect(404)
    expect(res.body.error).toBe('Cliente not found')
  })

  it('returns ordered lines with running balance', async () => {
    const prisma = buildPrismaMock({
      cliente: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          codigo: 1001,
          rsocial: 'ACME',
          balance: new Decimal(750),
          balanceInicial: new Decimal(0),
        }),
        count: vi.fn(),
        findMany: vi.fn(),
      },
      movimientoClienteCC: {
        findFirst: vi.fn().mockResolvedValue({
          id: 2,
          saldoPost: new Decimal(750),
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            tipo: 'factura',
            referencia: 'B-0001-10',
            monto: new Decimal(1000),
            saldoPost: new Decimal(1000),
            fecha: new Date('2026-05-01'),
            facturaId: 1,
            cobroId: null,
          },
          {
            id: 2,
            tipo: 'cobro',
            referencia: 'REC-1',
            monto: new Decimal(-250),
            saldoPost: new Decimal(750),
            fecha: new Date('2026-05-10'),
            facturaId: null,
            cobroId: 5,
          },
        ]),
        count: vi.fn(),
        create: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/cuenta-corriente/1').expect(200)
    expect(res.body.data.lineas).toHaveLength(2)
    expect(res.body.data.lineas[0].tipo).toBe('factura')
    expect(res.body.data.lineas[0].saldo).toBe('1000.00')
    expect(res.body.data.lineas[1].tipo).toBe('cobro')
    expect(res.body.data.lineas[1].saldo).toBe('750.00')
  })

  it('returns 400 for invalid clienteId', async () => {
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/reportes/cuenta-corriente/abc').expect(400)
  })
})
