import type { Request } from 'express'
import type { ModuleKey } from '@bizcode/types'

export type PortalBrandingDto = {
  tenantName: string
  tenantSlug: string
  enabled: boolean
  showPedidos: boolean
  logoUrl: string | null
  primaryColor: string | null
  footerText: string | null
}

export type PortalAuthContext = {
  tenantId: number
  tenantSlug: string
  portalClienteId: number
  sessionId?: number
}

export type PortalTenantContext = {
  tenantId: number
  tenantSlug: string
  tenantName: string
  modules: readonly ModuleKey[]
  branding: PortalBrandingDto
}

export type PortalRequest = Request & {
  portalTenant?: PortalTenantContext
  portalAuth?: PortalAuthContext
}
