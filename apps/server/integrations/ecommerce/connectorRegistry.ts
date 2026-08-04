/**
 * @en Registry of ecommerce connector factories keyed by connector type (#189).
 * @es Registro de factories de conectores eCommerce por tipo (#189).
 * @pt-BR Registro de factories de conectores eCommerce por tipo (#189).
 */

import type { PrismaClient } from '@prisma/client'
import type { EcommerceConnector, EcommerceConnectorType } from './EcommerceConnector'

export type EcommerceConnectorFactory = (
  prisma: PrismaClient,
  tenantId: number,
) => EcommerceConnector

const registry = new Map<EcommerceConnectorType, EcommerceConnectorFactory>()

/**
 * @en Registers a connector factory for the sync engine.
 * @es Registra una factory de conector para el motor de sync.
 * @pt-BR Registra uma factory de conector para o motor de sync.
 */
export function registerEcommerceConnectorFactory(
  type: EcommerceConnectorType,
  factory: EcommerceConnectorFactory,
): void {
  registry.set(type, factory)
}

/**
 * @en Builds a tenant-scoped connector or returns null if unregistered.
 * @es Construye un conector con scope de tenant o null si no hay registro.
 * @pt-BR Constrói um conector com escopo de tenant ou null se não houver registro.
 */
export function getEcommerceConnector(
  type: EcommerceConnectorType,
  prisma: PrismaClient,
  tenantId: number,
): EcommerceConnector | null {
  const factory = registry.get(type)
  if (!factory) return null
  return factory(prisma, tenantId)
}

/**
 * @en Lists registered connector types (factories only).
 * @es Lista tipos de conector registrados (solo factories).
 * @pt-BR Lista tipos de conector registrados (somente factories).
 */
export function listRegisteredConnectorTypes(): EcommerceConnectorType[] {
  return [...registry.keys()]
}

/**
 * @en True when a factory is registered for the type.
 * @es True si hay factory registrada para el tipo.
 * @pt-BR True se há factory registrada para o tipo.
 */
export function hasEcommerceConnectorFactory(type: EcommerceConnectorType): boolean {
  return registry.has(type)
}

/**
 * @en Clears the registry (tests only).
 * @es Limpia el registro (solo tests).
 * @pt-BR Limpa o registro (somente testes).
 */
export function clearEcommerceConnectorRegistry(): void {
  registry.clear()
}
