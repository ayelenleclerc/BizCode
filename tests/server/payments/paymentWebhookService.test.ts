/**
 * @en `PaymentWebhookService` facade tests (#377): delegates tenant resolve / process to MP webhook.
 * @es Tests de fachada `PaymentWebhookService` (#377).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PaymentWebhookService } from '../../../apps/server/payments/PaymentWebhookService'
import { clearPaymentProviderRegistry } from '../../../apps/server/payments/paymentProviderRegistry'
import { resetPaymentProvidersBootstrap } from '../../../apps/server/payments/bootstrapPaymentProviders'

const resolveTenantIdBySignature = vi.fn()
const processPaymentNotification = vi.fn()
const processChargebackNotification = vi.fn()

vi.mock('../../../apps/server/services/MercadoPagoWebhookService', () => ({
  MercadoPagoWebhookService: class {
    resolveTenantIdBySignature = resolveTenantIdBySignature
    processPaymentNotification = processPaymentNotification
    processChargebackNotification = processChargebackNotification
  },
}))

describe('PaymentWebhookService', () => {
  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
    resolveTenantIdBySignature.mockReset()
    processPaymentNotification.mockReset()
    processChargebackNotification.mockReset()
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
    const svc = new PaymentWebhookService({} as PrismaClient)
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
})
