/**
 * @en Persists generic PaymentTransaction rows with dual-write compatibility to Factura.mp* (#377).
 * @es Persiste filas PaymentTransaction genéricas con compatibilidad dual-write a Factura.mp* (#377).
 * @pt-BR Persiste linhas PaymentTransaction genéricas com dual-write em Factura.mp* (#377).
 */

import type { PaymentTransaction, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { CreatePaymentResult, PaymentProviderCode, PaymentStatus } from './types'

const ACTIVE_CHECKOUT_STATUSES: PaymentStatus[] = ['pending', 'in_process']

export function invoiceIdempotencyKey(provider: PaymentProviderCode, invoiceId: number): string {
  return `${provider}:factura:${invoiceId}`
}

export function invoiceInternalReference(invoiceId: number): string {
  return `factura:${invoiceId}`
}

export class PaymentTransactionService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdempotencyKey(
    tenantId: number,
    idempotencyKey: string,
  ): Promise<PaymentTransaction | null> {
    return this.prisma.paymentTransaction.findUnique({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
    })
  }

  isReusableCheckout(tx: PaymentTransaction, now = new Date()): boolean {
    if (!ACTIVE_CHECKOUT_STATUSES.includes(tx.status as PaymentStatus)) return false
    if (tx.expiredAt && tx.expiredAt.getTime() <= now.getTime()) return false
    return Boolean(tx.checkoutUrl || tx.preferenceId)
  }

  toCreatePaymentResult(tx: PaymentTransaction): CreatePaymentResult {
    return {
      status: tx.status as PaymentStatus,
      provider: tx.providerCode as PaymentProviderCode,
      preferenceId: tx.preferenceId ?? undefined,
      checkoutUrl: tx.checkoutUrl ?? undefined,
      expiresAt: tx.expiredAt ?? undefined,
      providerStatus: tx.providerStatus ?? undefined,
      amount: Number(tx.amount),
      currency: tx.currency,
      externalPaymentId: tx.externalPaymentId ?? undefined,
    }
  }

  async upsertCheckout(input: {
    tenantId: number
    provider: PaymentProviderCode
    invoiceId: number
    idempotencyKey: string
    result: CreatePaymentResult
    paymentType?: string
  }): Promise<PaymentTransaction> {
    const amount = new Decimal(input.result.amount ?? 0)
    const data = {
      providerCode: input.provider,
      externalPaymentId: input.result.externalPaymentId ?? null,
      externalReference: `${input.tenantId}:${input.invoiceId}`,
      internalReference: invoiceInternalReference(input.invoiceId),
      paymentType: input.paymentType ?? 'preference',
      status: input.result.status,
      providerStatus: input.result.providerStatus ?? null,
      amount,
      currency: input.result.currency ?? 'ARS',
      checkoutUrl: input.result.checkoutUrl ?? null,
      preferenceId: input.result.preferenceId ?? null,
      facturaId: input.invoiceId,
      expiredAt: input.result.expiresAt ?? null,
      approvedAt: input.result.status === 'approved' ? new Date() : null,
      rejectedAt: input.result.status === 'rejected' ? new Date() : null,
      cancelledAt: input.result.status === 'cancelled' ? new Date() : null,
      refundedAt:
        input.result.status === 'refunded' || input.result.status === 'partially_refunded'
          ? new Date()
          : null,
    }

    return this.prisma.paymentTransaction.upsert({
      where: {
        tenantId_idempotencyKey: {
          tenantId: input.tenantId,
          idempotencyKey: input.idempotencyKey,
        },
      },
      create: {
        tenantId: input.tenantId,
        idempotencyKey: input.idempotencyKey,
        ...data,
      },
      update: data,
    })
  }

  async syncInvoiceCheckoutStatus(input: {
    tenantId: number
    invoiceId: number
    provider: PaymentProviderCode
    status: PaymentStatus
    providerStatus?: string | null
    externalPaymentId?: string | null
    reciboCobroId?: number | null
  }): Promise<void> {
    const idempotencyKey = invoiceIdempotencyKey(input.provider, input.invoiceId)
    const existing = await this.findByIdempotencyKey(input.tenantId, idempotencyKey)
    if (!existing) return

    const now = new Date()
    await this.prisma.paymentTransaction.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        providerStatus: input.providerStatus ?? existing.providerStatus,
        externalPaymentId: input.externalPaymentId ?? existing.externalPaymentId,
        reciboCobroId: input.reciboCobroId ?? existing.reciboCobroId,
        approvedAt: input.status === 'approved' ? now : existing.approvedAt,
        rejectedAt: input.status === 'rejected' ? now : existing.rejectedAt,
        cancelledAt: input.status === 'cancelled' ? now : existing.cancelledAt,
        refundedAt:
          input.status === 'refunded' || input.status === 'partially_refunded'
            ? now
            : existing.refundedAt,
      },
    })
  }

  async recordRefund(input: {
    tenantId: number
    provider: PaymentProviderCode
    invoiceId: number
    amount: number
    status: PaymentStatus
    refundId?: string
  }): Promise<PaymentTransaction> {
    const idempotencyKey = `${input.provider}:factura:${input.invoiceId}:refund:${input.refundId ?? Date.now()}`
    return this.prisma.paymentTransaction.create({
      data: {
        tenantId: input.tenantId,
        providerCode: input.provider,
        externalPaymentId: input.refundId ?? null,
        externalReference: `${input.tenantId}:${input.invoiceId}`,
        internalReference: invoiceInternalReference(input.invoiceId),
        paymentType: 'refund',
        status: input.status,
        providerStatus: input.status,
        amount: new Decimal(input.amount),
        currency: 'ARS',
        idempotencyKey,
        facturaId: input.invoiceId,
        refundedAt: new Date(),
      },
    })
  }
}
