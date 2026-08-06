/**
 * @en Registry of fiscal provider adapter factories keyed by provider code (#378).
 *   Mirrors `connectorRegistry.ts` (apps/server/integrations/ecommerce/connectorRegistry.ts).
 * @es Registro de factories de adapters fiscales por código de proveedor (#378).
 *   Refleja `connectorRegistry.ts` (apps/server/integrations/ecommerce/connectorRegistry.ts).
 * @pt-BR Registro de factories de adapters fiscais por código de provedor (#378).
 *   Reflete `connectorRegistry.ts` (apps/server/integrations/ecommerce/connectorRegistry.ts).
 */

import type { PrismaClient } from '@prisma/client'
import type { FiscalProviderAdapter } from './FiscalProviderAdapter'
import type { FiscalProviderCode } from './types'

export type FiscalProviderAdapterFactory = (prisma: PrismaClient) => FiscalProviderAdapter

const registry = new Map<FiscalProviderCode, FiscalProviderAdapterFactory>()

/** @en Registers an adapter factory for a fiscal provider code. */
export function registerFiscalProviderAdapterFactory(
  provider: FiscalProviderCode,
  factory: FiscalProviderAdapterFactory,
): void {
  registry.set(provider, factory)
}

/** @en Builds an adapter instance, or null if unregistered. */
export function getFiscalProviderAdapter(
  provider: FiscalProviderCode,
  prisma: PrismaClient,
): FiscalProviderAdapter | null {
  const factory = registry.get(provider)
  if (!factory) return null
  return factory(prisma)
}

/** @en Lists registered provider codes (factories only). */
export function listRegisteredFiscalProviders(): FiscalProviderCode[] {
  return [...registry.keys()]
}

/** @en True when a factory is registered for the provider code. */
export function hasFiscalProviderAdapterFactory(provider: FiscalProviderCode): boolean {
  return registry.has(provider)
}

/** @en Clears the registry (tests only). */
export function clearFiscalProviderRegistry(): void {
  registry.clear()
}
