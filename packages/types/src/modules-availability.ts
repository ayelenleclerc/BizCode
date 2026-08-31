/**
 * @en Legal applicability of catalog modules per tax jurisdiction (#437).
 * @es Aplicabilidad legal de los módulos del catálogo por jurisdicción fiscal (#437).
 * @pt-BR Aplicabilidade legal dos módulos do catálogo por jurisdição fiscal (#437).
 *
 * @en A module without `availableForCountries` is applicable everywhere, so declaring the
 *   property is what narrows it; this keeps every pre-existing module unchanged.
 * @es Un módulo sin `availableForCountries` es aplicable en todas partes, así que declarar la
 *   propiedad es lo que lo restringe; esto deja intacto cualquier módulo preexistente.
 * @pt-BR Um módulo sem `availableForCountries` é aplicável em toda parte, portanto declarar a
 *   propriedade é o que o restringe; isso mantém intacto qualquer módulo preexistente.
 */

import { resolveJurisdiction } from './fiscal-jurisdictions'
import { MODULE_CATALOG, type ModuleKey } from './modules-catalog'
import type { ModuleDef } from './modules'

/**
 * @en Whether a module definition may be enabled in the given tax jurisdiction.
 * @es Si una definición de módulo puede habilitarse en la jurisdicción fiscal dada.
 * @pt-BR Se uma definição de módulo pode ser habilitada na jurisdição fiscal informada.
 */
export function isModuleDefAvailableInJurisdiction(
  def: ModuleDef,
  jurisdiction?: unknown,
): boolean {
  return def.availableForCountries?.includes(resolveJurisdiction(jurisdiction)) ?? true
}

/**
 * @en Same check by catalog key, for callers that only hold the module key.
 * @es Misma comprobación por clave de catálogo, para quienes solo tienen la clave del módulo.
 * @pt-BR Mesma verificação por chave de catálogo, para quem tem apenas a chave do módulo.
 */
export function isModuleAvailableInJurisdiction(
  key: ModuleKey,
  jurisdiction?: unknown,
): boolean {
  return isModuleDefAvailableInJurisdiction(MODULE_CATALOG[key], jurisdiction)
}

/**
 * @en Drops the modules that are not legally applicable in the jurisdiction, preserving order.
 * @es Descarta los módulos no aplicables legalmente en la jurisdicción, conservando el orden.
 * @pt-BR Remove os módulos não aplicáveis legalmente na jurisdição, preservando a ordem.
 */
export function filterModulesByJurisdiction(
  modules: readonly ModuleKey[],
  jurisdiction?: unknown,
): readonly ModuleKey[] {
  return modules.filter((key) => isModuleAvailableInJurisdiction(key, jurisdiction))
}
