/**
 * @en Thin facade over MercadoPagoWebhookService for the multi-provider module (#377/#448).
 *   Syncs PaymentTransaction after MP webhook side-effects with verified amount/currency when possible.
 * @es Fachada delgada sobre MercadoPagoWebhookService (#377/#448).
 *   Sincroniza PaymentTransaction tras efectos del webhook MP con monto/moneda verificables cuando sea posible.
 * @pt-BR Fachada fina sobre MercadoPagoWebhookService (#377/#448).
 *   Sincroniza PaymentTransaction após efeitos do webhook MP com valor/moeda verificáveis quando possível.
 */

import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  fetchMercadoPagoPayment,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
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

type ResolvedAmount = {
  amount: Decimal
  currency: string
  verified: boolean
  metadata?: Prisma.InputJsonValue
}

function isUsableAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
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

  /**
   * @en Resolves amount/currency from MP API then ReciboCobro; otherwise marks unverified (#448).
   * @es Resuelve monto/moneda desde API MP y luego ReciboCobro; si no, marca no verificado (#448).
   * @pt-BR Resolve valor/moeda pela API MP e depois ReciboCobro; senão marca não verificado (#448).
   */
  private async resolveVerifiedAmount(
    tenantId: number,
    paymentId: string,
    reciboCobroId: number | null,
  ): Promise<ResolvedAmount> {
    const mpRow = await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    if (mpRow?.accessTokenEncrypted) {
      try {
        const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
        const payment = await fetchMercadoPagoPayment(accessToken, paymentId)
        if (isUsableAmount(payment.transaction_amount)) {
          const currency =
            typeof payment.currency_id === 'string' && payment.currency_id.trim()
              ? payment.currency_id.trim().toUpperCase().slice(0, 3)
              : 'ARS'
          return {
            amount: new Decimal(payment.transaction_amount),
            currency,
            verified: true,
            metadata: { amountSource: 'mercadopago_payment' },
          }
        }
      } catch (err: unknown) {
        if (!(err instanceof MercadoPagoApiError)) {
          console.warn(
            '[payment-webhook] amount_fetch_error',
            'tenant',
            tenantId,
            'payment',
            paymentId,
            'detail',
            err instanceof Error ? err.message : err,
          )
        }
      }
    }

    if (reciboCobroId != null) {
      const recibo = await this.prisma.reciboCobro.findFirst({
        where: { id: reciboCobroId, tenantId },
        select: { totalCobrado: true },
      })
      if (recibo && recibo.totalCobrado.gt(0)) {
        return {
          amount: recibo.totalCobrado,
          currency: 'ARS',
          verified: true,
          metadata: { amountSource: 'recibo_cobro' },
        }
      }
    }

    return {
      amount: new Decimal(0),
      currency: 'ARS',
      verified: false,
      metadata: {
        amountPending: true,
        reason: 'no_verified_amount_source',
      },
    }
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

    const resolved = await this.resolveVerifiedAmount(
      tenantId,
      paymentId,
      processed.reciboCobroId,
    )
    const status = mapMpEstado(processed.estado ?? factura.mpEstado)
    const providerStatus = processed.estado ?? factura.mpEstado

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
          status,
          providerStatus,
          amount: resolved.amount,
          currency: resolved.currency,
          amountVerified: resolved.verified,
          rawMetadata: resolved.metadata ?? undefined,
          idempotencyKey: key,
          facturaId: factura.id,
          reciboCobroId: processed.reciboCobroId,
          approvedAt: status === 'approved' ? new Date() : null,
        },
      })
      return
    }

    await this.transactions.syncInvoiceCheckoutStatus({
      tenantId,
      invoiceId: factura.id,
      provider: 'mercadopago',
      status,
      providerStatus,
      externalPaymentId: paymentId,
      reciboCobroId: processed.reciboCobroId,
      amount: resolved.verified ? resolved.amount : undefined,
      currency: resolved.verified ? resolved.currency : undefined,
      amountVerified: resolved.verified ? true : undefined,
      rawMetadata: resolved.verified ? resolved.metadata : undefined,
    })
  }
}
