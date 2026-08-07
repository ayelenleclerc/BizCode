/**
 * @en Thin facade over MercadoPagoWebhookService for the multi-provider module (#377).
 *   Syncs PaymentTransaction after MP webhook side-effects (ReciboCobro stays in MP service).
 * @es Fachada delgada sobre MercadoPagoWebhookService (#377).
 *   Sincroniza PaymentTransaction tras efectos del webhook MP.
 * @pt-BR Fachada fina sobre MercadoPagoWebhookService (#377).
 *   Sincroniza PaymentTransaction após efeitos do webhook MP.
 */

import type { PrismaClient } from '@prisma/client'
import { MercadoPagoWebhookService } from '../services/MercadoPagoWebhookService'
import type { ServiceResult } from '../services/serviceResults'
import { bootstrapPaymentProviders } from './bootstrapPaymentProviders'
import { getPaymentProviderAdapter } from './paymentProviderRegistry'
import {
  invoiceIdempotencyKey,
  PaymentTransactionService,
} from './PaymentTransactionService'
import type { NormalizedWebhookEvent, PaymentStatus, PaymentWebhookRequest } from './types'

function mapMpEstado(status: string | null | undefined): PaymentStatus {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'approved') return 'approved'
  if (normalized === 'rejected') return 'rejected'
  if (normalized === 'cancelled') return 'cancelled'
  if (normalized === 'refunded') return 'refunded'
  if (normalized === 'charged_back') return 'charged_back'
  if (normalized === 'in_process') return 'in_process'
  if (normalized === 'pending') return 'pending'
  if (normalized === 'expired') return 'expired'
  return 'unknown'
}

export class PaymentWebhookService {
  private readonly mpWebhook: MercadoPagoWebhookService
  private readonly transactions: PaymentTransactionService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapPaymentProviders()
    this.mpWebhook = new MercadoPagoWebhookService(prisma)
    this.transactions = new PaymentTransactionService(prisma)
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
    await this.syncTransactionAfterWebhook(tenantId, paymentId)
  }

  async processMercadoPagoChargebackNotification(
    tenantId: number,
    chargebackId: string,
    body: unknown,
    ipAddress?: string | null,
  ): Promise<void> {
    await this.mpWebhook.processChargebackNotification(tenantId, chargebackId, body as never, ipAddress)
  }

  private async syncTransactionAfterWebhook(tenantId: number, paymentId: string): Promise<void> {
    const processed = await this.prisma.mercadoPagoProcessedPayment.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId: paymentId } },
    })
    if (!processed?.facturaId) return

    const factura = await this.prisma.factura.findFirst({
      where: { id: processed.facturaId, tenantId },
      select: { id: true, mpEstado: true },
    })
    if (!factura) return

    const key = invoiceIdempotencyKey('mercadopago', factura.id)
    const existing = await this.transactions.findByIdempotencyKey(tenantId, key)
    if (!existing) {
      // Backfill a ledger row if checkout happened before PaymentTransaction existed.
      await this.prisma.paymentTransaction.create({
        data: {
          tenantId,
          providerCode: 'mercadopago',
          externalPaymentId: paymentId,
          externalReference: `${tenantId}:${factura.id}`,
          internalReference: `factura:${factura.id}`,
          paymentType: 'webhook',
          status: mapMpEstado(processed.estado ?? factura.mpEstado),
          providerStatus: processed.estado ?? factura.mpEstado,
          amount: 0,
          currency: 'ARS',
          idempotencyKey: key,
          facturaId: factura.id,
          reciboCobroId: processed.reciboCobroId,
          approvedAt: mapMpEstado(processed.estado) === 'approved' ? new Date() : null,
        },
      })
      return
    }

    await this.transactions.syncInvoiceCheckoutStatus({
      tenantId,
      invoiceId: factura.id,
      provider: 'mercadopago',
      status: mapMpEstado(processed.estado ?? factura.mpEstado),
      providerStatus: processed.estado ?? factura.mpEstado,
      externalPaymentId: paymentId,
      reciboCobroId: processed.reciboCobroId,
    })
  }
}
