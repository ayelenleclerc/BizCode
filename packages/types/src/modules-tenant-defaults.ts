import { DEFAULT_FISCAL_JURISDICTION } from './fiscal-jurisdictions'
import { filterModulesByJurisdiction } from './modules-availability'
import { DEFAULT_MODULES, type ModuleKey } from './modules-catalog'

/**
 * @en Default modules that are legally applicable in a jurisdiction (#437); a tenant taxed
 *   outside Argentina no longer starts with the Argentine fiscal modules.
 * @es Módulos por defecto legalmente aplicables en una jurisdicción (#437); un tenant que
 *   tributa fuera de Argentina ya no arranca con los módulos fiscales argentinos.
 * @pt-BR Módulos padrão legalmente aplicáveis em uma jurisdição (#437); um tenant tributado
 *   fora da Argentina já não começa com os módulos fiscais argentinos.
 */
export function getDefaultModulesForJurisdiction(jurisdiction?: unknown): readonly ModuleKey[] {
  return filterModulesByJurisdiction(DEFAULT_MODULES, jurisdiction)
}

/**
 * @en Modules enabled for new tenants at creation (setup-owner / seed) in the default
 *   jurisdiction; callers that know the tenant jurisdiction should use
 *   `getDefaultModulesForJurisdiction` instead.
 * @es Módulos habilitados para tenants nuevos al crearse (setup-owner / seed) en la
 *   jurisdicción por defecto; quien conozca la jurisdicción del tenant debe usar
 *   `getDefaultModulesForJurisdiction`.
 * @pt-BR Módulos habilitados para novos tenants na criação (setup-owner / seed) na jurisdição
 *   padrão; quem conhece a jurisdição do tenant deve usar `getDefaultModulesForJurisdiction`.
 */
export const NEW_TENANT_MODULES: readonly ModuleKey[] = getDefaultModulesForJurisdiction(
  DEFAULT_FISCAL_JURISDICTION,
)

/**
 * @en Modules assigned on DB backfill for existing tenants (includes billing.orders for #132 compat).
 * @es Módulos asignados en backfill para tenants existentes (incluye billing.orders por compat #132).
 * @pt-BR Módulos atribuídos no backfill para tenants existentes (inclui billing.orders por compat #132).
 */
export const BACKFILL_TENANT_MODULES: readonly ModuleKey[] = [
  ...getDefaultModulesForJurisdiction(DEFAULT_FISCAL_JURISDICTION),
  'billing.orders',
]
