import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMercadoPagoIntegration } from '../middleware/requireMercadoPagoIntegration'
import { mercadopagoPreferenceHttpRateLimiter } from '../middleware/routeRateLimit'
import { MercadoPagoPreferenceService } from '../services/MercadoPagoPreferenceService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parseFacturaIdParam(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id >= 1 ? id : null
}

/**
 * @en Mercado Pago payment link routes per invoice (#175).
 * @es Rutas de link de pago Mercado Pago por factura (#175).
 * @pt-BR Rotas de link de pagamento Mercado Pago por fatura (#175).
 */
export function registerMercadoPagoFacturaRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const mpPreference = new MercadoPagoPreferenceService(prisma)
  const requireMp = requireMercadoPagoIntegration(prisma)

  app.get(
    '/api/facturas/:id/mp',
    requirePermission('reports.financial.read'),
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parseFacturaIdParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await mpPreference.getStatus(getTenantId(req), facturaId)
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

  app.post(
    '/api/facturas/:id/mp/preference',
    requirePermission('reports.financial.read'),
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parseFacturaIdParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const tenantId = getTenantId(req)
        const result = await mpPreference.createPreference(tenantId, facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'mercadopago_preference_create',
          'factura',
          String(facturaId),
          { preferenceId: result.data.preferenceId },
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
