import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import { resolveInstallationJurisdictions } from '../../web/src/lib/modules/jurisdictionEnv'
import { TenantConfigService } from '../services/TenantConfigService'

/**
 * @en Tenant-specific enabled modules for the session user (#223), plus the jurisdictions this
 *   installation offers so the super-admin selector cannot propose a disabled one (#437).
 * @es Módulos habilitados del tenant para el usuario de sesión (#223), más las jurisdicciones que
 *   ofrece esta instalación para que el selector de super-admin no proponga una deshabilitada (#437).
 * @pt-BR Módulos habilitados do tenant para o usuário da sessão (#223), mais as jurisdições que esta
 *   instalação oferece para que o seletor de super-admin não proponha uma desabilitada (#437).
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
    const features = await service.getFeaturesForTenant(tenantId)
    const installation = resolveInstallationJurisdictions()
    res.json({
      success: true,
      data: { ...features, jurisdiccionesHabilitadas: [...installation.enabled] },
    })
  })
}
