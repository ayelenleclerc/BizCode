import type { Application, Request, Response } from 'express'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { mapRemitoPublic } from '../services/RemitoService'
import { validateBody } from '../middleware/validateBody'
import { pedidoBodySchema, pedidoInvoiceBodySchema } from '../schemas/domain'
import type { PedidoEstado, PedidoInput, PedidoInvoiceInput } from '../createApp.types'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const PEDIDO_ESTADOS: PedidoEstado[] = ['draft', 'confirmed', 'invoiced', 'cancelled']

function parseEstadoQuery(raw: unknown): PedidoEstado | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return undefined
  }
  const v = raw.trim() as PedidoEstado
  return PEDIDO_ESTADOS.includes(v) ? v : undefined
}

/**
 * @en Commercial orders / quotes REST API (ADR-0009).
 * @es API REST de pedidos/presupuestos comerciales (ADR-0009).
 * @pt-BR API REST de pedidos/orçamentos comerciais (ADR-0009).
 */
export function registerPedidosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { pedido, remito } = services
  const ordersModule = requireModule('billing.orders')
  const remitoModule = requireModule('fiscal.remito')

  app.get(
    '/api/pedidos',
    ordersModule,
    requireAnyPermission('orders.create', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const estado = parseEstadoQuery(req.query.estado)
        const clienteIdRaw = req.query.clienteId
        const clienteId =
          typeof clienteIdRaw === 'string' && clienteIdRaw.trim() !== ''
            ? parseInt(clienteIdRaw, 10)
            : undefined
        const { total, pedidos } = await pedido.list(
          tenantId,
          {
            estado,
            clienteId: clienteId !== undefined && !Number.isNaN(clienteId) ? clienteId : undefined,
          },
          take,
          skip,
        )
        res.json(paginatedListJson(pedidos, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/pedidos/:id',
    ordersModule,
    requireAnyPermission('orders.create', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.getById(tenantId, id)
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
    '/api/pedidos',
    ordersModule,
    requirePermission('orders.create'),
    validateBody(pedidoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsedValue = req.body as PedidoInput
        const result = await pedido.create(tenantId, parsedValue)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_create', 'pedido', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/pedidos/:id',
    ordersModule,
    requirePermission('orders.create'),
    validateBody(pedidoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const parsedValue = req.body as PedidoInput
        const result = await pedido.update(tenantId, id, parsedValue)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_update', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/confirm',
    ordersModule,
    requirePermission('orders.create'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.confirm(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_confirm', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/invoice',
    ordersModule,
    requirePermission('sales.create'),
    validateBody(pedidoInvoiceBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const parsedValue = req.body as PedidoInvoiceInput
        const result = await pedido.invoice(tenantId, id, parsedValue)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_invoice', 'pedido', String(id), {
          facturaId: result.data.factura?.id ?? null,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/remito',
    ordersModule,
    remitoModule,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await remito.createFromPedido(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'remito_from_pedido', 'remito', String(result.data.id), {
          pedidoId: id,
        })
        res.status(201).json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/pedidos/:id',
    ordersModule,
    requirePermission('sales.cancel'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.cancel(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_cancel', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
