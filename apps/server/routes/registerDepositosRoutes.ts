import type { Application, Request, Response } from 'express'
import type {
  DepositoCreateInput,
  DepositoPatchInput,
  TransferenciaDepositoCreateInput,
  TransferenciaDepositoRecibirInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { depositosMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  depositoCreateBodySchema,
  depositoPatchBodySchema,
  transferenciaDepositoCreateBodySchema,
  transferenciaDepositoRecibirBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function pathId(req: Request, key = 'id'): number {
  return Number.parseInt(String(req.params[key]), 10)
}

function authUserId(req: Request): number {
  return (req as AuthenticatedRequest).auth!.claims.userId
}

/**
 * @en REST endpoints for deposits, per-deposit stock and transfers (#236).
 * @es Endpoints REST de depósitos, stock por depósito y transferencias (#236).
 * @pt-BR Endpoints REST de depósitos, estoque por depósito e transferências (#236).
 */
export function registerDepositosRoutes(app: Application, ctx: RestRouteContext): void {
  const { deposito, transferenciaDeposito } = ctx.services
  const warehousesModule = requireModule('inventory.warehouses')
  const readPermission = requireAnyPermission('products.read', 'products.manage')
  const writePermission = requirePermission('products.manage')

  app.get(
    '/api/depositos',
    warehousesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const activo =
          typeof req.query.activo === 'string'
            ? req.query.activo === 'true'
              ? true
              : req.query.activo === 'false'
                ? false
                : null
            : null
        const result = await deposito.list(getTenantId(req), take, skip, { activo })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/depositos/:id',
    warehousesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await deposito.getById(getTenantId(req), pathId(req))
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
    '/api/depositos',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    validateBody(depositoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await deposito.create(getTenantId(req), req.body as DepositoCreateInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'deposito.create', 'deposito', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/depositos/:id',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    validateBody(depositoPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await deposito.update(
          getTenantId(req),
          pathId(req),
          req.body as DepositoPatchInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'deposito.update', 'deposito', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/depositos/:id',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const id = pathId(req)
        const result = await deposito.remove(getTenantId(req), id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'deposito.delete', 'deposito', String(id))
        res.status(204).send()
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/stock-depositos',
    warehousesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await deposito.stockPorArticulo(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/transferencias-deposito',
    warehousesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const estado =
          typeof req.query.estado === 'string' && req.query.estado.length > 0
            ? req.query.estado
            : null
        const result = await transferenciaDeposito.list(getTenantId(req), take, skip, { estado })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/transferencias-deposito/:id',
    warehousesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await transferenciaDeposito.getById(getTenantId(req), pathId(req))
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
    '/api/transferencias-deposito',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    validateBody(transferenciaDepositoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await transferenciaDeposito.create(
          getTenantId(req),
          authUserId(req),
          req.body as TransferenciaDepositoCreateInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'transferencia.create',
          'transferencia_deposito',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/transferencias-deposito/:id/en-transito',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await transferenciaDeposito.markEnTransito(
          getTenantId(req),
          pathId(req),
          authUserId(req),
        )
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
    '/api/transferencias-deposito/:id/recibir',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    validateBody(transferenciaDepositoRecibirBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await transferenciaDeposito.receive(
          getTenantId(req),
          pathId(req),
          authUserId(req),
          req.body as TransferenciaDepositoRecibirInput,
        )
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
    '/api/transferencias-deposito/:id/anular',
    depositosMutationHttpRateLimiter,
    warehousesModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await transferenciaDeposito.anular(getTenantId(req), pathId(req))
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
