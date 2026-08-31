import { MODULE_CATALOG, MODULE_KEYS, type ModuleKey } from './catalog'
export {
  DEFAULT_MODULES,
  MODULE_CATALOG,
  MODULE_KEYS,
  type ModuleKey,
} from './catalog'
import { resolveDeploymentEnv } from './env'
export { resolveDeploymentEnv } from './env'
export {
  isJurisdictionEnabled,
  resolveDefaultJurisdiction,
  resolveInstallationJurisdictions,
  type InstallationJurisdictions,
} from './jurisdictionEnv'
import { MODULE_PRESETS } from './presets'
export { MODULE_PRESET_KEYS, MODULE_PRESETS, type ModulePresetKey } from './presets'
export { BACKFILL_TENANT_MODULES, NEW_TENANT_MODULES } from './tenantDefaults'
export { moduleI18nKey, moduleI18nSuffix } from './moduleI18n'
export {
  PLAN_BASE_MONTHLY_ARS,
  estimateTenantMonthlyPrice,
  type TenantMonthlyPriceEstimate,
  type TenantPricingAddon,
} from './pricing'
export {
  DEPLOYMENT_ENVS,
  MODULE_PLANS,
  type DeploymentEnv,
  type ModuleDef,
  type ModulePlan,
  type ModuleValidationError,
  type ModuleValidationReason,
  type ModuleValidationResult,
} from './types'
import { canDeactivate as canDeactivateModule } from './validation'
export {
  canDeactivate,
  detectCatalogDependencyCycles,
  findUnknownCatalogDependencies,
  validateModuleSet,
} from './validation'

import { isModuleAvailableInJurisdiction } from '@bizcode/types'
import type { ModuleCatalogEntry } from '@bizcode/types'
export {
  filterModulesByJurisdiction,
  getDefaultModulesForJurisdiction,
  isModuleAvailableInJurisdiction,
} from '@bizcode/types'
export type { ModuleCatalogEntry } from '@bizcode/types'

/**
 * @en Serializes catalog metadata for API consumers; `canDeactivate` depends on the tenant jurisdiction (#207).
 * @es Serializa metadatos del catálogo para la API; `canDeactivate` depende de la jurisdicción del tenant (#207).
 * @pt-BR Serializa metadados do catálogo para a API; `canDeactivate` depende da jurisdição do tenant (#207).
 *
 * @en Modules that are not legally applicable in that jurisdiction are omitted so the UI never offers them (#437).
 * @es Los módulos no aplicables legalmente en esa jurisdicción se omiten para que la UI no los ofrezca (#437).
 * @pt-BR Os módulos não aplicáveis legalmente nessa jurisdição são omitidos para que a UI não os ofereça (#437).
 */
export function buildModuleCatalogPayload(jurisdiction?: unknown): {
  deploymentEnv: ReturnType<typeof resolveDeploymentEnv>
  modules: ModuleCatalogEntry[]
  presets: Record<string, { modules: ModuleKey[] }>
} {
  const deploymentEnv = resolveDeploymentEnv()
  const availableKeys = MODULE_KEYS.filter((key) =>
    isModuleAvailableInJurisdiction(key, jurisdiction),
  )
  const modules = availableKeys.map((key) => {
    const def = MODULE_CATALOG[key]
    return {
      key,
      label: def.label,
      required: def.required,
      requiredInProd: def.requiredInProd,
      dependencies: [...def.dependencies],
      plan: def.plan,
      price: def.price,
      canDeactivate: canDeactivateModule(key, deploymentEnv, jurisdiction),
    }
  })

  const presets = Object.fromEntries(
    Object.entries(MODULE_PRESETS).map(([name, modList]) => [
      name,
      { modules: modList.filter((key) => isModuleAvailableInJurisdiction(key, jurisdiction)) },
    ]),
  )

  return { deploymentEnv, modules, presets }
}
