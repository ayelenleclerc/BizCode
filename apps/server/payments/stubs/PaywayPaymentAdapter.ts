/**
 * @en Capability-only stub for Payway (#377). Not evidenced as a live integration.
 * @es Stub de capacidades para Payway (#377). Sin integración live evidenciada.
 * @pt-BR Stub de capacidades para Payway (#377). Sem integração live evidenciada.
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

export class PaywayPaymentAdapter implements PaymentProviderAdapter {
  readonly provider = 'payway' as const

  constructor(_prisma: PrismaClient) {}

  getCapabilities(): PaymentProviderCapabilities {
    return {
      provider: 'payway',
      displayName: 'Payway',
      implemented: false,
      supportsCheckoutUrl: true,
      supportsEmbeddedCheckout: false,
      supportsQr: false,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsCancellation: false,
      supportsRecurringPayments: false,
      supportsOAuth: false,
      supportsSandbox: true,
      notes: 'Not evidenced in current codebase — capability stub only (#377)',
    }
  }

  async validateConfiguration(): Promise<ServiceResult<{ configured: boolean }>> {
    return { ok: true, data: { configured: false } }
  }

  async createPayment(_input: CreatePaymentInput): Promise<ServiceResult<CreatePaymentResult>> {
    throw new PaymentAdapterNotImplementedError('payway', 'createPayment')
  }

  async getPaymentStatus(): Promise<ServiceResult<PaymentStatusResult>> {
    throw new PaymentAdapterNotImplementedError('payway', 'getPaymentStatus')
  }

  async parseWebhook(): Promise<ServiceResult<NormalizedWebhookEvent>> {
    throw new PaymentAdapterNotImplementedError('payway', 'parseWebhook')
  }
}
