import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

function buildPrismaMock(): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    notaCredito: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null), updateMany: vi.fn(), update: vi.fn() },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(prisma)
      return fn
    }),
  } as unknown as PrismaClient
  return prisma
}

describe('GET /api/printing/status', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.FISCAL_PRINTER_ENABLED
    delete process.env.THERMAL_PRINTER_ENABLED
  })

  it('returns mock modes and both printers disabled by default', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/printing/status').expect(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        fiscalPrinterEnabled: false,
        thermalPrinterEnabled: false,
        fiscalMode: 'mock',
        thermalMode: 'mock',
      },
    })
  })

  it('reflects FISCAL_PRINTER_ENABLED=true', async () => {
    process.env.FISCAL_PRINTER_ENABLED = 'true'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/printing/status').expect(200)
    expect(res.body.data.fiscalPrinterEnabled).toBe(true)
    expect(res.body.data.thermalPrinterEnabled).toBe(false)
  })

  it('reflects THERMAL_PRINTER_ENABLED=true', async () => {
    process.env.THERMAL_PRINTER_ENABLED = 'true'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/printing/status').expect(200)
    expect(res.body.data.thermalPrinterEnabled).toBe(true)
  })
})

describe('POST /api/printing/test', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.FISCAL_PRINTER_ENABLED
    delete process.env.THERMAL_PRINTER_ENABLED
  })

  it('thermal falls back to PDF flag when disabled', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/printing/test').send({ device: 'thermal' }).expect(200)
    expect(res.body.data).toMatchObject({
      device: 'thermal',
      channel: 'pdf',
      fallbackToPdf: true,
    })
  })

  it('thermal mock returns jobId when enabled', async () => {
    process.env.THERMAL_PRINTER_ENABLED = 'true'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/printing/test').send({ device: 'thermal' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.device).toBe('thermal')
    expect(res.body.data.channel).toBe('thermal_mock')
    expect(res.body.data.fallbackToPdf).toBe(false)
    expect(typeof res.body.data.jobId).toBe('string')
  })

  it('fiscal falls back to PDF flag when disabled', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/printing/test').send({ device: 'fiscal' }).expect(200)
    expect(res.body.data).toMatchObject({
      device: 'fiscal',
      channel: 'pdf',
      fallbackToPdf: true,
    })
  })

  it('fiscal mock when enabled', async () => {
    process.env.FISCAL_PRINTER_ENABLED = 'true'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/printing/test').send({ device: 'fiscal' }).expect(200)
    expect(res.body.data.channel).toBe('fiscal_mock')
    expect(res.body.data.fallbackToPdf).toBe(false)
  })
})
