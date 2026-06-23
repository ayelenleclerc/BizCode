import {
  MODULE_CATALOG,
  MODULE_KEYS,
  PLAN_BASE_MONTHLY_ARS,
  type ModuleKey,
  type TenantMonthlyPriceEstimate,
  type TenantPricingAddon,
} from '@bizcode/types'

export { PLAN_BASE_MONTHLY_ARS, type TenantMonthlyPriceEstimate, type TenantPricingAddon } from '@bizcode/types'

function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value)
}

function resolvePlanBase(plan: string): number {
  if (plan === 'pro') {
    return PLAN_BASE_MONTHLY_ARS.pro
  }
  if (plan === 'enterprise') {
    return PLAN_BASE_MONTHLY_ARS.enterprise
  }
  return PLAN_BASE_MONTHLY_ARS.starter
}

/**
 * @en Estimates monthly tenant price from plan and active module keys (addons from catalog).
 * @es Estima precio mensual del tenant según plan y módulos activos (addons desde catálogo).
 * @pt-BR Estima preço mensal do tenant por plano e módulos ativos (addons do catálogo).
 */
export function estimateTenantMonthlyPrice(
  plan: string,
  activeModuleKeys: readonly string[],
): TenantMonthlyPriceEstimate {
  const basePrice = resolvePlanBase(plan)
  const addons: TenantPricingAddon[] = []
  let addonSum = 0
  const seen = new Set<string>()

  for (const key of activeModuleKeys) {
    if (!isModuleKey(key) || seen.has(key)) {
      continue
    }
    seen.add(key)
    const price = MODULE_CATALOG[key].price
    if (price > 0) {
      addons.push({ moduleKey: key, price })
      addonSum += price
    }
  }

  addons.sort((a, b) => a.moduleKey.localeCompare(b.moduleKey))

  return {
    plan,
    basePrice,
    addons,
    totalMonthly: basePrice + addonSum,
  }
}
