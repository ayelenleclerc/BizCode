/**
 * @en Capability-only stub for Stripe (#377). Not evidenced as a live integration.
 * @es Stub de capacidades para Stripe (#377). Sin integración live evidenciada.
 * @pt-BR Stub de capacidades para Stripe (#377). Sem integração live evidenciada.
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import type { PaymentProviderAdapter } from '../PaymentProviderAdapter'
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  NormalizedWebhookEvent,
  PaymentProviderCapabilities,
  PaymentStatusResult,
} from '../types'
import { PaymentAdapterNotImplementedError } from './PaymentAdapterNotImplementedError'

export class StripePaymentAdapter implements PaymentProviderAdapter {
  readonly provider = 'stripe' as const

  constructor(_prisma: PrismaClient) {}

  getCapabilities(): PaymentProviderCapabilities {
    return {
      provider: 'stripe',
      displayName: 'Stripe',
      implemented: false,
      supportsCheckoutUrl: true,
      supportsEmbeddedCheckout: true,
      supportsQr: false,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsCancellation: true,
      supportsRecurringPayments: true,
      supportsOAuth: true,
      supportsSandbox: true,
      notes: 'Not evidenced in current codebase — capability stub only (#377)',
    }
  }

  async validateConfiguration(): Promise<ServiceResult<{ configured: boolean }>> {
    return { ok: true, data: { configured: false } }
  }

  async createPayment(_input: CreatePaymentInput): Promise<ServiceResult<CreatePaymentResult>> {
    throw new PaymentAdapterNotImplementedError('stripe', 'createPayment')
  }

  async getPaymentStatus(): Promise<ServiceResult<PaymentStatusResult>> {
    throw new PaymentAdapterNotImplementedError('stripe', 'getPaymentStatus')
  }

  async parseWebhook(): Promise<ServiceResult<NormalizedWebhookEvent>> {
    throw new PaymentAdapterNotImplementedError('stripe', 'parseWebhook')
  }
}
