/**
 * @en Registry + bootstrap tests for the multi-provider payments module (#377, ADR-0019).
 * @es Tests de registro + bootstrap del módulo de cobros multi-proveedor (#377, ADR-0019).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import {
  clearPaymentProviderRegistry,
  getPaymentProviderAdapter,
  hasPaymentProviderAdapterFactory,
  listRegisteredPaymentProviders,
  registerPaymentProviderAdapterFactory,
} from '../../../apps/server/payments/paymentProviderRegistry'
import {
  bootstrapPaymentProviders,
  resetPaymentProvidersBootstrap,
} from '../../../apps/server/payments/bootstrapPaymentProviders'
import { MercadoPagoPaymentAdapter } from '../../../apps/server/payments/mercadopago/MercadoPagoPaymentAdapter'
import { PaywayPaymentAdapter } from '../../../apps/server/payments/stubs/PaywayPaymentAdapter'
import { StripePaymentAdapter } from '../../../apps/server/payments/stubs/StripePaymentAdapter'

const prisma = {} as unknown as PrismaClient

describe('paymentProviderRegistry', () => {
  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
  })

  it('has no registered providers before bootstrap', () => {
    expect(listRegisteredPaymentProviders()).toEqual([])
    expect(hasPaymentProviderAdapterFactory('mercadopago')).toBe(false)
    expect(getPaymentProviderAdapter('mercadopago', prisma)).toBeNull()
  })

  it('registers a factory and builds an adapter instance via it', () => {
    const factory = vi.fn(() => new PaywayPaymentAdapter(prisma))
    registerPaymentProviderAdapterFactory('payway', factory)

    expect(hasPaymentProviderAdapterFactory('payway')).toBe(true)
    const adapter = getPaymentProviderAdapter('payway', prisma)
    expect(adapter).toBeInstanceOf(PaywayPaymentAdapter)
    expect(factory).toHaveBeenCalledWith(prisma)
  })

  it('returns null for a provider without a registered factory', () => {
    expect(getPaymentProviderAdapter('stripe', prisma)).toBeNull()
  })

  it('clearPaymentProviderRegistry removes every registration', () => {
    registerPaymentProviderAdapterFactory('mercadopago', (p) => new MercadoPagoPaymentAdapter(p))
    expect(listRegisteredPaymentProviders()).toEqual(['mercadopago'])
    clearPaymentProviderRegistry()
    expect(listRegisteredPaymentProviders()).toEqual([])
  })
})

describe('bootstrapPaymentProviders', () => {
  beforeEach(() => {
    clearPaymentProviderRegistry()
    resetPaymentProvidersBootstrap()
  })

  it('registers mercadopago, payway and stripe factories', () => {
    bootstrapPaymentProviders()

    expect(listRegisteredPaymentProviders().sort()).toEqual(['mercadopago', 'payway', 'stripe'].sort())
    expect(getPaymentProviderAdapter('mercadopago', prisma)).toBeInstanceOf(MercadoPagoPaymentAdapter)
    expect(getPaymentProviderAdapter('payway', prisma)).toBeInstanceOf(PaywayPaymentAdapter)
    expect(getPaymentProviderAdapter('stripe', prisma)).toBeInstanceOf(StripePaymentAdapter)
  })

  it('is idempotent: calling it twice does not throw or duplicate registrations', () => {
    bootstrapPaymentProviders()
    bootstrapPaymentProviders()
    expect(listRegisteredPaymentProviders().sort()).toEqual(['mercadopago', 'payway', 'stripe'].sort())
  })

  it('does nothing after the module-level bootstrap flag is set until reset', () => {
    bootstrapPaymentProviders()
    clearPaymentProviderRegistry()
    bootstrapPaymentProviders()
    expect(listRegisteredPaymentProviders()).toEqual([])

    resetPaymentProvidersBootstrap()
    bootstrapPaymentProviders()
    expect(listRegisteredPaymentProviders().length).toBe(3)
  })
})
