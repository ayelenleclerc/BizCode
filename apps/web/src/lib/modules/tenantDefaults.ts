import { DEFAULT_MODULES, type ModuleKey } from './catalog'

/**
 * @en Modules enabled for new tenants at creation (setup-owner / seed).
 * @es Módulos habilitados para tenants nuevos al crearse (setup-owner / seed).
 * @pt-BR Módulos habilitados para novos tenants na criação (setup-owner / seed).
 */
export const NEW_TENANT_MODULES: readonly ModuleKey[] = [...DEFAULT_MODULES]

/**
 * @en Modules assigned on DB backfill for existing tenants (includes billing.orders for #132 compat).
 * @es Módulos asignados en backfill para tenants existentes (incluye billing.orders por compat #132).
 * @pt-BR Módulos atribuídos no backfill para tenants existentes (inclui billing.orders por compat #132).
 */
export const BACKFILL_TENANT_MODULES: readonly ModuleKey[] = [
  ...DEFAULT_MODULES,
  'billing.orders',
]
