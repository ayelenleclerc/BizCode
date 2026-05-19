import { PLAN_BASE_MONTHLY_ARS } from '../modules/pricing'
import type { PlanDefinition, PlanFeatureKey, PlanKey } from './types'

/**
 * @en SaaS plan catalog (draft limits #181; align prices with PLAN_BASE_MONTHLY_ARS where applicable).
 * @es Catálogo de planes SaaS (límites borrador #181; precios alineados a PLAN_BASE_MONTHLY_ARS).
 * @pt-BR Catálogo de planos SaaS (limites rascunho #181; preços alinhados a PLAN_BASE_MONTHLY_ARS).
 */
export const PLAN_CATALOG: Record<PlanKey, PlanDefinition> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: PLAN_BASE_MONTHLY_ARS.starter,
    currency: 'ARS',
    maxUsers: 3,
    maxInvoicesPerMonth: 100,
    features: [],
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: PLAN_BASE_MONTHLY_ARS.pro,
    currency: 'ARS',
    maxUsers: 10,
    maxInvoicesPerMonth: 500,
    features: ['apps.driver'],
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: PLAN_BASE_MONTHLY_ARS.enterprise,
    currency: 'ARS',
    maxUsers: null,
    maxInvoicesPerMonth: null,
    features: ['apps.driver', 'apps.seller'],
  },
  trial: {
    key: 'trial',
    name: 'Trial',
    monthlyPrice: 0,
    currency: 'ARS',
    maxUsers: 3,
    maxInvoicesPerMonth: 50,
    features: [],
  },
}

export const DEFAULT_PLAN_KEY: PlanKey = 'starter'

/**
 * @en Returns whether a numeric limit is exceeded (null limit means unlimited).
 * @es Indica si se superó un límite numérico (null = ilimitado).
 * @pt-BR Indica se um limite numérico foi excedido (null = ilimitado).
 */
export function isLimitExceeded(used: number, max: number | null): boolean {
  if (max === null) {
    return false
  }
  return used >= max
}

/**
 * @en Checks plan feature membership using catalog keys only.
 * @es Comprueba si el plan incluye una feature del catálogo.
 * @pt-BR Verifica se o plano inclui um recurso do catálogo.
 */
export function planIncludesFeature(
  features: readonly string[],
  featureKey: PlanFeatureKey,
): boolean {
  return features.includes(featureKey)
}
