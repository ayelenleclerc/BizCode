import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMercadoPagoIntegration } from '../middleware/requireMercadoPagoIntegration'
import { mercadopagoPreferenceHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  mercadoPagoIgnoreBodySchema,
  mercadoPagoReconcileBodySchema,
} from '../schemas/mercadopago'
import { MercadoPagoReconciliationService } from '../services/MercadoPagoReconciliationService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Mercado Pago payment reconciliation routes (#178).
 * @es Rutas de reconciliación de pagos Mercado Pago (#178).
 * @pt-BR Rotas de reconciliação de pagamentos Mercado Pago (#178).
 */
export function registerMercadoPagoReconciliationRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const reconciliation = new MercadoPagoReconciliationService(prisma)
  const requireMp = requireMercadoPagoIntegration(prisma)
  const financialRead = requirePermission('reports.financial.read')

  app.get(
    '/api/mercadopago/pagos-sin-reconciliar',
    financialRead,
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const data = await reconciliation.listPending(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/mercadopago/reconciliar',
    financialRead,
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    validateBody(mercadoPagoReconcileBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as { mpPaymentId: string; facturaId: number }
        const result = await reconciliation.reconcileManual(tenantId, authReq.auth!.claims.userId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'mercadopago_reconcile', 'mercadopago_payment', body.mpPaymentId, {
          facturaId: body.facturaId,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/mercadopago/ignorar',
    financialRead,
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    validateBody(mercadoPagoIgnoreBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as { mpPaymentId: string }
        const result = await reconciliation.ignore(tenantId, authReq.auth!.claims.userId, body.mpPaymentId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'mercadopago_ignore', 'mercadopago_payment', body.mpPaymentId, {})
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/mercadopago/reconciliacion/run',
    financialRead,
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await reconciliation.runDailyJob(tenantId, new Date(), { force: true })
        await writeAudit(
          req as AuthenticatedRequest,
          'mercadopago_reconciliation_job',
          'mercadopago_reconciliation',
          String(tenantId),
          data,
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
