import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    $queryRaw: vi
      .fn()
      .mockResolvedValueOnce([{ count: BigInt(10) }])
      .mockResolvedValueOnce([{ count: BigInt(8) }])
      .mockResolvedValueOnce([{ avg_seconds: 2730 }])
      .mockResolvedValueOnce([{ motivo: 'ausente', count: BigInt(2) }])
      .mockResolvedValueOnce([{ count: BigInt(3) }]),
    deliveryZone: { findFirst: vi.fn() },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn() },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    recuento: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    reparto: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    repartoUbicacion: { create: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    repartoItem: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    ordenEntrega: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: { create: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    tenantModule: { findMany: vi.fn().mockResolvedValue([{ moduleKey: 'logistics.dispatches' }]) },
    tenantConfig: { findFirst: vi.fn() },
    tenantPlan: { findFirst: vi.fn() },
    pedido: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    empresa: { findFirst: vi.fn() },
    stockAjuste: { findMany: vi.fn() },
  } as unknown as PrismaClient
}

describe('GET /api/logistica/* (#145)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('GET /api/logistica/kpis returns 200', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.dispatchedCount).toBe(10)
    expect(res.body.data.firstVisitRate).toBe(0.8)
  })

  it('GET /api/logistica/kpis returns 400 for invalid dates', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app)
      .get('/api/logistica/kpis')
      .query({ from: 'not-a-date', to: '2026-05-31' })
      .expect(400)
  })

  it('GET /api/logistica/kpis returns 400 when from is after to', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-31', to: '2026-05-01' })
      .expect(400)
  })

  it('GET /api/logistica/kpis returns 400 for invalid choferId', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31', choferId: '0' })
      .expect(400)
  })

  it('GET /api/logistica/kpis returns 400 when from is missing', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).get('/api/logistica/kpis').query({ to: '2026-05-31' }).expect(400)
  })

  it('GET /api/logistica/kpis returns 500 when query fails', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('db down'))
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(500)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/logistica/kpis returns 403 for driver', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(403)
  })

  it('GET /api/logistica/reporte-choferes returns JSON', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        chofer_id: 2,
        chofer_username: 'driver1',
        day: new Date('2026-05-20'),
        dispatched: BigInt(5),
        delivered: BigInt(4),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-choferes')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].choferUsername).toBe('driver1')
  })

  it('GET /api/logistica/reporte-choferes returns CSV', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        chofer_id: 2,
        chofer_username: 'driver1',
        day: new Date('2026-05-20'),
        dispatched: BigInt(5),
        delivered: BigInt(4),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-choferes')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .set('Accept', 'text/csv')
      .expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain('driver1')
  })

  it('GET /api/logistica/reporte-zonas returns JSON', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        zona_id: 1,
        zona_nombre: 'Norte',
        dispatched: BigInt(6),
        delivered: BigInt(5),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    expect(res.body.data[0].zonaNombre).toBe('Norte')
  })

  it('GET /api/logistica/kpis filters by choferId', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31', choferId: '2' })
      .expect(200)
    expect(res.body.data.dispatchedCount).toBe(10)
    expect(prisma.$queryRaw).toHaveBeenCalled()
  })

  it('GET /api/logistica/reporte-choferes returns 500 on failure', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('db'))
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-choferes')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(500)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/logistica/reporte-zonas returns CSV', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        zona_id: 1,
        zona_nombre: 'Sur',
        dispatched: BigInt(1),
        delivered: BigInt(1),
        not_delivered: BigInt(0),
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31', choferId: '4' })
      .set('Accept', 'text/csv')
      .expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain('Sur')
  })

  it('GET /api/logistica/reporte-zonas forwards choferId to service query', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        zona_id: 1,
        zona_nombre: 'Norte',
        dispatched: BigInt(2),
        delivered: BigInt(2),
        not_delivered: BigInt(0),
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31', choferId: '7' })
      .expect(200)
    expect(res.body.data).toHaveLength(1)
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1)
  })

  it('GET /api/logistica/reporte-zonas returns 500 on failure', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('db'))
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(500)
    expect(res.body.success).toBe(false)
  })
})
