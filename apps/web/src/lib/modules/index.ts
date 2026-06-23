import { MODULE_CATALOG, MODULE_KEYS, type ModuleKey } from './catalog'
export {
  DEFAULT_MODULES,
  MODULE_CATALOG,
  MODULE_KEYS,
  type ModuleKey,
} from './catalog'
import { resolveDeploymentEnv } from './env'
export { resolveDeploymentEnv } from './env'
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

import type { ModuleCatalogEntry } from '@bizcode/types'
export type { ModuleCatalogEntry } from '@bizcode/types'

/**
 * @en Serializes catalog metadata for API consumers (no tenant-specific state).
 * @es Serializa metadatos del catálogo para consumidores de la API (sin estado por tenant).
 * @pt-BR Serializa metadados do catálogo para consumidores da API (sem estado por tenant).
 */
export function buildModuleCatalogPayload(): {
  deploymentEnv: ReturnType<typeof resolveDeploymentEnv>
  modules: ModuleCatalogEntry[]
  presets: Record<string, { modules: ModuleKey[] }>
} {
  const deploymentEnv = resolveDeploymentEnv()
  const modules = MODULE_KEYS.map((key) => {
    const def = MODULE_CATALOG[key]
    return {
      key,
      label: def.label,
      required: def.required,
      requiredInProd: def.requiredInProd,
      dependencies: [...def.dependencies],
      plan: def.plan,
      price: def.price,
      canDeactivate: canDeactivateModule(key, deploymentEnv),
    }
  })

  const presets = Object.fromEntries(
    Object.entries(MODULE_PRESETS).map(([name, modList]) => [name, { modules: [...modList] }]),
  )

  return { deploymentEnv, modules, presets }
}
