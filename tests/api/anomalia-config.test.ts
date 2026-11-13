import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { createCcTxLayer } from '../helpers/movimientoClienteCcPrismaMock'
import { assertMatchesOpenApi } from './validate-openapi-response'

const NOW = new Date('2026-11-12T12:00:00.000Z')

const CONFIG_ROW = {
  id: 1,
  tenantId: 1,
  minHistory: 20,
  zScoreThreshold: 3,
  discountThresholdPct: 40,
  newCustomerCreditFraction: 0.5,
  createdAt: NOW,
  updatedAt: NOW,
}

const CLIENTE_BASE = {
  id: 1,
  codigo: 1001,
  rsocial: 'ACME SA',
  suspended: false,
  creditLimit: null,
  balance: 0,
}

const ARTICULO_STOCK = {
  id: 1,
  codigo: 10,
  descripcion: 'Producto',
  stock: 100,
  minimo: 8,
  tipo: 'articulo',
  condIva: '1',
  unidadServicio: null,
}

describe('GET/PUT /api/anomalias/config (#200 residual)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns 403 for seller without settings.business.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const prisma = {
      configAnomaliaFactura: { findUnique: vi.fn() },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma)).get('/api/anomalias/config')
    expect(res.status).toBe(403)
    await assertMatchesOpenApi('/api/anomalias/config', 'get', '403', res.body)
  })

  it('GET lazy-creates config with MVP defaults', async () => {
    const create = vi.fn().mockResolvedValue(CONFIG_ROW)
    const prisma = {
      configAnomaliaFactura: {
        findUnique: vi.fn().mockResolvedValue(null),
        create,
      },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma)).get('/api/anomalias/config').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.discountThresholdPct).toBe(40)
    expect(create).toHaveBeenCalled()
    await assertMatchesOpenApi('/api/anomalias/config', 'get', '200', res.body)
  })

  it('PUT upserts thresholds and audits', async () => {
    const upsert = vi.fn().mockResolvedValue({
      ...CONFIG_ROW,
      discountThresholdPct: 45,
    })
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = {
      configAnomaliaFactura: { upsert },
      auditEvent: { create: auditCreate },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma))
      .put('/api/anomalias/config')
      .send({
        minHistory: 20,
        zScoreThreshold: 3,
        discountThresholdPct: 45,
        newCustomerCreditFraction: 0.5,
      })
      .expect(200)
    expect(res.body.data.discountThresholdPct).toBe(45)
    expect(upsert).toHaveBeenCalled()
    expect(auditCreate.mock.calls.some((c) => c[0]?.data?.action === 'anomalia_config_update')).toBe(
      true,
    )
    await assertMatchesOpenApi('/api/anomalias/config', 'put', '200', res.body)
  })

  it('POST /api/facturas respects tenant discountThresholdPct=40 (no soft warning at 35%)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const facturaCreate = vi.fn().mockResolvedValue({
      id: 99,
      fecha: '2026-08-26',
      tipo: 'B',
      prefijo: '0001',
      numero: 3,
      clienteId: 1,
      estado: 'A',
      items: [{ id: 1, facturaId: 99, articuloId: 1, cantidad: 1, precio: 1000, dscto: 35, subtotal: 650 }],
      cliente: CLIENTE_BASE,
      total: 650,
    })
    const articuloUpdate = vi.fn().mockResolvedValue({ ...ARTICULO_STOCK, stock: 99 })
    const body = {
      fecha: '2026-08-26',
      tipo: 'B' as const,
      prefijo: '0001',
      numero: 3,
      clienteId: 1,
      neto1: 537.19,
      neto2: 0,
      neto3: 0,
      iva1: 112.81,
      iva2: 0,
      total: 650,
      formaPagoId: null,
      items: [{ articuloId: 1, cantidad: 1, precio: 1000.0, dscto: 35, subtotal: 650.0 }],
    }
    const prisma = {
      deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([ARTICULO_STOCK]),
        update: articuloUpdate,
      },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
      },
      anomaliaDetectada: { createMany: vi.fn() },
      configAnomaliaFactura: {
        findUnique: vi.fn().mockResolvedValue(CONFIG_ROW),
      },
      cobro: { findMany: vi.fn().mockResolvedValue([]) },
      ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      auditEvent: { create: vi.fn() },
      recuento: { findFirst: vi.fn().mockResolvedValue(null) },
      appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      tenant: {
        findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') {
          return fn(
            createCcTxLayer({
              factura: { create: facturaCreate },
              articulo: { update: articuloUpdate },
            }),
          )
        }
        return fn
      }),
    } as unknown as PrismaClient

    const res = await request(createApp(prisma)).post('/api/facturas').send(body).expect(200)
    expect(res.body.success).toBe(true)
    const warnings = (res.body.warnings ?? []) as Array<{ tipo: string }>
    expect(warnings.some((w) => w.tipo === 'descuento_excesivo')).toBe(false)
  })
})
