export const PLAN_KEYS = ['starter', 'pro', 'enterprise', 'trial'] as const

export type PlanKey = (typeof PLAN_KEYS)[number]

export const PLAN_FEATURE_KEYS = ['apps.driver', 'apps.seller'] as const

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number]

export type PlanDefinition = {
  key: PlanKey
  name: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: readonly PlanFeatureKey[]
}

export type TenantPlanUsage = {
  usersUsed: number
  invoicesUsed: number
}

export type TenantPlanSnapshot = {
  planKey: string
  planName: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: readonly string[]
  status: string
  usage: TenantPlanUsage
}
