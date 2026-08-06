/**
 * @en Orchestrates checkout/refund/status via the payment provider registry (#377).
 * @es Orquesta checkout/reembolso/estado vía el registry de proveedores de pago (#377).
 * @pt-BR Orquestra checkout/reembolso/status via o registry de provedores de pagamento (#377).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'
import { bootstrapPaymentProviders } from './bootstrapPaymentProviders'
import { PaymentProviderConfigService } from './PaymentProviderConfigService'
import { getPaymentProviderAdapter } from './paymentProviderRegistry'
import type {
  CreatePaymentResult,
  PaymentProviderCode,
  PaymentStatusResult,
  RefundPaymentResult,
} from './types'

export class PaymentService {
  private readonly configService: PaymentProviderConfigService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapPaymentProviders()
    this.configService = new PaymentProviderConfigService(prisma)
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
    return adapter.createPayment({
      tenantId,
      invoiceId,
      idempotencyKey: `${resolved}:factura:${invoiceId}`,
    })
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
    return adapter.getPaymentStatus(tenantId, invoiceId)
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
      return { ok: false, status: 501, error: 'PAYMENT_REFUND_NOT_SUPPORTED' }
    }
    return adapter.refundPayment({
      tenantId,
      invoiceId,
      amount: input.amount,
      reason: input.reason,
    })
  }
}
