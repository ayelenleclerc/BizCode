import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { getTenantId } from '../routes/restDomainShared'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Blocks WooCommerce routes when the tenant integration is disabled (#188).
 * @es Bloquea rutas WooCommerce si la integración del tenant está deshabilitada (#188).
 * @pt-BR Bloqueia rotas WooCommerce quando a integração do tenant está desabilitada (#188).
 */
export function requireWooCommerceIntegration(prisma: PrismaClient) {
  const tenantConfig = new TenantConfigService(prisma)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await tenantConfig.getFeaturesForTenant(getTenantId(req))
      if (!features.integrations.includes('woocommerce')) {
        res.status(403).json({
          success: false,
          error: 'integration_not_enabled',
          integration: 'woocommerce',
        })
        return
      }
      next()
    } catch {
      res.status(500).json({ success: false, error: 'Failed to resolve tenant integrations' })
    }
  }
}
