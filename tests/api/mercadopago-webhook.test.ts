/**
 * @en Mercado Pago webhook API tests (#176).
 * @es Tests API webhook Mercado Pago (#176).
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import {
  buildMercadoPagoSignatureManifest,
  computeMercadoPagoSignatureHmac,
} from '../../apps/server/lib/mercadopagoSignature'

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    fetchMercadoPagoPayment: vi.fn(),
  }
})

const reciboCreateMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: {
      id: 50,
      numero: 3,
      clienteId: 2,
      fecha: '2026-06-17',
      totalCobrado: '2500.00',
      estado: 'emitido',
      concepto: null,
      formas: [],
      imputaciones: [],
      retenciones: [],
      montoBruto: '2500.00',
      cliente: { id: 2, codigo: 1, rsocial: 'ACME', cuit: null },
      usuario: { id: 1, username: 'owner' },
    },
  }),
)

vi.mock('../../apps/server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    create = reciboCreateMock
  },
}))

import { fetchMercadoPagoPayment } from '../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

const WEBHOOK_SECRET = 'whsec-api-test'
const PAYMENT_ID = '12345678'
const REQUEST_ID = 'req-webhook-1'
const TS = '1704908010'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../fixtures/mercadopago-webhook-payment-approved.json'), 'utf8'),
) as Record<string, unknown>

function buildHeaders(dataId: string, secret: string): Record<string, string> {
  const manifest = buildMercadoPagoSignatureManifest(dataId, REQUEST_ID, TS)
  const v1 = computeMercadoPagoSignatureHmac(secret, manifest)
  return {
    'x-signature': `ts=${TS},v1=${v1}`,
    'x-request-id': REQUEST_ID,
  }
}

function buildPrismaMock(): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      count: vi.fn().mockResolvedValue(1),
    },
    mercadoPagoConfig: {
      findMany: vi.fn().mockResolvedValue([
        {
          tenantId: 1,
          webhookSecretEncrypted: encryptFiscalSecret(WEBHOOK_SECRET),
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-access-token'),
        webhookSecretEncrypted: encryptFiscalSecret(WEBHOOK_SECRET),
      }),
    },
    mercadoPagoProcessedPayment: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('2500.00'),
        mpPreferenceId: 'pref-abc',
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboCobro: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 2, rsocial: 'ACME SA', activo: true, suspended: false, score: 50, creditDays: 30 }),
      update: vi.fn().mockResolvedValue({}),
    },
    notification: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
  } as unknown as PrismaClient
}

describe('Mercado Pago webhook API (#176)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchMercadoPagoPayment).mockResolvedValue({
      id: Number(PAYMENT_ID),
      status: 'approved',
      external_reference: '1:7',
      transaction_amount: 2500,
      preference_id: 'pref-abc',
    })
  })

  it('returns 400 for invalid signature', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .set('x-signature', 'ts=1,v1=invalid')
      .set('x-request-id', REQUEST_ID)
      .query({ 'data.id': PAYMENT_ID })
      .send(webhookFixture)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 200 and processes approved payment', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const headers = buildHeaders(PAYMENT_ID, WEBHOOK_SECRET)

    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .set(headers)
      .query({ 'data.id': PAYMENT_ID })
      .send(webhookFixture)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    await new Promise((resolve) => setImmediate(resolve))

    expect(fetchMercadoPagoPayment).toHaveBeenCalledWith(expect.any(String), PAYMENT_ID)
    expect(prisma.mercadoPagoProcessedPayment.create).toHaveBeenCalled()
  })

  it('is idempotent on duplicate webhook delivery', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.mercadoPagoProcessedPayment.findUnique).mockResolvedValue({
      id: 1,
      tenantId: 1,
      mpPaymentId: PAYMENT_ID,
      facturaId: 7,
      estado: 'approved',
      reciboCobroId: 50,
      processedAt: new Date(),
    } as never)

    const app = createApp(prisma)
    const headers = buildHeaders(PAYMENT_ID, WEBHOOK_SECRET)

    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .set(headers)
      .query({ 'data.id': PAYMENT_ID })
      .send(webhookFixture)

    expect(res.status).toBe(200)
    await new Promise((resolve) => setImmediate(resolve))
    expect(fetchMercadoPagoPayment).not.toHaveBeenCalled()
  })
})
