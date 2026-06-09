import type { Application, NextFunction, Request, Response } from 'express'
import { hasPermission, type Permission } from '../../src/lib/rbac'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import type { OrdenEntregaCreateInput, OrdenEntregaEstado, OrdenEntregaUpdateBody } from '../createApp.types'
import {
  ORDEN_ENTREGA_ESTADOS,
  type OrdenEntregaService,
} from '../services/OrdenEntregaService'
import { ordenEntregaCreateBodySchema, ordenEntregaUpdateBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, facturaFechaToPrismaDate, getTenantId } from './restDomainShared'

function parseOptionalEstado(value: unknown): OrdenEntregaEstado | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  const trimmed = value.trim() as OrdenEntregaEstado
  return ORDEN_ENTREGA_ESTADOS.includes(trimmed) ? trimmed : undefined
}

function parseOptionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return undefined
  return n
}

/**
 * @en Delivery order REST routes (`/api/ordenes-entrega`).
 * @es Rutas REST de órdenes de entrega (`/api/ordenes-entrega`).
 * @pt-BR Rotas REST de ordens de entrega (`/api/ordenes-entrega`).
 */
export function registerOrdenesEntregaRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const ordenEntrega: OrdenEntregaService = services.ordenEntrega
  const pickingModule = requireModule('logistics.picking')

  app.get(
    '/api/ordenes-entrega',
    (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest
      const role = authReq.auth!.claims.role
      if (
        hasPermission(role, 'logistics.read' as Permission) ||
        hasPermission(role, 'orders.deliver.confirm' as Permission) ||
        hasPermission(role, 'orders.pick' as Permission)
      ) {
        next()
        return
      }
      res.status(403).json({ success: false, error: 'Forbidden' })
    },
    async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = getTenantId(req)
      const estadoRaw = req.query.estado
      const estado = parseOptionalEstado(estadoRaw)
      if (typeof estadoRaw === 'string' && estadoRaw.trim().length > 0 && estado === undefined) {
        res.status(400).json({ success: false, error: 'estado must be a valid delivery order status' })
        return
      }

      const zonaId = parseOptionalPositiveInt(req.query.zonaId)
      const zonaIdRaw = req.query.zonaId
      if (typeof zonaIdRaw === 'string' && zonaIdRaw.trim().length > 0 && zonaId === undefined) {
        res.status(400).json({ success: false, error: 'zonaId must be a positive integer' })
        return
      }

      let driverId = parseOptionalPositiveInt(req.query.driverId)
      const driverIdRaw = req.query.driverId
      if (typeof driverIdRaw === 'string' && driverIdRaw.trim().length > 0 && driverId === undefined) {
        res.status(400).json({ success: false, error: 'driverId must be a positive integer' })
        return
      }

      if (authReq.auth!.claims.role === 'driver') {
        driverId = authReq.auth!.claims.userId
      }

      let fecha: Date | undefined
      const fechaRaw = req.query.fecha
      if (typeof fechaRaw === 'string' && fechaRaw.trim().length > 0) {
        fecha = facturaFechaToPrismaDate(fechaRaw.trim())
      }

      const { take, skip } = parseListPagination(req)
      const { total, ordenes } = await ordenEntrega.list(
        tenantId,
        { estado, zonaId, driverId, fecha },
        take,
        skip,
      )
      res.json(paginatedListJson(ordenes, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  },
  )

  app.post(
    '/api/ordenes-entrega',
    requirePermission('orders.create'),
    validateBody(ordenEntregaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsed = req.body as OrdenEntregaCreateInput
        const result = await ordenEntrega.create(tenantId, parsed)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'orden_entrega_create', 'orden_entrega', String(result.data.id), {
          estado: result.data.estado,
        })
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/ordenes-entrega/:id',
    (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest
      const claims = authReq.auth!.claims
      const canDispatch = hasPermission(claims.role, 'orders.dispatch' as Permission)
      const canDeliverConfirm = hasPermission(claims.role, 'orders.deliver.confirm' as Permission)
      if (!canDispatch && !canDeliverConfirm) {
        res.status(403).json({ success: false, error: 'Forbidden' })
        return
      }
      ;(req as AuthenticatedRequest & { ordenEntregaPerms?: { canDispatch: boolean; canDeliverConfirm: boolean } }).ordenEntregaPerms = {
        canDispatch,
        canDeliverConfirm,
      }
      next()
    },
    validateBody(ordenEntregaUpdateBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest & {
        ordenEntregaPerms?: { canDispatch: boolean; canDeliverConfirm: boolean }
      }
      const claims = authReq.auth!.claims
      const { canDispatch = false, canDeliverConfirm = false } = authReq.ordenEntregaPerms ?? {}

      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid orden entrega id' })
          return
        }

        const parsed = req.body as OrdenEntregaUpdateBody
        const result = await ordenEntrega.update(tenantId, id, parsed, {
          userId: claims.userId,
          role: claims.role,
          canDispatch,
          canDeliverConfirm,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }

        const { orden, auditAction, previousEstado } = result.data
        await writeAudit(authReq, auditAction, 'orden_entrega', String(orden.id), {
          previousEstado,
          estado: orden.estado,
          driverId: orden.driverId,
        })
        res.json({ success: true, data: orden })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-entrega/:id/iniciar-picking',
    pickingModule,
    requirePermission('orders.pick'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid orden entrega id' })
          return
        }
        const result = await ordenEntrega.iniciarPicking(tenantId, id, authReq.auth!.claims.userId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'orden_entrega_picking_start', 'orden_entrega', String(result.data.id), {
          pickerUserId: result.data.pickerUserId,
          estado: result.data.estado,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/ordenes-entrega/:id/lista',
    pickingModule,
    requirePermission('orders.pick'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid orden entrega id' })
          return
        }
        const role = authReq.auth!.claims.role
        const allowLeadOverride = role === 'warehouse_lead'
        const result = await ordenEntrega.marcarLista(
          tenantId,
          id,
          authReq.auth!.claims.userId,
          allowLeadOverride,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'orden_entrega_picking_ready', 'orden_entrega', String(result.data.id), {
          pickerUserId: result.data.pickerUserId,
          estado: result.data.estado,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
