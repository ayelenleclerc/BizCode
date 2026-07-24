import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { ordenesProduccionMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import {
  ordenProduccionCompletarBodySchema,
  ordenProduccionCreateBodySchema,
  ordenProduccionSugerirCompraBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import { paginatedListJson } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'

function parsePathId(req: Request): number | null {
  const id = Number.parseInt(String(req.params.id), 10)
  return Number.isInteger(id) && id >= 1 ? id : null
}

/**
 * @en REST endpoints for production orders: planning, reservations, completion (#249).
 * @es Endpoints REST de órdenes de producción: planificación, reservas, cierre (#249).
 * @pt-BR Endpoints REST de ordens de produção: planejamento, reservas, conclusão (#249).
 */
export function registerOrdenesProduccionRoutes(app: Application, ctx: RestRouteContext): void {
  const { ordenProduccion } = ctx.services
  const moduleGuard = requireModule('production.orders')
  const readPermission = requirePermission('products.read')
  const managePermission = requirePermission('products.manage')
  const stockPermission = requirePermission('inventory.adjust')

  app.get(
    '/api/ordenes-produccion',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await ordenProduccion.list(getTenantId(req), req)
        res.json(paginatedListJson(result.items, result.total, result.limit, result.offset))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/ordenes-produccion/:id',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await ordenProduccion.getById(getTenantId(req), id)
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
    '/api/ordenes-produccion/:id/disponibilidad',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await ordenProduccion.getDisponibilidad(getTenantId(req), id)
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
    '/api/ordenes-produccion',
    ordenesProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(ordenProduccionCreateBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await ordenProduccion.create(getTenantId(req), parsed.value)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ordenes_produccion.create',
          'orden_produccion',
          String(result.data.id),
          { numero: result.data.numero, cantidadPlanif: result.data.cantidadPlanif },
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-produccion/:id/iniciar',
    ordenesProduccionMutationHttpRateLimiter,
    moduleGuard,
    stockPermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await ordenProduccion.iniciar(getTenantId(req), id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ordenes_produccion.start',
          'orden_produccion',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-produccion/:id/completar',
    ordenesProduccionMutationHttpRateLimiter,
    moduleGuard,
    stockPermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const parsed = safeParseBodySchema(ordenProduccionCompletarBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await ordenProduccion.completar(
          getTenantId(req),
          id,
          authReq.auth!.claims.userId,
          parsed.value,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          authReq,
          'ordenes_produccion.complete',
          'orden_produccion',
          String(result.data.id),
          { cantidadReal: result.data.cantidadReal, costoTotal: result.data.costoTotal },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-produccion/:id/cancelar',
    ordenesProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await ordenProduccion.cancelar(getTenantId(req), id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ordenes_produccion.cancel',
          'orden_produccion',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-produccion/:id/sugerir-compra',
    ordenesProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const id = parsePathId(req)
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const parsed = safeParseBodySchema(ordenProduccionSugerirCompraBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await ordenProduccion.sugerirCompra(getTenantId(req), id, parsed.value)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ordenes_produccion.suggest_purchase',
          'orden_produccion',
          String(id),
          { ordenCompraId: result.data.ordenCompraId },
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
