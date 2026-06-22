/**
 * @en Mercado Pago invoice payment link API tests (#175).
 * @es Tests API link de pago Mercado Pago por factura (#175).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    createMercadoPagoPreference: vi.fn(),
  }
})

import { createMercadoPagoPreference } from '../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

const futureExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000)

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
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        tenantId: 1,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('2500.00'),
        estado: 'A',
        mpPreferenceId: null,
        mpPaymentLink: null,
        mpEstado: null,
        mpPagadoAt: null,
        mpPreferenceExpiresAt: null,
        cliente: { rsocial: 'ACME SA' },
      }),
      update: vi.fn().mockResolvedValue({
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        mpPreferenceId: 'pref-abc',
        mpPaymentLink: 'https://mp.test/pay',
        mpEstado: 'pending',
        mpPagadoAt: null,
        mpPreferenceExpiresAt: futureExpiry,
      }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Pago invoice payment link API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(createMercadoPagoPreference).mockReset()
    vi.mocked(createMercadoPagoPreference).mockResolvedValue({
      id: 'pref-abc',
      init_point: 'https://mp.test/prod',
      sandbox_init_point: 'https://mp.test/pay',
    })
  })

  it('GET /api/facturas/:id/mp returns payment status', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/facturas/7/mp').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('none')
    expect(res.body.data.amount).toBe('2500.00')
  })

  it('POST /api/facturas/:id/mp/preference creates preference', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/facturas/7/mp/preference').expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('pending')
    expect(res.body.data.paymentLink).toBe('https://mp.test/pay')
    expect(createMercadoPagoPreference).toHaveBeenCalledOnce()
  })

  it('POST /api/facturas/:id/mp/preference returns 409 when active preference exists', async () => {
    const app = createApp(
      buildPrismaMock({
        factura: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue({
            id: 7,
            tenantId: 1,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('2500.00'),
            estado: 'A',
            mpEstado: 'pending',
            mpPreferenceExpiresAt: futureExpiry,
            mpPaymentLink: 'https://mp.test/old',
            mpPreferenceId: 'old-pref',
            mpPagadoAt: null,
            cliente: { rsocial: 'ACME SA' },
          }),
          update: vi.fn(),
        },
      }),
    )
    const res = await request(app).post('/api/facturas/7/mp/preference').expect(409)
    expect(res.body.error).toBe('MP_PREFERENCE_ALREADY_ACTIVE')
  })

  it('returns 403 when mercadopago integration disabled', async () => {
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
    clearTenantFeaturesCache()
    const res = await request(app).post('/api/facturas/7/mp/preference').expect(403)
    expect(res.body.error).toBe('integration_not_enabled')
  })
})
