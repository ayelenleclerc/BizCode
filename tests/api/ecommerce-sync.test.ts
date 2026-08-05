/**
 * @en Ecommerce sync API tests (#189).
 * @es Tests API de sync eCommerce (#189).
 * @pt-BR Testes API de sync eCommerce (#189).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
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
        modules: [],
        integrations: ['meli'],
        updatedAt: new Date(),
      }),
    },
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({ activo: true }),
    },
    tiendanubeConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    wooCommerceConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    syncLog: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          connectorType: 'meli',
          operation: 'update_stock',
          status: 'success',
          errorMsg: null,
          jobId: 9,
          createdAt: new Date('2026-08-04T12:00:00.000Z'),
        },
      ]),
    },
    ecommerceSyncJob: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ecommerce sync API (#189)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-ecommerce-sync'
    clearTenantFeaturesCache()
  })

  it('GET /api/ecommerce/connectors lists known connectors', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/ecommerce/connectors').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ connectorType: 'meli', status: 'active', registered: true }),
        expect.objectContaining({
          connectorType: 'tiendanube',
          status: 'not_configured',
          registered: true,
        }),
        expect.objectContaining({
          connectorType: 'woocommerce',
          status: 'not_configured',
          registered: true,
        }),
      ]),
    )
  })

  it('GET /api/ecommerce/sync-logs returns filtered rows', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/ecommerce/sync-logs')
      .query({ connectorType: 'meli', status: 'success' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].operation).toBe('update_stock')
    expect(res.body.total).toBe(1)
  })
})
