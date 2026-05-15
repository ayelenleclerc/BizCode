import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { facturaBodySchema, facturaVoidBodySchema } from '../schemas/domain'
import type { FacturaInput } from '../createApp.types'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { dispatchNotification } from '../channels'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Invoice create/list and void routes.
 */
export function registerFacturasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { factura } = services

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
        const parsedValue = req.body as FacturaInput
        const result = await factura.create(tenantId, parsedValue)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }

        const { factura: createdFactura, updatedCliente, stockBelowMinimum } = result.data
        const authReq = req as AuthenticatedRequest
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
        res.json({ success: true, data: createdFactura })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/facturas/:id/void',
    requirePermission('sales.cancel'),
    validateBody(facturaVoidBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const { motivo } = req.body as { motivo: string }
        const result = await factura.void(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'factura_void', 'factura', String(id), { motivo })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
