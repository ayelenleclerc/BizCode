import type { Application, Request, Response } from 'express'
import type { PedidoInvoiceInput } from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMeliIntegration } from '../middleware/requireMeliIntegration'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { pedidoInvoiceBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import {
  MeliOrderImportService,
  type MeliOrdenListFilter,
} from '../services/MeliOrderImportService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const FILTERS: MeliOrdenListFilter[] = ['pendiente', 'facturada', 'cancelada', 'all']

function parseFilter(raw: unknown): MeliOrdenListFilter {
  if (typeof raw !== 'string' || raw.trim() === '') return 'all'
  const v = raw.trim() as MeliOrdenListFilter
  return FILTERS.includes(v) ? v : 'all'
}

/**
 * @en Mercado Libre imported orders list + invoice (#186).
 * @es Listado de órdenes ML importadas + facturación (#186).
 * @pt-BR Listagem de pedidos ML importados + faturamento (#186).
 */
export function registerMeliOrdersRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const orderImport = new MeliOrderImportService(prisma)
  const requireMeli = requireMeliIntegration(prisma)
  const ordersModule = requireModule('billing.orders')

  app.get(
    '/api/meli/ordenes',
    ordersModule,
    requireAnyPermission('orders.create', 'reports.operational.read'),
    requireMeli,
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
    '/api/meli/ordenes/:meliOrderId/facturar',
    ordersModule,
    requirePermission('sales.create'),
    requireMeli,
    validateBody(pedidoInvoiceBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const meliOrderId = String(req.params.meliOrderId ?? '').trim()
        if (!meliOrderId) {
          res.status(400).json({ success: false, error: 'Invalid meliOrderId' })
          return
        }
        const parsedValue = req.body as PedidoInvoiceInput
        const result = await orderImport.facturar(
          tenantId,
          meliOrderId,
          parsedValue,
          authReq.auth!.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          authReq,
          'meli_orden_facturar',
          'meli_orden',
          meliOrderId,
          {
            pedidoId: result.data.pedidoId,
            facturaId: result.data.facturaId,
          },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
