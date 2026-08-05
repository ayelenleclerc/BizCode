import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireTiendanubeIntegration } from '../middleware/requireTiendanubeIntegration'
import { tiendanubeOAuthHttpRateLimiter } from '../middleware/routeRateLimit'
import { TiendanubeConfigService } from '../services/TiendanubeConfigService'
import { TiendanubeOAuthService } from '../services/TiendanubeOAuthService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Tiendanube OAuth and connection status API (#187).
 * @es API OAuth y estado de conexión Tiendanube (#187).
 * @pt-BR API OAuth e status de conexão Tiendanube (#187).
 */
export function registerTiendanubeOAuthRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const tnConfig = new TiendanubeConfigService(prisma)
  const tnOAuth = new TiendanubeOAuthService(prisma)
  const requireTn = requireTiendanubeIntegration(prisma)

  app.get(
    '/api/configuracion/tiendanube',
    requirePermission('settings.business.manage'),
    requireTn,
    async (req: Request, res: Response) => {
      try {
        const data = await tnConfig.getStatus(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/oauth/tiendanube/authorize',
    tiendanubeOAuthHttpRateLimiter,
    requirePermission('settings.business.manage'),
    requireTn,
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const userId = authReq.auth?.claims.userId
        if (userId == null) {
          res.status(401).json({ success: false, error: 'Authentication required' })
          return
        }
        const result = tnOAuth.buildAuthorizeUrl(getTenantId(req), userId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/oauth/tiendanube/callback',
    tiendanubeOAuthHttpRateLimiter,
    async (req: Request, res: Response) => {
      const code = typeof req.query.code === 'string' ? req.query.code.trim() : ''
      const state = typeof req.query.state === 'string' ? req.query.state.trim() : ''
      if (!code || !state) {
        res.status(400).json({ success: false, error: 'Missing OAuth code or state' })
        return
      }

      try {
        const result = await tnOAuth.handleCallback(code, state)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.redirect(302, result.data.redirectUrl)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/oauth/tiendanube/disconnect',
    requirePermission('settings.business.manage'),
    requireTn,
    tiendanubeOAuthHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const result = await tnOAuth.disconnect(tenantId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'tiendanube_oauth_disconnect',
          'tiendanube_config',
          String(tenantId),
          {},
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
