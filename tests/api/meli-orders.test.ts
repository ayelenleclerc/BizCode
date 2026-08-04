/**
 * @en Mercado Libre orders API tests (#186).
 * @es Tests API de órdenes Mercado Libre (#186).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        businessType: 'mayorista',
        rubros: [],
        plan: 'pro',
        modules: ['billing.orders'],
        integrations: ['meli'],
        updatedAt: new Date(),
      }),
    },
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        sitio: 'MLA',
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('access'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh'),
        meliUserId: '1',
      }),
    },
    meliOrden: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          meliOrderId: '2000003509',
          status: 'paid',
          shippingId: '99',
          isFulfillment: false,
          buyerNickname: 'BUYERML',
          cuitPending: true,
          stockAppliedAt: new Date('2026-08-01T12:00:00.000Z'),
          lastSyncedAt: new Date('2026-08-01T12:00:00.000Z'),
          pedidoId: 50,
          pedido: {
            id: 50,
            estado: 'confirmed',
            total: 1500,
            facturaId: null,
            clienteId: 20,
            cliente: { rsocial: 'BUYERML', cuit: null },
          },
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        meliOrderId: '2000003509',
        status: 'paid',
        pedido: {
          id: 50,
          estado: 'confirmed',
          facturaId: null,
          cliente: { id: 20, cuit: null, condIva: 'CF' },
        },
      }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Libre orders API (#186)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-meli-orders'
    clearTenantFeaturesCache()
  })

  it('GET /api/meli/ordenes lists imported orders', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/meli/ordenes').query({ estado: 'pendiente' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].meliOrderId).toBe('2000003509')
    expect(res.body.data[0].cuitPending).toBe(true)
  })

  it('POST /api/meli/ordenes/:id/facturar returns CUIT_REQUIRED_FOR_FACTURA_A', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/meli/ordenes/2000003509/facturar')
      .send({ fecha: '2026-08-04', tipo: 'A', numero: 1, prefijo: '0001', formaPagoId: 1 })
      .expect(422)
    expect(res.body.error).toBe('CUIT_REQUIRED_FOR_FACTURA_A')
  })
})
