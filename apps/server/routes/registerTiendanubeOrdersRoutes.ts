import type { Application, Request, Response } from 'express'
import type { PedidoInvoiceInput } from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireTiendanubeIntegration } from '../middleware/requireTiendanubeIntegration'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { pedidoInvoiceBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import {
  TiendanubeOrderImportService,
  type TiendanubeOrdenListFilter,
} from '../services/TiendanubeOrderImportService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const FILTERS: TiendanubeOrdenListFilter[] = ['pendiente', 'facturada', 'cancelada', 'all']

function parseFilter(raw: unknown): TiendanubeOrdenListFilter {
  if (typeof raw !== 'string' || raw.trim() === '') return 'all'
  const v = raw.trim() as TiendanubeOrdenListFilter
  return FILTERS.includes(v) ? v : 'all'
}

/**
 * @en Tiendanube imported orders list + invoice (#187).
 * @es Listado de órdenes TN importadas + facturación (#187).
 * @pt-BR Listagem de pedidos TN importados + faturamento (#187).
 */
export function registerTiendanubeOrdersRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const orderImport = new TiendanubeOrderImportService(prisma)
  const requireTn = requireTiendanubeIntegration(prisma)
  const ordersModule = requireModule('billing.orders')

  app.get(
    '/api/tiendanube/ordenes',
    ordersModule,
    requireAnyPermission('orders.create', 'reports.operational.read'),
    requireTn,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const filter = parseFilter(req.query.estado)
        const { total, ordenes } = await orderImport.list(tenantId, filter, take, skip)
        res.json(paginatedListJson(ordenes, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/tiendanube/ordenes/:tnOrderId/facturar',
    ordersModule,
    requirePermission('sales.create'),
    requireTn,
    validateBody(pedidoInvoiceBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const tnOrderId = String(req.params.tnOrderId ?? '').trim()
        if (!tnOrderId) {
          res.status(400).json({ success: false, error: 'Invalid tnOrderId' })
          return
        }
        const parsedValue = req.body as PedidoInvoiceInput
        const result = await orderImport.facturar(
          tenantId,
          tnOrderId,
          parsedValue,
          authReq.auth!.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'tiendanube_orden_facturar', 'tiendanube_orden', tnOrderId, {
          pedidoId: result.data.pedidoId,
          facturaId: result.data.facturaId,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
