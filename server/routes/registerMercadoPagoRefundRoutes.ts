import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMercadoPagoIntegration } from '../middleware/requireMercadoPagoIntegration'
import { requireModule } from '../middleware/requireModule'
import { mercadopagoPreferenceHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  mercadoPagoChargebackPatchBodySchema,
  mercadoPagoRefundBodySchema,
} from '../schemas/mercadopago'
import { MercadoPagoChargebackService } from '../services/MercadoPagoChargebackService'
import { MercadoPagoRefundService } from '../services/MercadoPagoRefundService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id >= 1 ? id : null
}

/**
 * @en Mercado Pago refund and chargeback routes (#179).
 * @es Rutas de reembolso y contracargos Mercado Pago (#179).
 * @pt-BR Rotas de reembolso e chargebacks Mercado Pago (#179).
 */
export function registerMercadoPagoRefundRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const refundService = new MercadoPagoRefundService(prisma)
  const chargebackService = new MercadoPagoChargebackService(prisma)
  const requireMp = requireMercadoPagoIntegration(prisma)
  const creditNotesModule = requireModule('billing.credit_notes')
  const financialRead = requirePermission('reports.financial.read')
  const salesCancel = requirePermission('sales.cancel')

  app.get(
    '/api/facturas/:id/mp/reembolso',
    salesCancel,
    requireMp,
    creditNotesModule,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parsePositiveIntParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const data = await refundService.getByFactura(getTenantId(req), facturaId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/facturas/:id/mp/reembolso',
    salesCancel,
    requireMp,
    creditNotesModule,
    mercadopagoPreferenceHttpRateLimiter,
    validateBody(mercadoPagoRefundBodySchema),
    async (req: Request, res: Response) => {
      try {
        const facturaId = parsePositiveIntParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as { motivo: string; monto?: number }
        const result = await refundService.refundTotal(
          tenantId,
          facturaId,
          authReq.auth!.claims.userId,
          { motivo: body.motivo, monto: body.monto, ipAddress: req.ip ?? null },
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'mercadopago_refund', 'mercadopago_refund', String(result.data.id), {
          facturaId,
          mpPaymentId: result.data.mpPaymentId,
          monto: result.data.monto,
        })
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/mercadopago/contracargos',
    financialRead,
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const data = await chargebackService.listPending(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/mercadopago/contracargos/:id',
    financialRead,
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    validateBody(mercadoPagoChargebackPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const chargebackId = parsePositiveIntParam(String(req.params.id))
        if (chargebackId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as { estado: 'resuelto' | 'ignorado' }
        const result = await chargebackService.updateEstado(
          tenantId,
          chargebackId,
          authReq.auth!.claims.userId,
          body.estado,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          authReq,
          'mercadopago_chargeback_update',
          'mercadopago_chargeback',
          String(chargebackId),
          { estado: body.estado },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
