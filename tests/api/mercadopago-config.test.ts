/**
 * @en Mercado Pago tenant config API tests (#174).
 * @es Tests API configuración Mercado Pago por tenant (#174).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    fetchMercadoPagoUserMe: vi.fn(),
  }
})

import { fetchMercadoPagoUserMe, MercadoPagoApiError } from '../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
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
        integrations: ['mercadopago'],
        updatedAt: new Date(),
      }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        publicKey: 'APP_USR-public',
        sandboxMode: true,
        activo: true,
        accessTokenLast4: '5678',
        webhookSecretEncrypted: encryptFiscalSecret('whsec'),
        accessTokenEncrypted: encryptFiscalSecret('TEST-access-token-5678'),
      }),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Pago config API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(fetchMercadoPagoUserMe).mockReset()
  })

  it('GET /api/configuracion/mercadopago returns metadata without secrets', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/mercadopago').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.configured).toBe(true)
    expect(res.body.data.publicKey).toBe('APP_USR-public')
    expect(res.body.data.accessTokenLast4).toBe('5678')
    expect(res.body.data.webhookSecretSet).toBe(true)
    expect(JSON.stringify(res.body)).not.toMatch(/TEST-access-token/)
  })

  it('GET returns 403 when mercadopago integration is disabled', async () => {
    const app = createApp(
      buildPrismaMock({
        tenantConfig: {
          findUnique: vi.fn().mockResolvedValue({
            tenantId: 1,
            integrations: [],
            modules: [],
          }),
        },
      }),
    )
    const res = await request(app).get('/api/configuracion/mercadopago').expect(403)
    expect(res.body.error).toBe('integration_not_enabled')
  })

  it('PUT /api/configuracion/mercadopago does not echo access token', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/configuracion/mercadopago')
      .send({
        accessToken: 'TEST-access-token-new1234',
        publicKey: 'APP_USR-public-new',
        webhookSecret: 'whsec-new',
        sandboxMode: false,
        activo: true,
      })
      .expect(200)
    expect(res.body.data.configured).toBe(true)
    expect(JSON.stringify(res.body)).not.toMatch(/TEST-access-token-new1234/)
  })

  it('POST /api/configuracion/mercadopago/test returns account on success', async () => {
    vi.mocked(fetchMercadoPagoUserMe).mockResolvedValue({
      nickname: 'Biz Demo',
      email: 'pay@demo.test',
    })
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/configuracion/mercadopago/test').expect(200)
    expect(res.body.data.accountName).toBe('Biz Demo')
    expect(res.body.data.email).toBe('pay@demo.test')
  })

  it('POST test returns descriptive error for invalid credentials', async () => {
    vi.mocked(fetchMercadoPagoUserMe).mockRejectedValue(
      new MercadoPagoApiError(401, 'Invalid Mercado Pago credentials'),
    )
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/configuracion/mercadopago/test').expect(422)
    expect(res.body.error).toBe('Invalid Mercado Pago credentials')
  })
})
