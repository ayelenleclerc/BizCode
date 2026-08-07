/**
 * @en `PaymentProviderConfigService` + `PaymentService` tests (#377, ADR-0019).
 * @es Tests de `PaymentProviderConfigService` + `PaymentService` (#377, ADR-0019).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { PaymentProviderConfigService } from '../../../apps/server/payments/PaymentProviderConfigService'
import { PaymentService } from '../../../apps/server/payments/PaymentService'
import { clearPaymentProviderRegistry } from '../../../apps/server/payments/paymentProviderRegistry'
import { resetPaymentProvidersBootstrap } from '../../../apps/server/payments/bootstrapPaymentProviders'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', () => ({
  createMercadoPagoPreference: vi.fn(),
  getMercadoPagoUser: vi.fn(),
}))

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    paymentProviderConfig: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    paymentTransaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockImplementation(async ({ create }: { create: Record<string, unknown> }) => ({
        id: 1,
        ...create,
        amount: create.amount ?? new Decimal(0),
      })),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
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
      update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops)
      }
      return ops
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('PaymentProviderConfigService', () => {
  let prisma: PrismaClient
  let service: PaymentProviderConfigService

  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
    prisma = buildPrismaMock()
    service = new PaymentProviderConfigService(prisma)
  })

  it('getCapabilities lists every registered provider without requiring tenant context', () => {
    const capabilities = service.getCapabilities()
    expect(capabilities.map((c) => c.provider).sort()).toEqual(['mercadopago', 'payway', 'stripe'].sort())
  })

  it('getStatus falls back to legacy MercadoPagoConfig when no PaymentProviderConfig row exists', async () => {
    prisma = buildPrismaMock({
      mercadoPagoConfig: {
        findUnique: vi.fn().mockResolvedValue({
          tenantId: 1,
          accessTokenLast4: '1234',
          publicKey: 'TEST-PK',
          webhookSecretEncrypted: encryptFiscalSecret('sec'),
          sandboxMode: true,
          activo: true,
        }),
        upsert: vi.fn(),
      },
    })
    service = new PaymentProviderConfigService(prisma)

    const result = await service.getStatus(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const mp = result.data.find((entry) => entry.provider === 'mercadopago')
      expect(mp?.configured).toBe(true)
      expect(mp?.isDefault).toBe(true)
      expect(mp?.environment).toBe('sandbox')
      const payway = result.data.find((entry) => entry.provider === 'payway')
      expect(payway?.configured).toBe(false)
    }
  })

  it('getStatus prefers the PaymentProviderConfig row once migrated', async () => {
    prisma = buildPrismaMock({
      paymentProviderConfig: {
        findMany: vi.fn().mockResolvedValue([
          {
            providerCode: 'mercadopago',
            enabled: true,
            isDefault: true,
            environment: 'production',
            accessTokenLast4: '9999',
            publicKey: 'PROD-PK',
            webhookSecretSet: true,
            lastValidationAt: null,
            validationStatus: 'valid',
          },
        ]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
      mercadoPagoConfig: { findUnique: vi.fn().mockResolvedValue({ publicKey: 'LEGACY' }), upsert: vi.fn() },
    })
    service = new PaymentProviderConfigService(prisma)

    const result = await service.getStatus(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const mp = result.data.find((entry) => entry.provider === 'mercadopago')
      expect(mp?.environment).toBe('production')
      expect(mp?.publicKey).toBe('PROD-PK')
    }
    expect(prisma.mercadoPagoConfig.findUnique).not.toHaveBeenCalled()
  })
})

describe('PaymentService', () => {
  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
  })

  it('createPaymentForInvoice returns 404 when no provider is configured', async () => {
    const prisma = buildPrismaMock()
    const service = new PaymentService(prisma)
    const result = await service.createPaymentForInvoice(1, 7)
    expect(result).toEqual({ ok: false, status: 404, error: 'PAYMENT_PROVIDER_NOT_CONFIGURED' })
  })

  it('createPaymentForInvoice returns 501 for unimplemented stubs', async () => {
    const prisma = buildPrismaMock({
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
      },
    })
    const service = new PaymentService(prisma)
    const result = await service.createPaymentForInvoice(1, 7, 'payway')
    expect(result).toEqual({ ok: false, status: 501, error: 'PAYMENT_PROVIDER_NOT_IMPLEMENTED' })
  })

  it('createPaymentForInvoice delegates to MercadoPago adapter when configured', async () => {
    const { createMercadoPagoPreference } = await import(
      '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
    )
    vi.mocked(createMercadoPagoPreference).mockResolvedValue({
      id: 'pref-svc',
      init_point: 'https://mp.example/checkout',
      sandbox_init_point: 'https://sandbox.mp.example/checkout',
    } as never)

    const prisma = buildPrismaMock({
      paymentProviderConfig: {
        findMany: vi.fn().mockResolvedValue([
          {
            providerCode: 'mercadopago',
            enabled: true,
            isDefault: true,
            environment: 'sandbox',
            accessTokenLast4: 'TOKEN',
            publicKey: 'PK',
            webhookSecretSet: true,
            lastValidationAt: null,
            validationStatus: null,
          },
        ]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
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
        upsert: vi.fn(),
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
          mpPreferenceId: data.mpPreferenceId ?? 'pref-svc',
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
    })
    const service = new PaymentService(prisma)
    const result = await service.createPaymentForInvoice(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.preferenceId).toBe('pref-svc')
      expect(result.data.provider).toBe('mercadopago')
    }
    expect(prisma.paymentTransaction.upsert).toHaveBeenCalled()
  })

  it('createPaymentForInvoice reuses PaymentTransaction when checkout is still active', async () => {
    const prisma = buildPrismaMock({
      paymentProviderConfig: {
        findMany: vi.fn().mockResolvedValue([
          {
            providerCode: 'mercadopago',
            enabled: true,
            isDefault: true,
            environment: 'sandbox',
            accessTokenLast4: 'TOKEN',
            publicKey: 'PK',
            webhookSecretSet: true,
            lastValidationAt: null,
            validationStatus: null,
          },
        ]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
      paymentTransaction: {
        findUnique: vi.fn().mockResolvedValue({
          id: 9,
          tenantId: 1,
          providerCode: 'mercadopago',
          status: 'pending',
          preferenceId: 'pref-existing',
          checkoutUrl: 'https://mp.example/existing',
          amount: new Decimal(1500),
          currency: 'ARS',
          expiredAt: new Date(Date.now() + 60_000),
          providerStatus: 'pending',
          externalPaymentId: null,
        }),
        upsert: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new PaymentService(prisma)
    const result = await service.createPaymentForInvoice(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.preferenceId).toBe('pref-existing')
      expect(result.data.checkoutUrl).toBe('https://mp.example/existing')
    }
    expect(prisma.paymentTransaction.upsert).not.toHaveBeenCalled()
  })

  it('setDefaultProvider clears other defaults', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 })
    const update = vi.fn().mockResolvedValue({ id: 2, isDefault: true })
    const prisma = buildPrismaMock({
      paymentProviderConfig: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({
          id: 2,
          tenantId: 1,
          providerCode: 'mercadopago',
          enabled: true,
          isDefault: false,
        }),
        findFirst: vi.fn(),
        upsert: vi.fn(),
        update,
        updateMany,
      },
      $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    })
    const config = new PaymentProviderConfigService(prisma)
    const result = await config.setDefaultProvider(1, 'mercadopago')
    expect(result.ok).toBe(true)
    expect(updateMany).toHaveBeenCalled()
    expect(update).toHaveBeenCalled()
  })
})
