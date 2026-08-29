import type { Application, Request, Response } from 'express'
import { buildModuleCatalogPayload } from '../../web/src/lib/modules'
import type { AuthenticatedRequest } from '../auth'
import { getTenantJurisdiction } from '../services/tenantJurisdiction'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en Read-only module catalog for feature-flag UI and API gating (issue #227); `canDeactivate` reflects the tenant tax jurisdiction (#207).
 * @es Catálogo de módulos de solo lectura para la UI de feature flags y el gating de API (#227); `canDeactivate` refleja la jurisdicción fiscal del tenant (#207).
 * @pt-BR Catálogo de módulos somente leitura para a UI de feature flags e o gating de API (#227); `canDeactivate` reflete a jurisdição fiscal do tenant (#207).
 */
export function registerModulesCatalogRoute(app: Application, ctx: RestRouteContext): void {
  app.get('/api/modules/catalog', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
    const jurisdiction = await getTenantJurisdiction(ctx.prisma, tenantId)

    res.json({
      success: true,
      data: buildModuleCatalogPayload(jurisdiction),
    })
  })
}
