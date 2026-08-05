/**
 * @en WooCommerce config API tests with mocked REST verification (#188).
 * @es Tests API config WooCommerce con mock de verificación REST (#188).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../apps/server/integrations/woocommerce/woocommerceApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../apps/server/integrations/woocommerce/woocommerceApiClient')
    >()
  return {
    ...actual,
    verifyWooCommerceConnection: vi.fn(),
  }
})

import { verifyWooCommerceConnection } from '../../apps/server/integrations/woocommerce/woocommerceApiClient'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }),
    },
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
        integrations: ['woocommerce'],
        updatedAt: new Date(),
      }),
    },
    wooCommerceConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('WooCommerce config API (#188)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-wc-config'
    process.env.API_PUBLIC_URL = 'http://localhost:3001'
    clearTenantFeaturesCache()
    vi.mocked(verifyWooCommerceConnection).mockReset()
  })

  it('GET /api/configuracion/woocommerce returns connected:false without credentials', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/woocommerce').expect(200)
    expect(res.body).toEqual({
      success: true,
      data: { connected: false, webhookUrl: 'http://localhost:3001/api/webhooks/woocommerce/1' },
    })
    expect(JSON.stringify(res.body)).not.toMatch(/consumerSecret|Encrypted/i)
  })

  it('GET /api/configuracion/woocommerce returns 403 when integration disabled', async () => {
    const app = createApp(
      buildPrismaMock({
        tenantConfig: {
          findUnique: vi.fn().mockResolvedValue({
            tenantId: 1,
            businessType: 'mayorista',
            rubros: [],
            plan: 'pro',
            modules: [],
            integrations: [],
            updatedAt: new Date(),
          }),
        },
      }),
    )
    await request(app).get('/api/configuracion/woocommerce').expect(403)
  })

  it('PUT /api/configuracion/woocommerce rejects invalid credentials before saving', async () => {
    vi.mocked(verifyWooCommerceConnection).mockRejectedValue(
      Object.assign(new Error('Invalid WooCommerce consumer key/secret'), { status: 401 }),
    )
    const upsert = vi.fn()
    const app = createApp(buildPrismaMock({ wooCommerceConfig: { upsert, findUnique: vi.fn() } }))
    const res = await request(app)
      .put('/api/configuracion/woocommerce')
      .send({
        storeUrl: 'https://mitienda.com',
        consumerKey: 'ck_bad',
        consumerSecret: 'cs_bad',
      })
      .expect(401)
    expect(res.body.success).toBe(false)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('PUT /api/configuracion/woocommerce verifies and persists valid credentials', async () => {
    vi.mocked(verifyWooCommerceConnection).mockResolvedValue(undefined)
    const upsert = vi.fn().mockResolvedValue({})
    const findUnique = vi.fn().mockResolvedValue({
      storeUrl: 'https://mitienda.com',
      storeName: null,
      consumerKeyLast4: '_123',
      webhookSecretEncrypted: null,
      activo: true,
      conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
    })
    const app = createApp(buildPrismaMock({ wooCommerceConfig: { upsert, findUnique } }))
    const res = await request(app)
      .put('/api/configuracion/woocommerce')
      .send({
        storeUrl: 'https://mitienda.com',
        consumerKey: 'ck_123',
        consumerSecret: 'cs_123',
      })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.connected).toBe(true)
    expect(res.body.data.webhookUrl).toBe('http://localhost:3001/api/webhooks/woocommerce/1')
    expect(upsert).toHaveBeenCalledOnce()
  })

  it('POST /api/configuracion/woocommerce/verificar re-checks saved credentials', async () => {
    vi.mocked(verifyWooCommerceConnection).mockResolvedValue(undefined)
    const app = createApp(
      buildPrismaMock({
        wooCommerceConfig: {
          findUnique: vi.fn().mockResolvedValue({
            storeUrl: 'https://mitienda.com',
            consumerKeyEncrypted: encryptFiscalSecret('ck_123'),
            consumerSecretEncrypted: encryptFiscalSecret('cs_123'),
          }),
        },
      }),
    )
    const res = await request(app).post('/api/configuracion/woocommerce/verificar').expect(200)
    expect(res.body).toEqual({ success: true, data: { verified: true } })
    expect(verifyWooCommerceConnection).toHaveBeenCalledWith(
      'https://mitienda.com',
      'ck_123',
      'cs_123',
    )
  })

  it('POST /api/configuracion/woocommerce/verificar returns 404 when not connected', async () => {
    const app = createApp(
      buildPrismaMock({ wooCommerceConfig: { findUnique: vi.fn().mockResolvedValue(null) } }),
    )
    await request(app).post('/api/configuracion/woocommerce/verificar').expect(404)
  })

  it('DELETE /api/configuracion/woocommerce disconnects the tenant', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const app = createApp(buildPrismaMock({ wooCommerceConfig: { deleteMany } }))
    const res = await request(app).delete('/api/configuracion/woocommerce').expect(200)
    expect(res.body).toEqual({ success: true, data: { disconnected: true } })
    expect(deleteMany).toHaveBeenCalledWith({ where: { tenantId: 1 } })
  })
})
