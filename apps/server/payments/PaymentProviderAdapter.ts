/**
 * @en Contract every payment provider adapter must implement (#377, ADR-0019).
 *   Mirrors `FiscalProviderAdapter` (apps/server/fiscal/FiscalProviderAdapter.ts).
 * @es Contrato que debe implementar cada adapter de proveedor de pagos (#377, ADR-0019).
 *   Refleja `FiscalProviderAdapter`.
 * @pt-BR Contrato que cada adapter de provedor de pagamentos deve implementar (#377, ADR-0019).
 *   Reflete `FiscalProviderAdapter`.
 */

import type { ServiceResult } from '../services/serviceResults'
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  NormalizedWebhookEvent,
  PaymentProviderCapabilities,
  PaymentProviderCode,
  PaymentStatusResult,
  PaymentWebhookRequest,
  RefundPaymentInput,
  RefundPaymentResult,
} from './types'

export interface PaymentProviderAdapter {
  readonly provider: PaymentProviderCode

  /** @en Whether the tenant has usable provider credentials (no secrets returned). */
  validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>>

  /** @en Creates a checkout preference / payment link for an invoice. */
  createPayment(input: CreatePaymentInput): Promise<ServiceResult<CreatePaymentResult>>

  /** @en Reads payment status for an invoice (or external id when provided). */
  getPaymentStatus(
    tenantId: number,
    invoiceId: number,
    externalPaymentId?: string,
  ): Promise<ServiceResult<PaymentStatusResult>>

  /** @en Full or partial refund when the provider supports it. */
  refundPayment?(input: RefundPaymentInput): Promise<ServiceResult<RefundPaymentResult>>

  /** @en Validates webhook authenticity and normalizes the event payload. */
  parseWebhook(
    tenantId: number | null,
    request: PaymentWebhookRequest,
  ): Promise<ServiceResult<NormalizedWebhookEvent>>

  /** @en Lightweight credential/connectivity check when supported. */
  healthCheck?(tenantId: number): Promise<ServiceResult<{ healthy: boolean; accountName?: string }>>

  /** @en Static capability declaration (no tenant context). */
  getCapabilities(): PaymentProviderCapabilities
}
