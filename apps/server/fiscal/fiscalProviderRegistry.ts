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

/**
 * @en Builds an adapter instance, or null if unregistered.
 *   Uses a closed `switch` on known provider codes so CodeQL does not treat the
 *   Map lookup as an unvalidated dynamic method call (`js/unvalidated-dynamic-method-call`).
 * @es Construye una instancia de adapter, o null si no hay registro.
 *   Usa un `switch` cerrado sobre códigos conocidos para que CodeQL no trate el
 *   lookup del Map como llamada dinámica no validada.
 * @pt-BR Constrói uma instância de adapter, ou null se não houver registro.
 *   Usa um `switch` fechado sobre códigos conhecidos para que o CodeQL não trate
 *   o lookup do Map como chamada dinâmica não validada.
 */
export function getFiscalProviderAdapter(
  provider: FiscalProviderCode,
  prisma: PrismaClient,
): FiscalProviderAdapter | null {
  switch (provider) {
    case 'arca_wsfe': {
      const factory = registry.get('arca_wsfe')
      return factory ? factory(prisma) : null
    }
    case 'uruguay_dgi': {
      const factory = registry.get('uruguay_dgi')
      return factory ? factory(prisma) : null
    }
    case 'chile_sii': {
      const factory = registry.get('chile_sii')
      return factory ? factory(prisma) : null
    }
    case 'mexico_sat_pac': {
      const factory = registry.get('mexico_sat_pac')
      return factory ? factory(prisma) : null
    }
    default:
      return null
  }
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
