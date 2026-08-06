/**
 * @en Capability-only stub adapters must reject operational calls with
 *   `PaymentAdapterNotImplementedError` (#377, ADR-0019).
 * @es Los adapters stub deben rechazar operaciones con
 *   `PaymentAdapterNotImplementedError` (#377, ADR-0019).
 */

import { beforeEach, describe, expect, it } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PaywayPaymentAdapter } from '../../../../apps/server/payments/stubs/PaywayPaymentAdapter'
import { StripePaymentAdapter } from '../../../../apps/server/payments/stubs/StripePaymentAdapter'
import { PaymentAdapterNotImplementedError } from '../../../../apps/server/payments/stubs/PaymentAdapterNotImplementedError'
import type { PaymentProviderAdapter } from '../../../../apps/server/payments/PaymentProviderAdapter'

const prisma = {} as unknown as PrismaClient

describe.each([
  { name: 'PaywayPaymentAdapter', Adapter: PaywayPaymentAdapter, provider: 'payway' },
  { name: 'StripePaymentAdapter', Adapter: StripePaymentAdapter, provider: 'stripe' },
])('$name (#377 capability stub)', ({ Adapter, provider }) => {
  let adapter: PaymentProviderAdapter

  beforeEach(() => {
    adapter = new Adapter(prisma)
  })

  it('declares capabilities as not implemented', () => {
    const capabilities = adapter.getCapabilities()
    expect(capabilities.provider).toBe(provider)
    expect(capabilities.implemented).toBe(false)
    expect(capabilities.notes).toMatch(/Not evidenced in current codebase/)
  })

  it('validateConfiguration reports not configured without throwing', async () => {
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: false } })
  })

  it('createPayment throws PaymentAdapterNotImplementedError', async () => {
    await expect(
      adapter.createPayment({
        tenantId: 1,
        invoiceId: 1,
        idempotencyKey: `${provider}:factura:1`,
      }),
    ).rejects.toBeInstanceOf(PaymentAdapterNotImplementedError)
  })

  it('getPaymentStatus throws PaymentAdapterNotImplementedError', async () => {
    await expect(adapter.getPaymentStatus(1, 1)).rejects.toBeInstanceOf(PaymentAdapterNotImplementedError)
  })

  it('parseWebhook throws PaymentAdapterNotImplementedError', async () => {
    await expect(
      adapter.parseWebhook(1, { headers: {}, rawBody: '', body: {} }),
    ).rejects.toBeInstanceOf(PaymentAdapterNotImplementedError)
  })
})
