import type { ModuleKey } from '@/lib/modules'
import type { UserRole } from '@/lib/rbac'

export type NavSection = {
  key: string
  path: string
  icon: string
  roles: readonly UserRole[] | null
  /** @en null = no module gate (role-only). @es null = sin gate de módulo. @pt-BR null = sem gate de módulo. */
  moduleKey: ModuleKey | null
}

/**
 * @en Sidebar sections: role visibility plus optional module key (#224).
 * @es Secciones del sidebar: visibilidad por rol y clave de módulo opcional (#224).
 * @pt-BR Seções da barra lateral: visibilidade por papel e chave de módulo opcional (#224).
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  { key: 'inicio', path: '/inicio', icon: '🏠', roles: null, moduleKey: null },
  {
    key: 'ventas',
    path: '/facturacion',
    icon: '💰',
    roles: ['owner', 'manager', 'seller', 'billing', 'cashier'],
    moduleKey: 'core.invoicing',
  },
  {
    key: 'pedidos',
    path: '/pedidos',
    icon: '📝',
    roles: ['owner', 'manager', 'seller', 'backoffice'],
    moduleKey: 'billing.orders',
  },
  {
    key: 'contratos',
    path: '/contratos',
    icon: '📑',
    roles: ['owner', 'manager', 'seller', 'billing', 'backoffice'],
    moduleKey: 'service.contracts',
  },
  {
    key: 'ordenesTrabajo',
    path: '/ordenes-trabajo',
    icon: '🛠️',
    roles: ['owner', 'manager', 'seller', 'billing', 'backoffice'],
    moduleKey: 'service.orders',
  },
  {
    key: 'garantias',
    path: '/garantias',
    icon: '🛡️',
    roles: ['owner', 'manager', 'seller', 'billing', 'backoffice'],
    moduleKey: 'service.warranties',
  },
  {
    key: 'caja',
    path: '/caja',
    icon: '💵',
    roles: ['owner', 'manager', 'cashier', 'seller', 'billing'],
    moduleKey: 'pos.cashier',
  },
  {
    key: 'clientes',
    path: '/clientes',
    icon: '📋',
    roles: ['owner', 'manager', 'seller', 'backoffice', 'collections', 'finance', 'auditor'],
    moduleKey: 'core.clients',
  },
  {
    key: 'catalogo',
    path: '/articulos',
    icon: '📦',
    roles: ['owner', 'manager', 'seller', 'backoffice', 'warehouse_op', 'warehouse_lead', 'logistics_planner'],
    moduleKey: 'core.catalog',
  },
  {
    key: 'listasPrecios',
    path: '/listas-precios',
    icon: '🏷️',
    roles: ['owner', 'manager', 'seller', 'backoffice'],
    moduleKey: 'catalog.pricelists',
  },
  {
    key: 'proveedores',
    path: '/proveedores',
    icon: '\u{1F3ED}',
    roles: ['owner', 'manager', 'seller', 'backoffice', 'warehouse_op', 'warehouse_lead', 'logistics_planner'],
    moduleKey: null,
  },
  {
    key: 'compras',
    path: '/compras',
    icon: '🛒',
    roles: ['owner', 'manager', 'warehouse_lead'],
    moduleKey: 'logistics.purchases',
  },
  {
    key: 'recuentos',
    path: '/recuentos',
    icon: '📋',
    roles: ['owner', 'manager', 'warehouse_lead'],
    moduleKey: 'inventory.count',
  },
  {
    key: 'logistica',
    path: '/logistica',
    icon: '🚚',
    roles: ['owner', 'manager', 'warehouse_op', 'warehouse_lead', 'logistics_planner', 'driver'],
    moduleKey: 'logistics.dispatches',
  },
  {
    key: 'picking',
    path: '/logistica/picking',
    icon: '📦',
    roles: ['owner', 'manager', 'warehouse_op', 'warehouse_lead', 'logistics_planner'],
    moduleKey: 'logistics.picking',
  },
  {
    key: 'seguimiento',
    path: '/logistica/seguimiento',
    icon: '📍',
    roles: ['owner', 'manager', 'logistics_planner'],
    moduleKey: 'logistics.gps',
  },
  {
    key: 'finanzas',
    path: '/finanzas',
    icon: '💹',
    roles: ['owner', 'manager', 'billing', 'cashier', 'collections', 'finance', 'auditor'],
    moduleKey: 'finance.collections',
  },
  {
    key: 'reportes',
    path: '/reportes',
    icon: '📊',
    roles: [
      'owner',
      'manager',
      'billing',
      'cashier',
      'collections',
      'finance',
      'auditor',
      'backoffice',
      'warehouse_lead',
      'logistics_planner',
    ],
    moduleKey: 'analytics.dashboard',
  },
  {
    key: 'cobros',
    path: '/cobros',
    icon: '💵',
    roles: ['owner', 'manager', 'billing', 'cashier', 'collections', 'finance', 'auditor'],
    moduleKey: 'finance.collections',
  },
  {
    key: 'auditLog',
    path: '/admin/audit-log',
    icon: '📜',
    roles: ['owner', 'manager', 'finance', 'auditor'],
    moduleKey: 'admin.audit_log',
  },
  { key: 'chat', path: '/chat', icon: '💬', roles: null, moduleKey: 'comms.chat' },
  {
    key: 'configuracion',
    path: '/configuracion',
    icon: '⚙️',
    roles: ['owner', 'manager'],
    moduleKey: null,
  },
  {
    key: 'superadmin',
    path: '/superadmin',
    icon: '🛡️',
    roles: ['super_admin'],
    moduleKey: null,
  },
] as const

/** @en Paths guarded by ModuleRoute in App.tsx. @es Rutas con ModuleRoute en App.tsx. @pt-BR Rotas com ModuleRoute em App.tsx. */
export const ROUTE_MODULE_GUARDS: ReadonlyArray<{ path: string; moduleKey: ModuleKey }> = [
  { path: 'pedidos', moduleKey: 'billing.orders' },
  { path: 'contratos', moduleKey: 'service.contracts' },
  { path: 'ordenes-trabajo', moduleKey: 'service.orders' },
  { path: 'garantias', moduleKey: 'service.warranties' },
  { path: 'caja', moduleKey: 'pos.cashier' },
  { path: 'listas-precios', moduleKey: 'catalog.pricelists' },
  { path: 'logistica', moduleKey: 'logistics.dispatches' },
  { path: 'logistica/picking', moduleKey: 'logistics.picking' },
  { path: 'logistica/seguimiento', moduleKey: 'logistics.gps' },
  { path: 'chat', moduleKey: 'comms.chat' },
  { path: 'cobros', moduleKey: 'finance.collections' },
  { path: 'finanzas', moduleKey: 'finance.collections' },
  { path: 'finanzas/reconciliacion-mp', moduleKey: 'finance.collections' },
  { path: 'finanzas/contracargos-mp', moduleKey: 'finance.collections' },
  { path: 'admin/audit-log', moduleKey: 'admin.audit_log' },
  { path: 'compras', moduleKey: 'logistics.purchases' },
  { path: 'recuentos', moduleKey: 'inventory.count' },
  { path: 'reportes', moduleKey: 'analytics.dashboard' },
]
