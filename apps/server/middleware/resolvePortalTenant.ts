import type { NextFunction, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { ModuleKey } from '@bizcode/types'
import { NEW_TENANT_MODULES } from '@bizcode/types'
import { PortalConfigService } from '../services/PortalConfigService'
import { TenantConfigService, modulesInclude } from '../services/TenantConfigService'
import type { PortalRequest } from '../portal/portalTypes'

const TEST_DEFAULT_MODULES: ModuleKey[] = [
  ...NEW_TENANT_MODULES,
  'billing.orders',
  'finance.ledger',
  'clients.portal',
  'fiscal.remito',
]

function parseTestModulesFromEnv(): ModuleKey[] | undefined {
  if (process.env.NODE_ENV !== 'test') {
    return undefined
  }
  const raw = process.env.BIZCODE_TEST_MODULES?.trim()
  if (!raw) {
    return undefined
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean) as ModuleKey[]
}

/**
 * @en Resolves tenant by slug for `/api/portal/:tenantSlug/*` and validates portal availability.
 * @es Resuelve tenant por slug en `/api/portal/:tenantSlug/*` y valida disponibilidad del portal.
 * @pt-BR Resolve tenant por slug em `/api/portal/:tenantSlug/*` e valida disponibilidade do portal.
 */
export function resolvePortalTenant(prisma: PrismaClient) {
  const portalConfigService = new PortalConfigService(prisma)
  const tenantConfigService = new TenantConfigService(prisma)

  return async (req: PortalRequest, res: Response, next: NextFunction): Promise<void> => {
    const tenantSlug = String(req.params.tenantSlug ?? '').trim()
    if (!tenantSlug) {
      res.status(400).json({ success: false, error: 'tenantSlug is required' })
      return
    }

    const brandingResult = await portalConfigService.getBrandingForSlug(tenantSlug)
    if (!brandingResult) {
      res.status(404).json({ success: false, error: 'Tenant not found' })
      return
    }

    let modules: readonly ModuleKey[]
    if (process.env.NODE_ENV === 'test') {
      modules = parseTestModulesFromEnv() ?? TEST_DEFAULT_MODULES
    } else {
      try {
        const features = await tenantConfigService.getFeaturesForTenant(brandingResult.tenantId)
        modules = features.modules
      } catch {
        modules = [...NEW_TENANT_MODULES]
      }
    }

    if (!modulesInclude(modules, 'clients.portal')) {
      res.status(403).json({ success: false, error: 'module_not_enabled', module: 'clients.portal' })
      return
    }

    if (!brandingResult.branding.enabled) {
      res.status(404).json({ success: false, error: 'Portal not available' })
      return
    }

    req.portalTenant = {
      tenantId: brandingResult.tenantId,
      tenantSlug,
      tenantName: brandingResult.tenantName,
      modules,
      branding: brandingResult.branding,
    }
    next()
  }
}
