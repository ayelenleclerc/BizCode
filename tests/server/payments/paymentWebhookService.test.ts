/**
 * @en `PaymentWebhookService` facade + PaymentTransaction amount verification (#377/#448).
 * @es Tests de fachada `PaymentWebhookService` + verificación de montos (#377/#448).
 * @pt-BR Testes da fachada `PaymentWebhookService` + verificação de valores (#377/#448).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { PaymentWebhookService } from '../../../apps/server/payments/PaymentWebhookService'
import { PaymentTransactionService } from '../../../apps/server/payments/PaymentTransactionService'
import { clearPaymentProviderRegistry } from '../../../apps/server/payments/paymentProviderRegistry'
import { resetPaymentProvidersBootstrap } from '../../../apps/server/payments/bootstrapPaymentProviders'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

const resolveTenantIdBySignature = vi.fn()
const processPaymentNotification = vi.fn()
const processChargebackNotification = vi.fn()
const fetchMercadoPagoPayment = vi.fn()

vi.mock('../../../apps/server/services/MercadoPagoWebhookService', () => ({
  MercadoPagoWebhookService: class {
    resolveTenantIdBySignature = resolveTenantIdBySignature
    processPaymentNotification = processPaymentNotification
    processChargebackNotification = processChargebackNotification
  },
}))

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    fetchMercadoPagoPayment: (...args: unknown[]) => fetchMercadoPagoPayment(...args),
  }
})

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  const paymentCreate = vi.fn().mockResolvedValue({ id: 1 })
  const paymentUpdate = vi.fn().mockResolvedValue({ id: 1 })
  return {
    mercadoPagoProcessedPayment: {
      findUnique: vi.fn().mockResolvedValue({
        facturaId: 7,
        reciboCobroId: 50,
        estado: 'approved',
        mpPaymentId: 'pay-1',
        tenantId: 1,
      }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 7, mpEstado: 'approved' }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        accessTokenEncrypted: encryptFiscalSecret('TEST-token'),
      }),
    },
    reciboCobro: {
      findFirst: vi.fn().mockResolvedValue({ totalCobrado: new Decimal('1500.00') }),
    },
    paymentTransaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: paymentCreate,
      update: paymentUpdate,
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('PaymentWebhookService', () => {
  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
    resolveTenantIdBySignature.mockReset()
    processPaymentNotification.mockReset()
    processChargebackNotification.mockReset()
    fetchMercadoPagoPayment.mockReset()
  })

  it('resolveMercadoPagoTenantBySignature delegates to MercadoPagoWebhookService', async () => {
    resolveTenantIdBySignature.mockResolvedValue(42)
    const svc = new PaymentWebhookService({} as PrismaClient)
    await expect(
      svc.resolveMercadoPagoTenantBySignature({
        xSignature: 'sig',
        xRequestId: 'req',
        dataId: 'pay-1',
      }),
    ).resolves.toBe(42)
    expect(resolveTenantIdBySignature).toHaveBeenCalledOnce()
  })

  it('processMercadoPagoPaymentNotification delegates idempotent processing', async () => {
    processPaymentNotification.mockResolvedValue(undefined)
    const prisma = buildPrisma({
      mercadoPagoProcessedPayment: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    })
    const svc = new PaymentWebhookService(prisma)
    await svc.processMercadoPagoPaymentNotification(1, 'pay-1', '127.0.0.1')
    expect(processPaymentNotification).toHaveBeenCalledWith(1, 'pay-1', '127.0.0.1')
  })

  it('parseMercadoPagoWebhook uses the mercadopago adapter', async () => {
    const svc = new PaymentWebhookService({} as PrismaClient)
    const result = await svc.parseMercadoPagoWebhook(1, {
      headers: {},
      rawBody: '',
      body: { type: 'payment', data: { id: 'dup-1' } },
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.externalPaymentId).toBe('dup-1')
      expect(result.data.provider).toBe('mercadopago')
    }
  })

  it('backfills PaymentTransaction with verified MP amount (#448)', async () => {
    processPaymentNotification.mockResolvedValue(undefined)
    fetchMercadoPagoPayment.mockResolvedValue({
      id: 1,
      status: 'approved',
      transaction_amount: 2500,
      currency_id: 'ARS',
    })
    const prisma = buildPrisma()
    const svc = new PaymentWebhookService(prisma)
    await svc.processMercadoPagoPaymentNotification(1, 'pay-1')

    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: new Decimal(2500),
          currency: 'ARS',
          amountVerified: true,
          paymentType: 'webhook',
          externalPaymentId: 'pay-1',
        }),
      }),
    )
  })

  it('falls back to ReciboCobro.totalCobrado when MP amount missing (#448)', async () => {
    processPaymentNotification.mockResolvedValue(undefined)
    fetchMercadoPagoPayment.mockResolvedValue({
      id: 1,
      status: 'approved',
      transaction_amount: 0,
      currency_id: 'ARS',
    })
    const prisma = buildPrisma()
    const svc = new PaymentWebhookService(prisma)
    await svc.processMercadoPagoPaymentNotification(1, 'pay-1')

    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: new Decimal('1500.00'),
          amountVerified: true,
        }),
      }),
    )
  })

  it('creates unverified placeholder when no amount source (#448)', async () => {
    processPaymentNotification.mockResolvedValue(undefined)
    fetchMercadoPagoPayment.mockRejectedValue(new Error('network'))
    const prisma = buildPrisma({
      mercadoPagoProcessedPayment: {
        findUnique: vi.fn().mockResolvedValue({
          facturaId: 7,
          reciboCobroId: null,
          estado: 'approved',
          mpPaymentId: 'pay-1',
          tenantId: 1,
        }),
      },
      reciboCobro: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const svc = new PaymentWebhookService(prisma)
    await svc.processMercadoPagoPaymentNotification(1, 'pay-1')

    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: new Decimal(0),
          amountVerified: false,
          rawMetadata: expect.objectContaining({ amountPending: true }),
        }),
      }),
    )
  })

  it('does not duplicate when idempotency key already exists (#448)', async () => {
    processPaymentNotification.mockResolvedValue(undefined)
    fetchMercadoPagoPayment.mockResolvedValue({
      id: 1,
      status: 'approved',
      transaction_amount: 900,
      currency_id: 'ARS',
    })
    const prisma = buildPrisma({
      paymentTransaction: {
        findUnique: vi.fn().mockResolvedValue({
          id: 99,
          amount: new Decimal(900),
          amountVerified: true,
          currency: 'ARS',
          status: 'pending',
          providerStatus: 'pending',
          externalPaymentId: null,
          reciboCobroId: null,
          approvedAt: null,
          rejectedAt: null,
          cancelledAt: null,
          refundedAt: null,
          rawMetadata: null,
        }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 99 }),
      },
    })
    const svc = new PaymentWebhookService(prisma)
    await svc.processMercadoPagoPaymentNotification(1, 'pay-1')

    expect(prisma.paymentTransaction.create).not.toHaveBeenCalled()
    expect(prisma.paymentTransaction.update).toHaveBeenCalled()
  })
})

describe('PaymentTransactionService.toCreatePaymentResult (#448)', () => {
  it('omits amount when amountVerified is false', () => {
    const svc = new PaymentTransactionService({} as PrismaClient)
    const result = svc.toCreatePaymentResult({
      id: 1,
      tenantId: 1,
      providerCode: 'mercadopago',
      externalPaymentId: 'x',
      externalReference: '1:7',
      internalReference: 'factura:7',
      paymentType: 'webhook',
      status: 'approved',
      providerStatus: 'approved',
      amount: new Decimal(0),
      currency: 'ARS',
      amountVerified: false,
      checkoutUrl: null,
      preferenceId: null,
      idempotencyKey: 'mercadopago:factura:7',
      facturaId: 7,
      reciboCobroId: null,
      rawMetadata: null,
      approvedAt: new Date(),
      rejectedAt: null,
      cancelledAt: null,
      expiredAt: null,
      refundedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(result.amount).toBeUndefined()
    expect(result.currency).toBeUndefined()
  })

  it('exposes amount when amountVerified is true', () => {
    const svc = new PaymentTransactionService({} as PrismaClient)
    const result = svc.toCreatePaymentResult({
      id: 1,
      tenantId: 1,
      providerCode: 'mercadopago',
      externalPaymentId: 'x',
      externalReference: '1:7',
      internalReference: 'factura:7',
      paymentType: 'preference',
      status: 'pending',
      providerStatus: 'pending',
      amount: new Decimal(1500),
      currency: 'ARS',
      amountVerified: true,
      checkoutUrl: 'https://mp.test',
      preferenceId: 'pref',
      idempotencyKey: 'mercadopago:factura:7',
      facturaId: 7,
      reciboCobroId: null,
      rawMetadata: null,
      approvedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      expiredAt: null,
      refundedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(result.amount).toBe(1500)
    expect(result.currency).toBe('ARS')
  })
})
