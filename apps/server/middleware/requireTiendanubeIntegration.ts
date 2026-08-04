import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { getTenantId } from '../routes/restDomainShared'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Blocks Tiendanube routes when the tenant integration is disabled (#187).
 * @es Bloquea rutas Tiendanube si la integración del tenant está deshabilitada (#187).
 * @pt-BR Bloqueia rotas Tiendanube quando a integração do tenant está desabilitada (#187).
 */
export function requireTiendanubeIntegration(prisma: PrismaClient) {
  const tenantConfig = new TenantConfigService(prisma)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await tenantConfig.getFeaturesForTenant(getTenantId(req))
      if (!features.integrations.includes('tiendanube')) {
        res.status(403).json({
          success: false,
          error: 'integration_not_enabled',
          integration: 'tiendanube',
        })
        return
      }
      next()
    } catch {
      res.status(500).json({ success: false, error: 'Failed to resolve tenant integrations' })
    }
  }
}
