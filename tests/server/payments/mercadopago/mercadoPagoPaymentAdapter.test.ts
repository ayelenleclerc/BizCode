/**
 * @en `MercadoPagoPaymentAdapter` unit tests (#377, ADR-0019): wraps existing MP services —
 *   no second HTTP client.
 * @es Tests de `MercadoPagoPaymentAdapter` (#377, ADR-0019): envuelve servicios MP
 *   existentes — sin segundo cliente HTTP.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { MercadoPagoPaymentAdapter } from '../../../../apps/server/payments/mercadopago/MercadoPagoPaymentAdapter'
import { encryptFiscalSecret } from '../../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', () => ({
  createMercadoPagoPreference: vi.fn(),
  getMercadoPagoUser: vi.fn(),
}))

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('TEST-ACCESS-TOKEN'),
        accessTokenLast4: 'KEN',
        publicKey: 'TEST-PUBLIC-KEY',
        webhookSecretEncrypted: encryptFiscalSecret('whsec'),
        sandboxMode: true,
        activo: true,
        collectorId: null,
        externalPosId: null,
        staticQrData: null,
      }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ slug: 'demo' }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        tenantId: 1,
        estado: 'A',
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal(1500),
        saldo: 1500,
        mpPreferenceId: null,
        mpPaymentLink: null,
        mpEstado: null,
        mpPreferenceExpiresAt: null,
        mpPagadoAt: null,
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
        cliente: { rsocial: 'Cliente Demo' },
      }),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 7,
        tenantId: 1,
        estado: 'A',
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal(1500),
        saldo: 1500,
        mpPreferenceId: data.mpPreferenceId ?? 'pref-adapter',
        mpPaymentLink: data.mpPaymentLink ?? 'https://mp.example/checkout',
        mpEstado: data.mpEstado ?? 'pending',
        mpPreferenceExpiresAt: data.mpPreferenceExpiresAt ?? new Date(Date.now() + 72 * 60 * 60 * 1000),
        mpPagadoAt: null,
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
        cliente: { rsocial: 'Cliente Demo' },
      })),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('MercadoPagoPaymentAdapter', () => {
  let prisma: PrismaClient
  let adapter: MercadoPagoPaymentAdapter

  beforeEach(async () => {
    const { createMercadoPagoPreference } = await import(
      '../../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
    )
    vi.mocked(createMercadoPagoPreference).mockReset()
    vi.mocked(createMercadoPagoPreference).mockResolvedValue({
      id: 'pref-adapter',
      init_point: 'https://mp.example/checkout',
      sandbox_init_point: 'https://sandbox.mp.example/checkout',
    } as never)
    prisma = buildPrismaMock()
    adapter = new MercadoPagoPaymentAdapter(prisma)
  })

  it('declares provider identity and capabilities as implemented', () => {
    expect(adapter.provider).toBe('mercadopago')
    const capabilities = adapter.getCapabilities()
    expect(capabilities.implemented).toBe(true)
    expect(capabilities.supportsCheckoutUrl).toBe(true)
    expect(capabilities.supportsRefunds).toBe(true)
  })

  it('validateConfiguration reflects MercadoPagoConfigService status', async () => {
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: true } })
  })

  it('validateConfiguration reports not configured when MercadoPagoConfig is missing', async () => {
    prisma = buildPrismaMock({
      mercadoPagoConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    })
    adapter = new MercadoPagoPaymentAdapter(prisma)
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: false } })
  })

  it('createPayment delegates to MercadoPagoPreferenceService and normalizes status', async () => {
    const result = await adapter.createPayment({
      tenantId: 1,
      invoiceId: 7,
      idempotencyKey: 'mercadopago:factura:7',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.provider).toBe('mercadopago')
      expect(result.data.preferenceId).toBe('pref-adapter')
      expect(result.data.checkoutUrl).toBeTruthy()
      expect(result.data.status).toBe('pending')
    }
  })

  it('parseWebhook normalizes payment id without inventing approval', async () => {
    const result = await adapter.parseWebhook(1, {
      headers: { 'x-signature': 'v1=abc', 'x-request-id': 'req-1' },
      rawBody: '',
      body: { type: 'payment', data: { id: 'pay-99' } },
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.provider).toBe('mercadopago')
      expect(result.data.externalPaymentId).toBe('pay-99')
      expect(result.data.status).toBe('pending')
    }
  })
})
