/**
 * @en Orchestrates checkout/refund/status via the payment provider registry (#377).
 *   Persists PaymentTransaction and dual-writes Factura.mp* through adapters.
 * @es Orquesta checkout/reembolso/estado vía el registry de proveedores de pago (#377).
 *   Persiste PaymentTransaction y dual-write Factura.mp* vía adapters.
 * @pt-BR Orquestra checkout/reembolso/status via o registry de provedores de pagamento (#377).
 *   Persiste PaymentTransaction e dual-write Factura.mp* via adapters.
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'
import { bootstrapPaymentProviders } from './bootstrapPaymentProviders'
import { PaymentProviderConfigService } from './PaymentProviderConfigService'
import {
  invoiceIdempotencyKey,
  PaymentTransactionService,
} from './PaymentTransactionService'
import { getPaymentProviderAdapter } from './paymentProviderRegistry'
import type {
  CreatePaymentResult,
  PaymentProviderCode,
  PaymentStatusResult,
  RefundPaymentResult,
} from './types'

export class PaymentService {
  private readonly configService: PaymentProviderConfigService
  private readonly transactions: PaymentTransactionService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapPaymentProviders()
    this.configService = new PaymentProviderConfigService(prisma)
    this.transactions = new PaymentTransactionService(prisma)
  }

  async resolveDefaultProvider(tenantId: number): Promise<PaymentProviderCode | null> {
    const status = await this.configService.getStatus(tenantId)
    if (!status.ok) return null
    const preferred =
      status.data.find((e) => e.isDefault && e.enabled && e.configured) ??
      status.data.find((e) => e.enabled && e.configured && e.capabilities.implemented)
    return preferred?.provider ?? null
  }

  async createPaymentForInvoice(
    tenantId: number,
    invoiceId: number,
    provider?: PaymentProviderCode,
  ): Promise<ServiceResult<CreatePaymentResult>> {
    const resolved = provider ?? (await this.resolveDefaultProvider(tenantId))
    if (!resolved) {
      return { ok: false, status: 404, error: 'PAYMENT_PROVIDER_NOT_CONFIGURED' }
    }
    const adapter = getPaymentProviderAdapter(resolved, this.prisma)
    if (!adapter?.getCapabilities().implemented) {
      return { ok: false, status: 501, error: 'PAYMENT_PROVIDER_NOT_IMPLEMENTED' }
    }

    const idempotencyKey = invoiceIdempotencyKey(resolved, invoiceId)
    const existing = await this.transactions.findByIdempotencyKey(tenantId, idempotencyKey)
    if (existing && this.transactions.isReusableCheckout(existing)) {
      return { ok: true, data: this.transactions.toCreatePaymentResult(existing) }
    }

    const result = await adapter.createPayment({
      tenantId,
      invoiceId,
      idempotencyKey,
    })
    if (!result.ok) return result

    await this.transactions.upsertCheckout({
      tenantId,
      provider: resolved,
      invoiceId,
      idempotencyKey,
      result: result.data,
      paymentType: 'preference',
    })
    return result
  }

  async getPaymentStatus(
    tenantId: number,
    invoiceId: number,
    provider?: PaymentProviderCode,
  ): Promise<ServiceResult<PaymentStatusResult>> {
    const resolved = provider ?? (await this.resolveDefaultProvider(tenantId)) ?? 'mercadopago'
    const adapter = getPaymentProviderAdapter(resolved, this.prisma)
    if (!adapter) {
      return { ok: false, status: 404, error: 'PAYMENT_PROVIDER_NOT_REGISTERED' }
    }
    const result = await adapter.getPaymentStatus(tenantId, invoiceId)
    if (result.ok) {
      await this.transactions.syncInvoiceCheckoutStatus({
        tenantId,
        invoiceId,
        provider: resolved,
        status: result.data.status,
        providerStatus: result.data.providerStatus,
        externalPaymentId: result.data.externalPaymentId,
      })
    }
    return result
  }

  async refundPayment(
    tenantId: number,
    invoiceId: number,
    input: { amount?: number; reason?: string },
    provider?: PaymentProviderCode,
  ): Promise<ServiceResult<RefundPaymentResult>> {
    const resolved = provider ?? (await this.resolveDefaultProvider(tenantId))
    if (!resolved) {
      return { ok: false, status: 404, error: 'PAYMENT_PROVIDER_NOT_CONFIGURED' }
    }
    const adapter = getPaymentProviderAdapter(resolved, this.prisma)
    if (!adapter?.refundPayment) {
      return { ok: false, status: 501, error: 'PAYMENT_PROVIDER_NOT_IMPLEMENTED' }
    }
    const result = await adapter.refundPayment({
      tenantId,
      invoiceId,
      amount: input.amount,
      reason: input.reason,
    })
    if (!result.ok) return result

    await this.transactions.recordRefund({
      tenantId,
      provider: resolved,
      invoiceId,
      amount: result.data.amount ?? input.amount ?? 0,
      status: result.data.status,
      refundId: result.data.refundId,
    })
    await this.transactions.syncInvoiceCheckoutStatus({
      tenantId,
      invoiceId,
      provider: resolved,
      status: result.data.status,
      providerStatus: result.data.status,
    })
    return result
  }
}
