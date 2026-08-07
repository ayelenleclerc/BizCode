/**
 * @en Generic payments API routes (#377 DoD).
 * @es Rutas API genéricas de cobros (#377 DoD).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    createMercadoPagoPreference: vi.fn().mockResolvedValue({
      id: 'pref-api',
      init_point: 'https://mp.test/checkout',
      sandbox_init_point: 'https://sandbox.mp.test/checkout',
    }),
    getMercadoPagoUser: vi.fn().mockResolvedValue({ id: 1, nickname: 'demo' }),
  }
})

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
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    paymentProviderConfig: {
      findMany: vi.fn().mockResolvedValue([
        {
          providerCode: 'mercadopago',
          enabled: true,
          isDefault: true,
          environment: 'sandbox',
          accessTokenLast4: '5678',
          publicKey: 'APP_USR-public',
          webhookSecretSet: true,
          lastValidationAt: null,
          validationStatus: null,
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        providerCode: 'mercadopago',
        enabled: true,
        isDefault: true,
      }),
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1, enabled: true, isDefault: true }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    paymentTransaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
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
        mpPreferenceExpiresAt: null,
        mpPagadoAt: null,
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
        cliente: { rsocial: 'ACME SA' },
      }),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 7,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        mpPreferenceId: data.mpPreferenceId ?? 'pref-api',
        mpPaymentLink: data.mpPaymentLink ?? 'https://sandbox.mp.test/checkout',
        mpEstado: data.mpEstado ?? 'pending',
        mpPagadoAt: null,
        mpPreferenceExpiresAt: data.mpPreferenceExpiresAt ?? new Date(Date.now() + 72 * 3600_000),
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
      })),
    },
    $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Payments API (#377)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.clearAllMocks()
  })

  it('GET /api/payments/providers/capabilities lists stubs and Mercado Pago', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/payments/providers/capabilities').expect(200)
    expect(res.body.success).toBe(true)
    const codes = res.body.data.map((d: { provider: string }) => d.provider).sort()
    expect(codes).toEqual(['mercadopago', 'payway', 'stripe'])
  })

  it('POST /api/payments/invoices/:id/checkout creates preference and ledger row', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/payments/invoices/7/checkout').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.provider).toBe('mercadopago')
    expect(res.body.data.preferenceId).toBe('pref-api')
    expect(prisma.paymentTransaction.upsert).toHaveBeenCalled()
  })

  it('GET /api/payments/invoices/:id/status returns normalized status', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/payments/invoices/7/status').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBeDefined()
  })

  it('PATCH /api/payments/providers/config sets default provider', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .patch('/api/payments/providers/config')
      .send({ provider: 'mercadopago', isDefault: true })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data?.provider).toBe('mercadopago')
  })

  it('POST checkout for stub provider returns 501', async () => {
    const app = createApp(
      buildPrismaMock({
        mercadoPagoConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        paymentProviderConfig: {
          findMany: vi.fn().mockResolvedValue([
            {
              providerCode: 'payway',
              enabled: true,
              isDefault: true,
              environment: 'sandbox',
              accessTokenLast4: null,
              publicKey: null,
              webhookSecretSet: false,
              lastValidationAt: null,
              validationStatus: null,
            },
          ]),
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          upsert: vi.fn(),
          update: vi.fn(),
          updateMany: vi.fn(),
        },
      }),
    )
    const res = await request(app).post('/api/payments/invoices/7/checkout').expect(501)
    expect(res.body.error).toBe('PAYMENT_PROVIDER_NOT_IMPLEMENTED')
  })
})
