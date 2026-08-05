import type { Application, Request, Response } from 'express'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { mapRemitoPublic } from '../services/RemitoService'
import { validateBody } from '../middleware/validateBody'
import { pedidoBodySchema, pedidoInvoiceBodySchema } from '../schemas/domain'
import type { PedidoEstado, PedidoInput, PedidoInvoiceInput } from '@bizcode/types'
import { isPedidoEstado } from '../lib/pedidoStateMachine'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'
import { z } from 'zod'

function parseEstadoQuery(raw: unknown): PedidoEstado | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return undefined
  }
  const v = raw.trim()
  return isPedidoEstado(v) ? v : undefined
}

const pedidoTransitionBodySchema = z
  .object({
    to: z.enum([
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'invoiced',
      'collected',
      'cancelled',
    ]),
    fecha: z.string().optional(),
    tipo: z.enum(['A', 'B']).optional(),
    numero: z.number().optional(),
    prefijo: z.string().optional(),
    formaPagoId: z.union([z.number(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.to === 'invoiced') {
      if (!data.fecha || data.fecha.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
      }
      if (data.tipo == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tipo is required', path: ['tipo'] })
      }
      if (data.numero == null || !Number.isInteger(data.numero) || data.numero < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'numero must be >= 1', path: ['numero'] })
      }
    }
  })

/**
 * @en Commercial orders REST API with BP1-1 logistics transitions (#391).
 * @es API REST de pedidos con transiciones logísticas BP1-1 (#391).
 * @pt-BR API REST de pedidos com transições logísticas BP1-1 (#391).
 */
export function registerPedidosRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { pedido, remito } = services
  const ordersModule = requireModule('billing.orders')
  const remitoModule = requireModule('fiscal.remito')
  const ownership = verifyOwnership(prisma, 'pedido')

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
    ownership,
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
    ownership,
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
    ownership,
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
    '/api/pedidos/:id/pack',
    ordersModule,
    requirePermission('orders.pick'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.pack(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_packed', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/ship',
    ordersModule,
    requirePermission('orders.dispatch'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.ship(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_shipped', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/deliver',
    ordersModule,
    requirePermission('orders.deliver.confirm'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.deliver(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_delivered', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/collect',
    ordersModule,
    requireAnyPermission('sales.create', 'reports.financial.read'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await pedido.collect(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'pedido_collected', 'pedido', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/pedidos/:id/transitions',
    ordersModule,
    requireAnyPermission(
      'orders.create',
      'orders.pick',
      'orders.dispatch',
      'orders.deliver.confirm',
      'sales.create',
      'sales.cancel',
      'reports.financial.read',
    ),
    validateBody(pedidoTransitionBodySchema),
    ownership,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const body = req.body as z.infer<typeof pedidoTransitionBodySchema>
        const invoiceInput: PedidoInvoiceInput | undefined =
          body.to === 'invoiced'
            ? {
                fecha: body.fecha!.trim(),
                tipo: body.tipo!,
                numero: body.numero!,
                prefijo: body.prefijo,
                formaPagoId: body.formaPagoId,
              }
            : undefined
        const result = await pedido.transitionTo(
          tenantId,
          id,
          body.to,
          invoiceInput,
          authReq.auth?.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, `pedido_transition_${body.to}`, 'pedido', String(id))
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
    ownership,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const parsedValue = req.body as PedidoInvoiceInput
        const result = await pedido.invoice(
          tenantId,
          id,
          parsedValue,
          authReq.auth!.claims.userId,
        )
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
    ownership,
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
    ownership,
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
