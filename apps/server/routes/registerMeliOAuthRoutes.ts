import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMeliIntegration } from '../middleware/requireMeliIntegration'
import { MeliConfigService } from '../services/MeliConfigService'
import { MeliOAuthService } from '../services/MeliOAuthService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Mercado Libre OAuth and connection status API (#183).
 * @es API OAuth y estado de conexión Mercado Libre (#183).
 * @pt-BR API OAuth e status de conexão Mercado Livre (#183).
 */
export function registerMeliOAuthRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const meliConfig = new MeliConfigService(prisma)
  const meliOAuth = new MeliOAuthService(prisma)
  const requireMeli = requireMeliIntegration(prisma)

  app.get(
    '/api/configuracion/meli',
    requirePermission('settings.business.manage'),
    requireMeli,
    async (req: Request, res: Response) => {
      try {
        const data = await meliConfig.getStatus(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/oauth/meli/authorize',
    requirePermission('settings.business.manage'),
    requireMeli,
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const userId = authReq.auth?.claims.userId
        if (userId == null) {
          res.status(401).json({ success: false, error: 'Authentication required' })
          return
        }
        const result = meliOAuth.buildAuthorizeUrl(getTenantId(req), userId)
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

  app.get('/api/oauth/meli/callback', async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code.trim() : ''
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : ''
    if (!code || !state) {
      res.status(400).json({ success: false, error: 'Missing OAuth code or state' })
      return
    }

    try {
      const result = await meliOAuth.handleCallback(code, state)
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      res.redirect(302, result.data.redirectUrl)
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/oauth/meli/disconnect',
    requirePermission('settings.business.manage'),
    requireMeli,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const result = await meliOAuth.disconnect(tenantId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'meli_oauth_disconnect', 'meli_config', String(tenantId), {})
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
