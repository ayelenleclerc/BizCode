import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { getTenantId } from '../routes/restDomainShared'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Blocks Mercado Libre routes when the tenant integration is disabled (#183).
 * @es Bloquea rutas Mercado Libre si la integración del tenant está deshabilitada (#183).
 * @pt-BR Bloqueia rotas Mercado Livre quando a integração do tenant está desabilitada (#183).
 */
export function requireMeliIntegration(prisma: PrismaClient) {
  const tenantConfig = new TenantConfigService(prisma)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await tenantConfig.getFeaturesForTenant(getTenantId(req))
      if (!features.integrations.includes('meli')) {
        res.status(403).json({
          success: false,
          error: 'integration_not_enabled',
          integration: 'meli',
        })
        return
      }
      next()
    } catch {
      res.status(500).json({ success: false, error: 'Failed to resolve tenant integrations' })
    }
  }
}
