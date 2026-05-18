import type { Application, Request, Response } from 'express'
import { buildModuleCatalogPayload } from '../../src/lib/modules'
import type { AuthenticatedRequest } from '../auth'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en Read-only module catalog for feature-flag UI and API gating (issue #227).
 */
export function registerModulesCatalogRoute(app: Application, _ctx: RestRouteContext): void {
  app.get('/api/modules/catalog', (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    res.json({
      success: true,
      data: buildModuleCatalogPayload(),
    })
  })
}
