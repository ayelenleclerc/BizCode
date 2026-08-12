import type { Application, Request, Response } from 'express'
import { requireAnyPermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { plantillaPedidoCreateBodySchema, plantillaPedidoPatchBodySchema } from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function sendResult<T>(res: Response, result: { ok: true; data: T } | { ok: false; status: number; error: string }, successStatus = 200): void {
  if (!result.ok) {
    res.status(result.status).json({ success: false, error: result.error })
    return
  }
  res.status(successStatus).json({ success: true, data: result.data })
}

/**
 * @en Last-order repeat + plantilla CRUD routes (#253).
 * @es Rutas de repetir último pedido y CRUD de plantillas (#253).
 * @pt-BR Rotas de repetir último pedido e CRUD de modelos (#253).
 */
export function registerPlantillaPedidoRoutes(app: Application, ctx: RestRouteContext): void {
  const { plantillaPedido } = ctx.services
  const readOrWrite = requireAnyPermission('orders.create', 'customers.manage')

  app.get(
    '/api/clientes/:id/ultimo-pedido-repeat',
    readOrWrite,
    async (req: Request, res: Response) => {
      try {
        const clienteId = parsePositiveIntParam(String(req.params.id))
        if (clienteId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.getUltimoPedidoRepeat(getTenantId(req), clienteId)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/clientes/:id/plantillas-pedido',
    readOrWrite,
    async (req: Request, res: Response) => {
      try {
        const clienteId = parsePositiveIntParam(String(req.params.id))
        if (clienteId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.listByCliente(getTenantId(req), clienteId)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/clientes/:id/plantillas-pedido',
    readOrWrite,
    validateBody(plantillaPedidoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const clienteId = parsePositiveIntParam(String(req.params.id))
        if (clienteId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const auth = req as AuthenticatedRequest
        const userId = auth.auth?.claims.userId
        const body = req.body as {
          nombre: string
          activa?: boolean
          vendedorId?: number | null
          items: Array<{ articuloId: number; cantidad: number; activo?: boolean; orden?: number }>
        }
        const vendedorId =
          body.vendedorId !== undefined
            ? body.vendedorId
            : userId != null && Number.isInteger(userId) && userId >= 1
              ? userId
              : null
        const result = await plantillaPedido.create(getTenantId(req), clienteId, {
          ...body,
          vendedorId,
        })
        sendResult(res, result, 201)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/plantillas-pedido/:id',
    readOrWrite,
    async (req: Request, res: Response) => {
      try {
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.getById(getTenantId(req), id)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/plantillas-pedido/:id/cargar',
    readOrWrite,
    async (req: Request, res: Response) => {
      try {
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.cargar(getTenantId(req), id)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/plantillas-pedido/:id',
    readOrWrite,
    validateBody(plantillaPedidoPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.patch(getTenantId(req), id, req.body)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/plantillas-pedido/:id',
    readOrWrite,
    async (req: Request, res: Response) => {
      try {
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await plantillaPedido.delete(getTenantId(req), id)
        sendResult(res, result)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
