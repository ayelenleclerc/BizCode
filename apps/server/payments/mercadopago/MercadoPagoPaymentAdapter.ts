/**
 * @en Payment provider adapter that wraps existing Mercado Pago services (#377, ADR-0019).
 *   Does NOT create a second HTTP client: every call delegates to MercadoPago*Service /
 *   mercadoPagoApiClient used by those services.
 * @es Adapter de pagos que envuelve los servicios Mercado Pago existentes (#377, ADR-0019).
 *   No crea un segundo cliente HTTP: cada llamada delega en MercadoPago*Service.
 * @pt-BR Adapter de pagamentos que envolve os serviços Mercado Pago existentes (#377, ADR-0019).
 *   Não cria um segundo cliente HTTP: cada chamada delega aos MercadoPago*Service.
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { MercadoPagoConfigService } from '../../services/MercadoPagoConfigService'
import { MercadoPagoPreferenceService } from '../../services/MercadoPagoPreferenceService'
import { MercadoPagoRefundService } from '../../services/MercadoPagoRefundService'
import { MercadoPagoWebhookService } from '../../services/MercadoPagoWebhookService'
import type { PaymentProviderAdapter } from '../PaymentProviderAdapter'
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  NormalizedWebhookEvent,
  PaymentProviderCapabilities,
  PaymentProviderCode,
  PaymentStatus,
  PaymentStatusResult,
  PaymentWebhookRequest,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../types'

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

export class MercadoPagoPaymentAdapter implements PaymentProviderAdapter {
  readonly provider: PaymentProviderCode = 'mercadopago'

  private readonly config: MercadoPagoConfigService
  private readonly preference: MercadoPagoPreferenceService
  private readonly refund: MercadoPagoRefundService
  private readonly webhook: MercadoPagoWebhookService

  constructor(prisma: PrismaClient) {
    this.config = new MercadoPagoConfigService(prisma)
    this.preference = new MercadoPagoPreferenceService(prisma)
    this.refund = new MercadoPagoRefundService(prisma)
    this.webhook = new MercadoPagoWebhookService(prisma)
  }

  getCapabilities(): PaymentProviderCapabilities {
    return {
      provider: 'mercadopago',
      displayName: 'Mercado Pago',
      implemented: true,
      supportsCheckoutUrl: true,
      supportsEmbeddedCheckout: false,
      supportsQr: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsCancellation: false,
      supportsRecurringPayments: false,
      supportsOAuth: false,
      supportsSandbox: true,
    }
  }

  async validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    const status = await this.config.getStatus(tenantId)
    return { ok: true, data: { configured: status.configured && Boolean(status.activo) } }
  }

  async createPayment(input: CreatePaymentInput): Promise<ServiceResult<CreatePaymentResult>> {
    const result = await this.preference.createPreference(input.tenantId, input.invoiceId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: mapMpEstado(result.data.estado),
        provider: 'mercadopago',
        preferenceId: result.data.preferenceId,
        checkoutUrl: result.data.paymentLink,
        expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : undefined,
        providerStatus: result.data.estado,
        amount: result.data.amount ? Number(result.data.amount) : undefined,
        currency: 'ARS',
      },
    }
  }

  async getPaymentStatus(
    tenantId: number,
    invoiceId: number,
    _externalPaymentId?: string,
  ): Promise<ServiceResult<PaymentStatusResult>> {
    const result = await this.preference.getStatus(tenantId, invoiceId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: mapMpEstado(result.data.estado),
        providerStatus: result.data.estado,
        approvedAt: result.data.pagadoAt ? new Date(result.data.pagadoAt) : null,
        amount: result.data.amount ? Number(result.data.amount) : undefined,
        currency: 'ARS',
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<ServiceResult<RefundPaymentResult>> {
    const motivo = (input.reason ?? 'Reembolso solicitado desde módulo multi-proveedor').trim()
    const result = await this.refund.refundTotal(input.tenantId, input.invoiceId, 0, {
      motivo: motivo.length >= 10 ? motivo : `${motivo} (ajuste automático)`,
      monto: input.amount,
    })
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: result.data.estado === 'completado' ? 'refunded' : 'in_process',
        refundId: result.data.mpRefundId ?? String(result.data.id),
        amount: Number(result.data.monto),
      },
    }
  }

  async parseWebhook(
    tenantId: number | null,
    request: PaymentWebhookRequest,
  ): Promise<ServiceResult<NormalizedWebhookEvent>> {
    const body = (request.body ?? {}) as {
      action?: string
      type?: string
      data?: { id?: string | number }
      id?: string | number
    }
    const externalPaymentId = String(body.data?.id ?? body.id ?? '').trim() || undefined
    const headers = request.headers
    const xSignature = String(headers['x-signature'] ?? headers['X-Signature'] ?? '')
    const xRequestId = String(headers['x-request-id'] ?? headers['X-Request-Id'] ?? '')

    let resolvedTenant = tenantId
    if (resolvedTenant == null && externalPaymentId && xSignature && xRequestId) {
      resolvedTenant = await this.webhook.resolveTenantIdBySignature({
        xSignature,
        xRequestId,
        dataId: externalPaymentId,
      })
    }

    return {
      ok: true,
      data: {
        provider: 'mercadopago',
        eventType: body.type ?? body.action ?? 'payment',
        externalPaymentId,
        tenantHint: resolvedTenant ?? undefined,
        status: 'pending',
        raw: body,
      },
    }
  }

  async healthCheck(tenantId: number): Promise<ServiceResult<{ healthy: boolean; accountName?: string }>> {
    const result = await this.config.testCredentials(tenantId)
    if (!result.ok) return { ok: false, status: result.status, error: result.error }
    return { ok: true, data: { healthy: true, accountName: result.data.accountName } }
  }
}
