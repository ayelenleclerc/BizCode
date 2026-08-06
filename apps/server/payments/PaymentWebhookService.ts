/**
 * @en Thin facade over MercadoPagoWebhookService for the multi-provider module (#377).
 *   Business effects (ReciboCobro) stay in the existing MP webhook service — no duplication.
 * @es Fachada delgada sobre MercadoPagoWebhookService para el módulo multi-proveedor (#377).
 * @pt-BR Fachada fina sobre MercadoPagoWebhookService para o módulo multi-provedor (#377).
 */

import type { PrismaClient } from '@prisma/client'
import { MercadoPagoWebhookService } from '../services/MercadoPagoWebhookService'
import { bootstrapPaymentProviders } from './bootstrapPaymentProviders'
import { getPaymentProviderAdapter } from './paymentProviderRegistry'
import type { NormalizedWebhookEvent, PaymentWebhookRequest } from './types'
import type { ServiceResult } from '../services/serviceResults'

export class PaymentWebhookService {
  private readonly mpWebhook: MercadoPagoWebhookService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapPaymentProviders()
    this.mpWebhook = new MercadoPagoWebhookService(prisma)
  }

  async resolveMercadoPagoTenantBySignature(input: {
    xSignature: string
    xRequestId: string
    dataId: string
  }): Promise<number | null> {
    return this.mpWebhook.resolveTenantIdBySignature(input)
  }

  async parseMercadoPagoWebhook(
    tenantId: number | null,
    request: PaymentWebhookRequest,
  ): Promise<ServiceResult<NormalizedWebhookEvent>> {
    const adapter = getPaymentProviderAdapter('mercadopago', this.prisma)
    if (!adapter) {
      return { ok: false, status: 500, error: 'PAYMENT_PROVIDER_NOT_REGISTERED' }
    }
    return adapter.parseWebhook(tenantId, request)
  }

  async processMercadoPagoPaymentNotification(
    tenantId: number,
    paymentId: string,
    ipAddress?: string | null,
  ): Promise<void> {
    await this.mpWebhook.processPaymentNotification(tenantId, paymentId, ipAddress)
  }

  async processMercadoPagoChargebackNotification(
    tenantId: number,
    chargebackId: string,
    body: unknown,
    ipAddress?: string | null,
  ): Promise<void> {
    await this.mpWebhook.processChargebackNotification(tenantId, chargebackId, body as never, ipAddress)
  }
}
