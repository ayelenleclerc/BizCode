import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Tenant-specific enabled modules for the session user (#223).
 * @es Módulos habilitados del tenant para el usuario de sesión (#223).
 * @pt-BR Módulos habilitados do tenant para o usuário da sessão (#223).
 */
export function registerMeFeaturesRoute(app: Application, prisma: PrismaClient): void {
  const service = new TenantConfigService(prisma)

  app.get('/api/me/features', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
    const data = await service.getFeaturesForTenant(tenantId)
    res.json({ success: true, data })
  })
}
