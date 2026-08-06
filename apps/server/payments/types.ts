/**
 * @en Shared types for the multi-provider payments module (#377, ADR-0019).
 *   Mercado Pago remains the only live adapter; other codes are capability stubs.
 * @es Tipos compartidos del módulo de cobros multi-proveedor (#377, ADR-0019).
 *   Mercado Pago sigue siendo el único adapter real; los demás son stubs de capacidades.
 * @pt-BR Tipos compartilhados do módulo de cobranças multi-provedor (#377, ADR-0019).
 *   Mercado Pago continua sendo o único adapter real; os demais são stubs de capacidades.
 */

export const PAYMENT_PROVIDER_CODES = ['mercadopago', 'payway', 'stripe'] as const

export type PaymentProviderCode = (typeof PAYMENT_PROVIDER_CODES)[number]

export function isPaymentProviderCode(value: unknown): value is PaymentProviderCode {
  return typeof value === 'string' && (PAYMENT_PROVIDER_CODES as readonly string[]).includes(value)
}

/** @en Normalized environment for payment providers. */
export type PaymentEnvironment = 'sandbox' | 'production'

/**
 * @en Internal payment lifecycle statuses independent of the PSP (#377).
 * @es Estados internos de pago independientes del PSP (#377).
 * @pt-BR Status internos de pagamento independentes do PSP (#377).
 */
export type PaymentStatus =
  | 'pending'
  | 'in_process'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'
  | 'charged_back'
  | 'unknown'

export type CreatePaymentInput = {
  tenantId: number
  /** @en Business document to collect against (invoice id). */
  invoiceId: number
  idempotencyKey: string
  description?: string
  amount?: number
  currency?: string
}

export type CreatePaymentResult = {
  status: PaymentStatus
  provider: PaymentProviderCode
  externalPaymentId?: string
  preferenceId?: string
  checkoutUrl?: string
  expiresAt?: Date
  providerStatus?: string
  amount?: number
  currency?: string
}

export type PaymentStatusResult = {
  status: PaymentStatus
  providerStatus?: string
  externalPaymentId?: string
  amount?: number
  currency?: string
  approvedAt?: Date | null
}

export type RefundPaymentInput = {
  tenantId: number
  invoiceId: number
  amount?: number
  reason?: string
}

export type RefundPaymentResult = {
  status: PaymentStatus
  refundId?: string
  amount?: number
}

export type PaymentWebhookRequest = {
  headers: Record<string, string | string[] | undefined>
  rawBody: string
  body: unknown
}

export type NormalizedWebhookEvent = {
  provider: PaymentProviderCode
  eventType: string
  externalPaymentId?: string
  invoiceId?: number
  tenantHint?: number
  status?: PaymentStatus
  providerStatus?: string
  amount?: number
  currency?: string
  raw?: unknown
}

export type PaymentProviderCapabilities = {
  provider: PaymentProviderCode
  displayName: string
  implemented: boolean
  supportsCheckoutUrl: boolean
  supportsEmbeddedCheckout: boolean
  supportsQr: boolean
  supportsRefunds: boolean
  supportsPartialRefunds: boolean
  supportsCancellation: boolean
  supportsRecurringPayments: boolean
  supportsOAuth: boolean
  supportsSandbox: boolean
  /** @en Free-text note, e.g. capability-only stub. */
  notes?: string
}
