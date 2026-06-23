import type { ModulePlan } from './modules'

/**
 * @en Monthly SaaS base price per plan in ARS (#226 product decision; not in MODULE_CATALOG).
 * @es Precio base mensual SaaS por plan en ARS (decisión producto #226; no está en MODULE_CATALOG).
 * @pt-BR Preço base mensual SaaS por plano em ARS (decisão de produto #226; não está em MODULE_CATALOG).
 */
export const PLAN_BASE_MONTHLY_ARS: Record<ModulePlan, number> = {
  starter: 0,
  pro: 15000,
  enterprise: 45000,
}
