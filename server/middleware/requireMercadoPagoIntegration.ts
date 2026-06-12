import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { getTenantId } from '../routes/restDomainShared'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Blocks Mercado Pago routes when the tenant integration is disabled (#174).
 * @es Bloquea rutas Mercado Pago si la integración del tenant está deshabilitada (#174).
 * @pt-BR Bloqueia rotas Mercado Pago quando a integração do tenant está desabilitada (#174).
 */
export function requireMercadoPagoIntegration(prisma: PrismaClient) {
  const tenantConfig = new TenantConfigService(prisma)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await tenantConfig.getFeaturesForTenant(getTenantId(req))
      if (!features.integrations.includes('mercadopago')) {
        res.status(403).json({
          success: false,
          error: 'integration_not_enabled',
          integration: 'mercadopago',
        })
        return
      }
      next()
    } catch {
      res.status(500).json({ success: false, error: 'Failed to resolve tenant integrations' })
    }
  }
}
