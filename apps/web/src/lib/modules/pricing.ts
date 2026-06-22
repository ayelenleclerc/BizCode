import { MODULE_CATALOG, MODULE_KEYS, type ModuleKey } from './catalog'
import type { ModulePlan } from './types'

/**
 * @en Monthly SaaS base price per plan in ARS (#226 product decision; not in MODULE_CATALOG).
 * @es Precio base mensual SaaS por plan en ARS (decisión producto #226; no está en MODULE_CATALOG).
 * @pt-BR Preço base mensal SaaS por plano em ARS (decisão de produto #226; não está em MODULE_CATALOG).
 */
export const PLAN_BASE_MONTHLY_ARS: Record<ModulePlan, number> = {
  starter: 0,
  pro: 15000,
  enterprise: 45000,
}

export type TenantPricingAddon = {
  moduleKey: ModuleKey
  price: number
}

export type TenantMonthlyPriceEstimate = {
  plan: string
  basePrice: number
  addons: TenantPricingAddon[]
  totalMonthly: number
}

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
