export const MODULE_PLANS = ['starter', 'pro', 'enterprise'] as const

export type ModulePlan = (typeof MODULE_PLANS)[number]

export const DEPLOYMENT_ENVS = ['dev', 'prod'] as const

export type DeploymentEnv = (typeof DEPLOYMENT_ENVS)[number]

export interface ModuleDef {
  label: string
  required: boolean
  requiredInProd: boolean
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
