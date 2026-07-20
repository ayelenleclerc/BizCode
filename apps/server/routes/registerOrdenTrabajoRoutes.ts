import type { Application, Request, Response } from 'express'
import type {
  OrdenTrabajoFacturarInput,
  OrdenTrabajoInput,
  OrdenTrabajoTransitionInput,
  OrdenTrabajoUpdateInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  ordenTrabajoBodySchema,
  ordenTrabajoFacturarBodySchema,
  ordenTrabajoTransitionBodySchema,
  ordenTrabajoUpdateBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function otId(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en Service work-order REST endpoints (#246).
 * @es Endpoints REST de órdenes de trabajo (#246).
 * @pt-BR Endpoints REST de ordens de trabalho (#246).
 */
export function registerOrdenTrabajoRoutes(app: Application, ctx: RestRouteContext): void {
  const { ordenTrabajo } = ctx.services
  const ordersModule = requireModule('service.orders')
  const readPermission = requireAnyPermission('sales.create', 'reports.operational.read')
  const writePermission = requirePermission('sales.create')

  app.get(
    '/api/ordenes-trabajo',
    ordersModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const estado = typeof req.query.estado === 'string' ? req.query.estado : null
        const result = await ordenTrabajo.list(getTenantId(req), take, skip, estado)
        res.json({
          ...paginatedListJson(result.ordenes, result.total, take, skip),
          counts: result.counts,
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/ordenes-trabajo/:id',
    ordersModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await ordenTrabajo.getById(getTenantId(req), otId(req))
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
    '/api/ordenes-trabajo',
    ordersModule,
    writePermission,
    validateBody(ordenTrabajoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await ordenTrabajo.create(getTenantId(req), req.body as OrdenTrabajoInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ot_create',
          'orden_trabajo',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/ordenes-trabajo/:id',
    ordersModule,
    writePermission,
    validateBody(ordenTrabajoUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await ordenTrabajo.update(
          getTenantId(req),
          otId(req),
          req.body as OrdenTrabajoUpdateInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'ot_update',
          'orden_trabajo',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-trabajo/:id/transicion',
    ordersModule,
    writePermission,
    validateBody(ordenTrabajoTransitionBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await ordenTrabajo.transition(
          getTenantId(req),
          otId(req),
          req.body as OrdenTrabajoTransitionInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        const { orden, auditAction, previousEstado } = result.data
        await ctx.writeAudit(req as AuthenticatedRequest, auditAction, 'orden_trabajo', String(orden.id), {
          previousEstado,
          estado: orden.estado,
          tecnicoId: orden.tecnicoId,
        })
        res.json({ success: true, data: orden })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-trabajo/:id/facturar',
    ordersModule,
    writePermission,
    validateBody(ordenTrabajoFacturarBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const userId = authReq.auth!.claims.userId
        const result = await ordenTrabajo.facturar(
          getTenantId(req),
          otId(req),
          userId,
          req.body as OrdenTrabajoFacturarInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(authReq, 'ot_facturar', 'orden_trabajo', String(result.data.orden.id), {
          facturaId: result.data.facturaId,
          estado: result.data.orden.estado,
        })
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
