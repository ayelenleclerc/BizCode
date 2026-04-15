import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

/** Aggregate result shape returned by prisma.factura.aggregate */
type AggregateResult = { _count: { id: number }; _sum: { total: string | null } }

const EMPTY_AGGREGATE: AggregateResult = { _count: { id: 0 }, _sum: { total: null } }
const FILLED_AGGREGATE: AggregateResult = { _count: { id: 3 }, _sum: { total: '150000.00' } }

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue(EMPTY_AGGREGATE),
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
    ;(prisma.factura.aggregate as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(FILLED_AGGREGATE)  // ventasHoy
      .mockResolvedValueOnce(EMPTY_AGGREGATE)   // facturasVencidas
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.ventasHoy.count).toBe(3)
    expect(res.body.data.ventasHoy.total).toBe('150000.00')
  })

  it('facturasVencidas reflects aggregate results', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.factura.aggregate as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(EMPTY_AGGREGATE)   // ventasHoy
      .mockResolvedValueOnce(FILLED_AGGREGATE)  // facturasVencidas
    const app = createApp(prisma)
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.facturasVencidas.count).toBe(3)
    expect(res.body.data.facturasVencidas.total).toBe('150000.00')
  })

  it('cobrosHoy and alertasActivas are placeholder zeros', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/dashboard/summary').expect(200)
    expect(res.body.data.cobrosHoy).toEqual({ count: 0, total: '0' })
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

  it('calls factura.aggregate twice (ventasHoy + facturasVencidas)', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).get('/api/dashboard/summary').expect(200)
    expect(prisma.factura.aggregate).toHaveBeenCalledTimes(2)
  })
})
