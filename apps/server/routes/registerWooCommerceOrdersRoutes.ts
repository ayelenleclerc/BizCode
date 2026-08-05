import type { Application, Request, Response } from 'express'
import type { PedidoInvoiceInput } from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireWooCommerceIntegration } from '../middleware/requireWooCommerceIntegration'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { pedidoInvoiceBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import {
  WooCommerceOrderImportService,
  type WooCommerceOrdenListFilter,
} from '../services/WooCommerceOrderImportService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const FILTERS: WooCommerceOrdenListFilter[] = ['pendiente', 'facturada', 'cancelada', 'all']

function parseFilter(raw: unknown): WooCommerceOrdenListFilter {
  if (typeof raw !== 'string' || raw.trim() === '') return 'all'
  const v = raw.trim() as WooCommerceOrdenListFilter
  return FILTERS.includes(v) ? v : 'all'
}

/**
 * @en WooCommerce imported orders list + invoice (#188).
 * @es Listado de órdenes WC importadas + facturación (#188).
 * @pt-BR Listagem de pedidos WC importados + faturamento (#188).
 */
export function registerWooCommerceOrdersRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const orderImport = new WooCommerceOrderImportService(prisma)
  const requireWc = requireWooCommerceIntegration(prisma)
  const ordersModule = requireModule('billing.orders')

  app.get(
    '/api/woocommerce/ordenes',
    ordersModule,
    requireAnyPermission('orders.create', 'reports.operational.read'),
    requireWc,
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
    '/api/woocommerce/ordenes/:wcOrderId/facturar',
    ordersModule,
    requirePermission('sales.create'),
    requireWc,
    validateBody(pedidoInvoiceBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const wcOrderId = String(req.params.wcOrderId ?? '').trim()
        if (!wcOrderId) {
          res.status(400).json({ success: false, error: 'Invalid wcOrderId' })
          return
        }
        const parsedValue = req.body as PedidoInvoiceInput
        const result = await orderImport.facturar(
          tenantId,
          wcOrderId,
          parsedValue,
          authReq.auth!.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'woocommerce_orden_facturar', 'woocommerce_orden', wcOrderId, {
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
