import { DEFAULT_MODULES, type ModuleKey } from './modules-catalog'

export const MODULE_PRESET_KEYS = [
  'MAYORISTA_ALIMENTOS',
  'MINORISTA_ROPA',
  'MAYORISTA_GENERAL',
  'MINORISTA_ALIMENTOS',
  'EMPRESA_SERVICIOS',
  'RETAIL_POS',
] as const

export type ModulePresetKey = (typeof MODULE_PRESET_KEYS)[number]

function mergeModules(...groups: readonly (readonly ModuleKey[])[]): ModuleKey[] {
  return [...new Set(groups.flat())]
}

/**
 * @en Default module bundles by business template (issue #223 / #227); validated in tests for prod.
 * @es Paquetes de módulos por plantilla de negocio (#223 / #227); validados en tests para prod.
 * @pt-BR Pacotes de módulos por template de negócio (#223 / #227); validados em testes para prod.
 */
export const MODULE_PRESETS: Record<ModulePresetKey, readonly ModuleKey[]> = {
  MAYORISTA_ALIMENTOS: mergeModules(DEFAULT_MODULES, [
    'billing.orders',
    'logistics.dispatches',
    'logistics.picking',
    'inventory.stock',
    'inventory.warehouses',
    'inventory.fefo',
    'logistics.purchases',
    'apps.driver',
    'finance.commissions',
    'platform.data_import',
  ]),
  MINORISTA_ROPA: mergeModules(DEFAULT_MODULES, [
    'billing.pos',
    'pos.cashier',
    'inventory.stock',
    'inventory.warehouses',
    'catalog.multicurrency',
    'clients.loyalty',
  ]),
  MAYORISTA_GENERAL: mergeModules(DEFAULT_MODULES, [
    'billing.orders',
    'logistics.dispatches',
    'inventory.stock',
    'inventory.warehouses',
    'inventory.uom',
    'finance.bank_reconcile',
    'logistics.purchases',
    'finance.commissions',
    'platform.data_import',
  ]),
  MINORISTA_ALIMENTOS: mergeModules(DEFAULT_MODULES, [
    'billing.pos',
    'pos.cashier',
    'inventory.stock',
    'inventory.warehouses',
    'inventory.fefo',
    'billing.orders',
    'finance.commissions',
    'platform.data_import',
  ]),
  EMPRESA_SERVICIOS: mergeModules(DEFAULT_MODULES, [
    'service.contracts',
    'service.orders',
    'billing.credit_notes',
    'comms.chat',
  ]),
  RETAIL_POS: mergeModules(DEFAULT_MODULES, [
    'billing.pos',
    'pos.cashier',
    'inventory.stock',
    'inventory.warehouses',
    'inventory.count',
    'inventory.uom',
    'clients.loyalty',
  ]),
}
