/**
 * @en Registry of payment provider adapter factories keyed by provider code (#377).
 *   Mirrors `fiscalProviderRegistry.ts`.
 * @es Registro de factories de adapters de pago por código (#377).
 * @pt-BR Registro de factories de adapters de pagamento por código (#377).
 */

import type { PrismaClient } from '@prisma/client'
import type { PaymentProviderAdapter } from './PaymentProviderAdapter'
import type { PaymentProviderCode } from './types'

export type PaymentProviderAdapterFactory = (prisma: PrismaClient) => PaymentProviderAdapter

const registry = new Map<PaymentProviderCode, PaymentProviderAdapterFactory>()

/** @en Registers an adapter factory for a payment provider code. */
export function registerPaymentProviderAdapterFactory(
  provider: PaymentProviderCode,
  factory: PaymentProviderAdapterFactory,
): void {
  registry.set(provider, factory)
}

/**
 * @en Builds an adapter instance, or null if unregistered.
 *   Closed `switch` avoids CodeQL `js/unvalidated-dynamic-method-call`.
 */
export function getPaymentProviderAdapter(
  provider: PaymentProviderCode,
  prisma: PrismaClient,
): PaymentProviderAdapter | null {
  switch (provider) {
    case 'mercadopago': {
      const factory = registry.get('mercadopago')
      return factory ? factory(prisma) : null
    }
    case 'payway': {
      const factory = registry.get('payway')
      return factory ? factory(prisma) : null
    }
    case 'stripe': {
      const factory = registry.get('stripe')
      return factory ? factory(prisma) : null
    }
    default:
      return null
  }
}

/** @en Lists registered provider codes (factories only). */
export function listRegisteredPaymentProviders(): PaymentProviderCode[] {
  return [...registry.keys()]
}

/** @en True when a factory is registered for the provider code. */
export function hasPaymentProviderAdapterFactory(provider: PaymentProviderCode): boolean {
  return registry.has(provider)
}

/** @en Clears the registry (tests only). */
export function clearPaymentProviderRegistry(): void {
  registry.clear()
}
