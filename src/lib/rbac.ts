export const USER_CHANNELS = ['counter', 'field', 'backoffice', 'warehouse', 'delivery'] as const

export type UserChannel = (typeof USER_CHANNELS)[number]

export const USER_ROLES = [
  'super_admin',
  'owner',
  'manager',
  'seller',
  'backoffice',
  'warehouse_op',
  'warehouse_lead',
  'logistics_planner',
  'driver',
  'billing',
  'cashier',
  'collections',
  'finance',
  'auditor',
] as const

export type UserRole = (typeof USER_ROLES)[number]

/**
 * @en Roles visible and assignable to tenant users. `super_admin` is a
 *     platform-internal role and must never appear in tenant UI or be
 *     assignable via the API — it can only be created via the bootstrap CLI.
 * @es Roles visibles y asignables para usuarios de un tenant. `super_admin`
 *     es un rol interno de la plataforma y nunca debe aparecer en el UI de
 *     clientes ni ser asignable por API — solo se crea via CLI de bootstrap.
 * @pt-BR Roles visíveis e atribuíveis para usuários de um tenant. `super_admin`
 *     é um role interno da plataforma e nunca deve aparecer no UI de clientes
 *     nem ser atribuível via API — só pode ser criado pelo CLI de bootstrap.
 */
export const TENANT_ROLES = USER_ROLES.filter((r) => r !== 'super_admin')

export type TenantRole = (typeof TENANT_ROLES)[number]

export const PERMISSIONS = [
  'users.manage',
  'roles.assign',
  'sales.create',
  'sales.cancel',
  'customers.read',
  'customers.manage',
  'products.read',
  'products.manage',
  'inventory.adjust',
  'orders.create',
  'orders.pick',
  'orders.dispatch',
  'orders.deliver.confirm',
  'reports.operational.read',
  'reports.financial.read',
  'settings.business.manage',
  'settings.fiscal.manage',
  'audit.read',
  'platform.tenants.manage',
  'platform.support.impersonate',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export type AuthScope = {
  tenantId: number
  branchIds: number[]
  warehouseIds: number[]
  routeIds: number[]
  channels: UserChannel[]
}

export type AuthClaims = {
  userId: number
  tenantId: number
  username: string
  role: UserRole
  permissions: Permission[]
  scope: AuthScope
}

/** ERP-wide permissions for tenant owner (single source of truth for owner / super_admin ERP slice). */
export const OWNER_PERMISSIONS = [
  'users.manage',
  'roles.assign',
  'sales.create',
  'sales.cancel',
  'customers.read',
  'customers.manage',
  'products.read',
  'products.manage',
  'inventory.adjust',
  'orders.create',
  'orders.pick',
  'orders.dispatch',
  'orders.deliver.confirm',
  'reports.operational.read',
  'reports.financial.read',
  'settings.business.manage',
  'settings.fiscal.manage',
  'audit.read',
] as const satisfies readonly Permission[]

/** Platform-only permissions (not included in owner). */
const PLATFORM_SUPER_ADMIN_PERMISSIONS = ['platform.tenants.manage', 'platform.support.impersonate'] as const satisfies readonly Permission[]

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: [...OWNER_PERMISSIONS, ...PLATFORM_SUPER_ADMIN_PERMISSIONS],
  owner: [...OWNER_PERMISSIONS],
  manager: [
    'sales.create',
    'sales.cancel',
    'customers.read',
    'customers.manage',
    'products.read',
    'products.manage',
    'inventory.adjust',
    'orders.create',
    'orders.pick',
    'orders.dispatch',
    'reports.operational.read',
    'audit.read',
  ],
  seller: ['sales.create', 'customers.read', 'customers.manage', 'orders.create', 'products.read'],
  backoffice: ['customers.read', 'customers.manage', 'products.read', 'reports.operational.read'],
  warehouse_op: ['orders.pick', 'products.read'],
  warehouse_lead: ['orders.pick', 'orders.dispatch', 'inventory.adjust', 'reports.operational.read'],
  logistics_planner: ['orders.dispatch', 'reports.operational.read'],
  driver: ['orders.deliver.confirm'],
  billing: ['sales.create', 'sales.cancel', 'reports.operational.read'],
  cashier: ['sales.create', 'reports.operational.read'],
  collections: ['reports.operational.read', 'reports.financial.read'],
  finance: ['reports.financial.read', 'audit.read'],
  auditor: ['reports.operational.read', 'reports.financial.read', 'audit.read'],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
