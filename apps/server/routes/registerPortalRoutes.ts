import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { portalMagicLinkHttpRateLimiter, portalVerifyHttpRateLimiter } from '../middleware/routeRateLimit'
import { resolvePortalTenant } from '../middleware/resolvePortalTenant'
import { requirePortalAuth, resolvePortalSession } from '../middleware/resolvePortalSession'
import { requirePortalModule } from '../middleware/requirePortalModule'
import { validateBody } from '../middleware/validateBody'
import {
  portalConfigUpdateBodySchema,
  portalFacturaEstadoSchema,
  portalMagicLinkBodySchema,
} from '../schemas/portal'
import type { PortalRequest } from '../portal/portalTypes'
import { clearPortalSessionCookie, setPortalSessionCookie } from '../portal/portalTokens'
import { PortalAuthService } from '../services/PortalAuthService'
import { PortalConfigService } from '../services/PortalConfigService'
import { PortalCuentaCorrienteService } from '../services/PortalCuentaCorrienteService'
import { PortalFacturaService } from '../services/PortalFacturaService'
import { PortalPedidoService } from '../services/PortalPedidoService'
import { FidelizacionService } from '../services/FidelizacionService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseIsoDateQuery(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const d = new Date(value.trim())
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

function parsePaginationQuery(req: Request): { limit: number; offset: number } {
  const limitRaw = req.query.limit
  const offsetRaw = req.query.offset
  const limitParsed =
    typeof limitRaw === 'string' && limitRaw.trim() !== ''
      ? Number.parseInt(limitRaw, 10)
      : 50
  const offsetParsed =
    typeof offsetRaw === 'string' && offsetRaw.trim() !== ''
      ? Number.parseInt(offsetRaw, 10)
      : 0
  return {
    limit: Number.isInteger(limitParsed) && limitParsed > 0 ? Math.min(limitParsed, 200) : 50,
    offset: Number.isInteger(offsetParsed) && offsetParsed >= 0 ? offsetParsed : 0,
  }
}

/**
 * @en B2B customer portal routes and tenant admin portal config (#240).
 * @es Rutas del portal B2B del cliente y configuración admin (#240).
 * @pt-BR Rotas do portal B2B do cliente e configuração admin (#240).
 */
export function registerPortalRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const portalConfig = new PortalConfigService(prisma)
  const portalAuth = new PortalAuthService(prisma, portalConfig)
  const portalFactura = new PortalFacturaService(prisma)
  const portalCc = new PortalCuentaCorrienteService(prisma)
  const portalPedido = new PortalPedidoService(prisma)
  const fidelizacion = new FidelizacionService(prisma)

  const portalModule = requireModule('clients.portal')

  app.get(
    '/api/portal-config',
    portalModule,
    requirePermission('settings.business.manage'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await portalConfig.getOrCreate(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/portal-config',
    portalModule,
    requirePermission('settings.business.manage'),
    validateBody(portalConfigUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await portalConfig.update(tenantId, req.body)
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'portal_config_update', 'portal_config', String(tenantId), {
          enabled: data.enabled,
          showPedidos: data.showPedidos,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  const portalTenantMw = resolvePortalTenant(prisma)
  const portalSessionMw = resolvePortalSession(prisma)

  app.get('/api/portal/:tenantSlug/branding', portalTenantMw, (req: Request, res: Response) => {
    const portalReq = req as PortalRequest
    res.json({ success: true, data: portalReq.portalTenant!.branding })
  })

  app.post(
    '/api/portal/:tenantSlug/auth/magic-link',
    portalTenantMw,
    portalMagicLinkHttpRateLimiter,
    validateBody(portalMagicLinkBodySchema),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      try {
        const result = await portalAuth.requestMagicLink(
          portalReq.portalTenant!.tenantSlug,
          (req.body as { email: string }).email,
        )
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
    '/api/portal/:tenantSlug/auth/verify',
    portalTenantMw,
    portalVerifyHttpRateLimiter,
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const tokenParam = req.query.token
      const token = typeof tokenParam === 'string' ? tokenParam : ''
      if (!token.trim()) {
        res.status(400).json({ success: false, error: 'token is required' })
        return
      }
      try {
        const result = await portalAuth.verifyMagicLink(portalReq.portalTenant!.tenantSlug, token)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        setPortalSessionCookie(res, result.data.sessionToken)
        res.json({ success: true, data: { me: result.data.me } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/portal/:tenantSlug/auth/logout',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      if (portalReq.portalAuth?.sessionId) {
        await portalAuth.logout(portalReq.portalAuth.sessionId)
      }
      clearPortalSessionCookie(res)
      res.json({ success: true, data: { loggedOut: true } })
    },
  )

  app.get(
    '/api/portal/:tenantSlug/me',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      try {
        const me = await portalAuth.getMe(auth.tenantId, auth.portalClienteId)
        if (!me) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({
          success: true,
          data: {
            me,
            branding: portalReq.portalTenant!.branding,
          },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/facturas',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    requirePortalModule('core.invoicing'),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      const estadoParam = req.query.estado
      let estado: 'pagada' | 'pendiente' | 'vencida' | undefined
      if (typeof estadoParam === 'string' && estadoParam.trim() !== '') {
        const parsed = portalFacturaEstadoSchema.safeParse(estadoParam)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid estado filter' })
          return
        }
        estado = parsed.data
      }
      const { limit, offset } = parsePaginationQuery(req)
      try {
        const data = await portalFactura.list(
          auth.tenantId,
          auth.portalClienteId,
          {
            estado,
            from: parseIsoDateQuery(req.query.from),
            to: parseIsoDateQuery(req.query.to),
          },
          limit,
          offset,
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/facturas/:id/pdf',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    requirePortalModule('core.invoicing'),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      const facturaId = parsePositiveIntParam(String(req.params.id))
      if (facturaId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const result = await portalFactura.getPdfBuffer(auth.tenantId, auth.portalClienteId, facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="factura-${facturaId}.pdf"`)
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/cuenta-corriente',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    requirePortalModule('finance.ledger'),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      const { limit, offset } = parsePaginationQuery(req)
      try {
        const data = await portalCc.getCuentaCorriente(auth.tenantId, auth.portalClienteId, {
          from: parseIsoDateQuery(req.query.from),
          to: parseIsoDateQuery(req.query.to),
          limit,
          offset,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/cuenta-corriente/estado-de-cuenta/pdf',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    requirePortalModule('finance.ledger'),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      try {
        const result = await portalCc.getEstadoCuentaPdf(
          auth.tenantId,
          auth.portalClienteId,
          parseIsoDateQuery(req.query.desde),
          parseIsoDateQuery(req.query.hasta),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `inline; filename="estado-cuenta-${auth.portalClienteId}.pdf"`,
        )
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/pedidos',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      if (!portalReq.portalTenant!.branding.showPedidos) {
        res.status(403).json({ success: false, error: 'Pedidos section disabled' })
        return
      }
      const { limit, offset } = parsePaginationQuery(req)
      try {
        const data = await portalPedido.list(
          auth.tenantId,
          auth.portalClienteId,
          portalReq.portalTenant!.modules,
          limit,
          offset,
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/portal/:tenantSlug/fidelizacion',
    portalTenantMw,
    portalSessionMw,
    requirePortalAuth,
    requirePortalModule('clients.loyalty'),
    async (req: Request, res: Response) => {
      const portalReq = req as PortalRequest
      const auth = portalReq.portalAuth!
      try {
        const data = await fidelizacion.getPortalSummary(auth.tenantId, auth.portalClienteId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
