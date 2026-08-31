import type { TenantMonthlyPriceEstimate } from './modules'
import type { TenantPlanSnapshot } from './plans'

// ============ FEATURE FLAGS (TENANT) ============

export type TenantFeaturesData = {
  modules: string[]
  integrations: string[]
  /**
   * @en Tenant tax jurisdiction (#207); ISO-3166-1 alpha-2, `AR` by default.
   * @es Jurisdicción fiscal del tenant (#207); ISO-3166-1 alpha-2, `AR` por defecto.
   * @pt-BR Jurisdição fiscal do tenant (#207); ISO-3166-1 alpha-2, `AR` por padrão.
   */
  jurisdiccionFiscal: string
  /**
   * @en Jurisdictions this installation offers (#437); a tenant can only be moved to one of these.
   * @es Jurisdicciones que ofrece esta instalación (#437); un tenant solo puede moverse a una de estas.
   * @pt-BR Jurisdições que esta instalação oferece (#437); um tenant só pode ser movido para uma destas.
   */
  jurisdiccionesHabilitadas?: string[]
}

// ============ PLANS (PUBLIC API) ============

export type PublicPlanDTO = {
  key: string
  name: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: string[]
}

/** @deprecated Use TenantPlanSnapshot — alias for api-client compatibility */
export type TenantPlanSnapshotDTO = TenantPlanSnapshot

// ============ SUPERADMIN (PLATFORM) ============

export type SuperadminTenantListRow = {
  id: number
  name: string
  slug: string
  active: boolean
  plan: string | null
  userCount: number
  facturaCount: number
  createdAt: string
}

export type SuperadminTenantDetail = {
  id: number
  name: string
  slug: string
  active: boolean
  maintenanceMode: boolean
  createdAt: string
  updatedAt: string
  plan: string | null
  modulesCount: number
  configUpdatedAt: string | null
  stats: {
    userCount: number
    facturaCount: number
    pedidoCount: number
    clienteCount: number
  }
  lastActivityAt: string | null
}

export type SuperadminGlobalStats = {
  activeTenants: number
  totalTenants: number
  inactiveTenants: number
  facturasToday: number
  totalUsers: number
}

/** Security monitoring timeline row for super_admin (#221). */
export type SuperadminSecurityEvent = {
  id: number
  tenantId: number
  tenantSlug: string | null
  userId: number | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  securityEventType: string
  severity: string
  metadata: unknown
  createdAt: string
}

export type SuperadminTenantCreateInput = {
  name: string
  slug: string
  plan?: string
  ownerUsername?: string
  ownerPassword?: string
}

// ============ TENANT PRICING / CONFIG / TRIALS ============

/** API response shape for superadmin pricing endpoint */
export type TenantPricingData = TenantMonthlyPriceEstimate

export type TenantModuleTrialDTO = {
  id: number
  tenantId: number
  moduleKey: string
  expiresAt: string
  active: boolean
  daysRemaining: number
  createdAt: string
}

export type TenantModuleTrialActivateInput = {
  moduleKey: string
  days?: number
  reason?: string
}

export type TenantConfigDTO = {
  tenantId: number
  businessType: string
  rubros: string[]
  plan: string
  modules: string[]
  integrations: string[]
  /**
   * @en Tenant tax jurisdiction (#207); ISO-3166-1 alpha-2, `AR` by default.
   * @es Jurisdicción fiscal del tenant (#207); ISO-3166-1 alpha-2, `AR` por defecto.
   * @pt-BR Jurisdição fiscal do tenant (#207); ISO-3166-1 alpha-2, `AR` por padrão.
   */
  jurisdiccionFiscal: string
  updatedAt: string
}

export type TenantConfigUpsertInput = {
  modules: string[]
  reason: string
  businessType?: string
  rubros?: string[]
  plan?: string
  integrations?: string[]
  /**
   * @en Omitting it preserves the jurisdiction currently stored for the tenant (#207).
   * @es Omitirlo conserva la jurisdicción actualmente almacenada para el tenant (#207).
   * @pt-BR Omiti-lo preserva a jurisdição atualmente armazenada para o tenant (#207).
   */
  jurisdiccionFiscal?: string
}

export type TenantConfigApplyTemplateInput = {
  preset: string
  reason?: string
}

export type TenantConfigHistoryEntry = {
  id: number
  changedById: number
  before: Record<string, unknown>
  after: Record<string, unknown>
  reason: string | null
  createdAt: string
}

export type TenantConfigHistoryData = {
  total: number
  items: TenantConfigHistoryEntry[]
}

export type ModuleCatalogEntryDTO = {
  key: string
  label: string
  required: boolean
  requiredInProd: boolean
  dependencies: string[]
  plan: string
  price: number
  canDeactivate: boolean
}

export type ModuleCatalogDataDTO = {
  deploymentEnv: 'dev' | 'prod'
  modules: ModuleCatalogEntryDTO[]
  presets: Record<string, { modules: string[] }>
}

// ============ DASHBOARD ============

export type DashboardWidget = { count: number; total: string }

export type DashboardFacturasPagarDTO = {
  vencido: DashboardWidget
  proximoVencer: DashboardWidget
}

export type DashboardSummaryDTO = {
  ventasHoy: DashboardWidget
  facturasVencidas: DashboardWidget
  cobrosHoy: DashboardWidget
  alertasActivas: number
  facturasPagar: DashboardFacturasPagarDTO
}

// ============ PROVEEDOR ALERTAS (CONFIG RESPONSE) ============

export type AlertaProveedorConfigDTO = {
  diasPrevioAviso: number
  diasCritico: number
  notifEmail: boolean
  notifInApp: boolean
}
