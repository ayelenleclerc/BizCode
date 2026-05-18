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
import type { ModulePlan } from './types'
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

export type ModuleCatalogEntry = {
  key: ModuleKey
  label: string
  required: boolean
  requiredInProd: boolean
  dependencies: readonly ModuleKey[]
  plan: ModulePlan
  price: number
  canDeactivate: boolean
}

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
