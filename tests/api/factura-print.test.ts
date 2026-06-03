import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        tipo: 'B',
        prefijo: '0001',
        numero: 77,
        total: 1200,
      }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notaCredito: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null), updateMany: vi.fn(), update: vi.fn() },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue({ id: 1 }) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(prisma)
      return fn
    }),
  } as unknown as PrismaClient
  return prisma
}

describe('POST /api/facturas/:id/print', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.FISCAL_PRINTER_ENABLED
  })

  it('falls back to PDF when fiscal printer is disabled', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app).post('/api/facturas/7/print').send({ device: 'fiscal' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      device: 'fiscal',
      channel: 'pdf',
      fallbackToPdf: true,
      downloadPath: '/api/facturas/7/pdf',
    })
  })

  it('uses fiscal mock channel when enabled', async () => {
    process.env.FISCAL_PRINTER_ENABLED = 'true'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app).post('/api/facturas/7/print').send({ device: 'fiscal' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.device).toBe('fiscal')
    expect(res.body.data.channel).toBe('fiscal_mock')
    expect(res.body.data.fallbackToPdf).toBe(false)
    expect(res.body.data.transport).toBe('mock-serial')
    expect(typeof res.body.data.jobId).toBe('string')
  })

  it('uses thermal mock channel in phase 1', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app).post('/api/facturas/7/print').send({ device: 'thermal' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.device).toBe('thermal')
    expect(res.body.data.channel).toBe('thermal_mock')
    expect(res.body.data.fallbackToPdf).toBe(false)
  })

  it('returns 404 when invoice does not exist for tenant', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.factura.findFirst).mockResolvedValueOnce(null)
    const app = createApp(prisma)

    const res = await request(app).post('/api/facturas/999/print').send({ device: 'pdf' }).expect(404)
    expect(res.body).toEqual({ success: false, error: 'Factura not found' })
  })
})
