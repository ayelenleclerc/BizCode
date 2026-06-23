/**
 * @en Mercado Pago reconciliation API tests (#178).
 * @es Tests API reconciliación Mercado Pago (#178).
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
    searchMercadoPagoPayments: vi.fn(),
  }
})

import { searchMercadoPagoPayments } from '../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

const pendingEntry = {
  mpPaymentId: '9001',
  transactionAmount: new Decimal('1500.00'),
  currencyId: 'ARS',
  paymentDate: new Date('2026-06-10T12:00:00.000Z'),
  payerName: 'Juan Perez',
  payerEmail: 'payer@example.com',
  payerIdentification: '20123456789',
  preferenceId: null,
  externalReference: null,
  createdAt: new Date('2026-06-10T12:00:00.000Z'),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME SA' }),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({
        nombre: 'Demo',
        cuit: '30123456789',
        domicilio: '',
        timezone: 'America/Argentina/Buenos_Aires',
      }),
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
    mercadoPagoProcessedPayment: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    mercadoPagoReconciliationEntry: {
      findMany: vi.fn().mockResolvedValue([pendingEntry]),
      findUnique: vi.fn().mockResolvedValue({ ...pendingEntry, estado: 'pending', facturaId: null, reciboCobroId: null }),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ ...pendingEntry, estado: 'reconciled' }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('1500.00'),
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    reciboCobro: {
      aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
      create: vi.fn().mockResolvedValue({ id: 501 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Pago reconciliation API (#178)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(searchMercadoPagoPayments).mockReset()
    vi.mocked(searchMercadoPagoPayments).mockResolvedValue({
      paging: { total: 0, limit: 50, offset: 0 },
      results: [],
    })
  })

  it('GET /api/mercadopago/pagos-sin-reconciliar returns pending list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/mercadopago/pagos-sin-reconciliar').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].mpPaymentId).toBe('9001')
  })

  it('POST /api/mercadopago/reconciliacion/run returns job summary', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/mercadopago/reconciliacion/run').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      processed: 0,
      autoReconciled: 0,
      queued: 0,
      skipped: 0,
    })
  })

  it('POST /api/mercadopago/ignorar marks pending payment ignored', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/mercadopago/ignorar')
      .send({ mpPaymentId: '9001' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.mpPaymentId).toBe('9001')
  })

  it('returns 403 when mercadopago integration is disabled', async () => {
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
    await request(app).get('/api/mercadopago/pagos-sin-reconciliar').expect(403)
  })
})
