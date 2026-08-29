export const MODULE_PLANS = ['starter', 'pro', 'enterprise'] as const

export type ModulePlan = (typeof MODULE_PLANS)[number]

export const DEPLOYMENT_ENVS = ['dev', 'prod'] as const

export type DeploymentEnv = (typeof DEPLOYMENT_ENVS)[number]

export interface ModuleDef {
  label: string
  required: boolean
  requiredInProd: boolean
  /**
   * @en Jurisdictions where the module is mandatory in production (#207); country-specific fiscal modules use it instead of a blanket `requiredInProd`.
   * @es Jurisdicciones donde el módulo es obligatorio en producción (#207); los módulos fiscales por país lo usan en lugar de un `requiredInProd` global.
   * @pt-BR Jurisdições em que o módulo é obrigatório em produção (#207); os módulos fiscais por país o usam em vez de um `requiredInProd` global.
   */
  requiredInProdForCountries?: readonly string[]
  dependencies: readonly string[]
  plan: ModulePlan
  price: number
}

export type ModuleValidationReason =
  | 'required_module_missing'
  | `missing_dependency:${string}`

export interface ModuleValidationError {
  module: string
  reason: ModuleValidationReason
}

export interface ModuleValidationResult {
  valid: boolean
  errors: ModuleValidationError[]
}

export type TenantPricingAddon = {
  moduleKey: string
  price: number
}

export type TenantMonthlyPriceEstimate = {
  plan: string
  basePrice: number
  addons: TenantPricingAddon[]
  totalMonthly: number
}
