import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { facturaBodySchema, facturaPrintBodySchema, facturaVoidBodySchema } from '../schemas/domain'
import type { FacturaInput, FacturaPrintInput } from '@bizcode/types'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { dispatchNotification } from '../channels'
import { notifySellersForCliente } from '../services/sellerPushTargets'
import type { RestRouteContext } from './restRouteTypes'
import { planErrorBody, TenantPlanService } from '../services/TenantPlanService'
import {
  buildFacturaPdfBuffer,
  buildFacturaTicketPdfBuffer,
  facturaPdfFilename,
  facturaTicketPdfFilename,
} from '../fiscal/ar/facturaPdf'
import { requireModule } from '../middleware/requireModule'
import { errorMessage, getTenantId } from './restDomainShared'
import { FacturaPrintService } from '../services/FacturaPrintService'
import { mapRemitoPublic } from '../services/RemitoService'
import { SaasTrialService } from '../saas/SaasTrialService'

/**
 * @en Invoice create/list and void routes.
 */
export function registerFacturasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { factura, remito } = services
  const creditNotesModule = requireModule('billing.credit_notes')
  const remitoModule = requireModule('fiscal.remito')
  const ownership = verifyOwnership(prisma, 'factura')
  const saasTrial = new SaasTrialService(prisma)

  app.get('/api/facturas', requirePermission('reports.operational.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const { take, skip } = parseListPagination(req)
      const { total, facturas } = await factura.list(tenantId, take, skip)
      res.json(paginatedListJson(facturas, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/facturas',
    requirePermission('sales.create'),
    validateBody(facturaBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const trialGate = await saasTrial.assertCanCreateInvoice(tenantId)
        if (!trialGate.ok) {
          res.status(trialGate.status).json({
            success: false,
            error: trialGate.error,
            code: trialGate.code,
          })
          return
        }
        const planService = new TenantPlanService(prisma)
        try {
          const snapshot =
            authReq.tenantPlan ?? (await planService.getSnapshotForTenant(tenantId))
          planService.assertCanCreateInvoice(snapshot)
        } catch (planErr: unknown) {
          if (planErr instanceof Error && planErr.message === 'plan_limit_invoices') {
            res.status(402).json(planErrorBody(planErr))
            return
          }
          throw planErr
        }

        const parsedValue = req.body as FacturaInput
        const result = await factura.create(tenantId, parsedValue, authReq.auth!.claims.userId)
        if (!result.ok) {
          res.status(result.status).json({
            success: false,
            error: result.error,
            ...(result.warnings != null && result.warnings.length > 0
              ? { warnings: result.warnings }
              : {}),
          })
          return
        }

        const { factura: createdFactura, updatedCliente, stockBelowMinimum, warnings } = result.data
        if (
          updatedCliente.creditLimit !== null &&
          Number(updatedCliente.balance) > Number(updatedCliente.creditLimit)
        ) {
          dispatchNotification(prisma, authReq.auth!.claims.tenantId, 'credit_limit_exceeded', {
            clienteId: updatedCliente.id,
            rsocial: updatedCliente.rsocial,
            amount: String(updatedCliente.balance),
            limit: String(updatedCliente.creditLimit),
          }).catch(() => { /* notification failure must not block the sale */ })
          notifySellersForCliente(
            prisma,
            authReq.auth!.claims.tenantId,
            updatedCliente.id,
            'cliente_credit_alert',
            {
              clienteId: updatedCliente.id,
              rsocial: updatedCliente.rsocial,
              amount: String(updatedCliente.balance),
              limit: String(updatedCliente.creditLimit),
            },
          ).catch(() => { /* seller push must not block the sale */ })
        }
        for (const alert of stockBelowMinimum) {
          dispatchNotification(prisma, authReq.auth!.claims.tenantId, 'stock_below_minimum', {
            articuloId: alert.articuloId,
            codigo: alert.codigo,
            descripcion: alert.descripcion,
            stock: alert.stock,
            minimo: alert.minimo,
          }).catch(() => { /* notification failure must not block the sale */ })
        }

        await writeAudit(req as AuthenticatedRequest, 'factura_create', 'factura', String(createdFactura.id))
        if (warnings.length > 0) {
          await writeAudit(
            req as AuthenticatedRequest,
            'factura_anomaly_detected',
            'factura',
            String(createdFactura.id),
            {
              tipos: warnings.map((w) => w.tipo),
              confirmAnomalies: parsedValue.confirmAnomalies === true,
            },
          )
        }
        res.json({
          success: true,
          data: createdFactura,
          ...(warnings.length > 0 ? { warnings } : {}),
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/facturas/:id/pdf/preview',
    requirePermission('reports.operational.read'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await buildFacturaPdfBuffer(prisma, tenantId, id, { preview: true })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${facturaPdfFilename(id, true)}"`)
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/facturas/:id/print',
    requirePermission('reports.operational.read'),
    validateBody(facturaPrintBodySchema),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const body = req.body as FacturaPrintInput
        const service = new FacturaPrintService(prisma)
        const result = await service.print({
          tenantId,
          facturaId: id,
          device: body.device,
        })
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
    '/api/facturas/:id/ticket',
    requirePermission('reports.operational.read'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await buildFacturaTicketPdfBuffer(prisma, tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${facturaTicketPdfFilename(id)}"`)
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/facturas/:id/pdf',
    requirePermission('reports.operational.read'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await buildFacturaPdfBuffer(prisma, tenantId, id, { preview: false })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${facturaPdfFilename(id, false)}"`)
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/facturas/:id/remito',
    remitoModule,
    requirePermission('sales.create'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await remito.createFromFactura(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/facturas/:id/void',
    creditNotesModule,
    requirePermission('sales.cancel'),
    validateBody(facturaVoidBodySchema),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const { motivo } = req.body as { motivo: string }
        const result = await factura.void(tenantId, id, motivo, {
          userId: authReq.auth?.claims.userId ?? null,
          ipAddress: authReq.ip ?? null,
        })
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
}
