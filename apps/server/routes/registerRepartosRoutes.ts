import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import type { AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { hasPermission, type Permission } from '@bizcode/types'
import { requireModule } from '../middleware/requireModule'
import { repartoCreateBodySchema, repartoItemPodBodySchema, repartoUbicacionBodySchema } from '../schemas/domain'
import { GPS_VIEW_ROLES, POD_VIEW_ROLES } from '../services/RepartoService'
import type { RepartoUbicacionService } from '../services/RepartoUbicacionService'
import type { RepartoService, RepartoEstado } from '../services/RepartoService'
import { REPARTO_ESTADOS } from '../services/RepartoService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, facturaFechaToPrismaDate, getTenantId } from './restDomainShared'

function parseOptionalRepartoEstado(value: unknown): RepartoEstado | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  const trimmed = value.trim() as RepartoEstado
  return REPARTO_ESTADOS.includes(trimmed) ? trimmed : undefined
}

function parseOptionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return undefined
  return n
}

/**
 * @en Delivery route REST routes (`/api/repartos`) — issue #140.
 * @es Rutas REST de repartos (`/api/repartos`) — issue #140.
 * @pt-BR Rotas REST de repartos (`/api/repartos`) — issue #140.
 */
export function registerRepartosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const repartos: RepartoService = services.repartos
  const repartoUbicacion: RepartoUbicacionService = services.repartoUbicacion
  const gpsModule = requireModule('logistics.gps')

  app.get(
    '/api/repartos',
    requirePermission('logistics.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)

        const estadoRaw = req.query.estado
        const estado = parseOptionalRepartoEstado(estadoRaw)
        if (typeof estadoRaw === 'string' && estadoRaw.trim().length > 0 && estado === undefined) {
          res.status(400).json({ success: false, error: 'estado must be a valid reparto status' })
          return
        }

        const choferId = parseOptionalPositiveInt(req.query.choferId)
        const choferIdRaw = req.query.choferId
        if (typeof choferIdRaw === 'string' && choferIdRaw.trim().length > 0 && choferId === undefined) {
          res.status(400).json({ success: false, error: 'choferId must be a positive integer' })
          return
        }

        let fecha: Date | undefined
        const fechaRaw = req.query.fecha
        if (typeof fechaRaw === 'string' && fechaRaw.trim().length > 0) {
          try {
            fecha = facturaFechaToPrismaDate(fechaRaw.trim())
          } catch {
            res.status(400).json({ success: false, error: 'fecha must be YYYY-MM-DD' })
            return
          }
        }

        const { total, repartos: rows } = await repartos.list(
          tenantId,
          { fecha, choferId, estado },
          take,
          skip,
        )
        res.json(paginatedListJson(rows, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/repartos/activos',
    gpsModule,
    requirePermission('logistics.read'),
    (req: Request, res: Response, next) => {
      const authReq = req as AuthenticatedRequest
      const role = authReq.auth!.claims.role
      if (GPS_VIEW_ROLES.includes(role as (typeof GPS_VIEW_ROLES)[number])) {
        next()
        return
      }
      res.status(403).json({ success: false, error: 'Forbidden' })
    },
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const result = await repartoUbicacion.listActivos(tenantId, authReq.auth!.claims.role)
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
    '/api/repartos/:id',
    requirePermission('logistics.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await repartos.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'REPARTO_NOT_FOUND' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/repartos',
    requirePermission('orders.dispatch'),
    validateBody(repartoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const result = await repartos.create(tenantId, req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'reparto_created', 'reparto', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/repartos/:id/ubicacion',
    gpsModule,
    requirePermission('orders.deliver.confirm'),
    validateBody(repartoUbicacionBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartoUbicacion.recordLocation(
          tenantId,
          id,
          authReq.auth!.claims.userId,
          req.body,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'reparto_ubicacion_recorded', 'reparto', String(id), {
          lat: result.data.lat,
          lng: result.data.lng,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/repartos/:id/ubicacion/ultima',
    gpsModule,
    requirePermission('logistics.read'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartoUbicacion.getUltima(tenantId, id, {
          role: authReq.auth!.claims.role,
          userId: authReq.auth!.claims.userId,
        })
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
    '/api/repartos/:id/iniciar',
    requirePermission('orders.dispatch'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartos.iniciar(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'reparto_started', 'reparto', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/repartos/:id/cerrar',
    requirePermission('orders.dispatch'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartos.cerrar(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'reparto_closed', 'reparto', String(result.data.reparto.id), {
          summary: result.data.summary,
        })
        res.json({ success: true, data: result.data.reparto, summary: result.data.summary })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/repartos/:id/items/:itemId',
    requirePermission('orders.deliver.confirm'),
    validateBody(repartoItemPodBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const repartoId = Number.parseInt(String(req.params.id), 10)
        const itemId = Number.parseInt(String(req.params.itemId), 10)
        if (!Number.isFinite(repartoId) || repartoId < 1 || !Number.isFinite(itemId) || itemId < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartos.updateItemPod(tenantId, repartoId, itemId, req.body, {
          userId: authReq.auth!.claims.userId,
          role: authReq.auth!.claims.role,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        if (result.data.auditSigned) {
          await writeAudit(authReq, 'reparto_item_pod_signed', 'reparto_item', String(itemId), {
            repartoId,
          })
        }
        res.json({ success: true, data: result.data.item })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/repartos/:id/items/:itemId/pod',
    (req: Request, res: Response, next) => {
      const authReq = req as AuthenticatedRequest
      const role = authReq.auth!.claims.role
      if (
        hasPermission(role, 'logistics.read' as Permission) &&
        POD_VIEW_ROLES.includes(role as (typeof POD_VIEW_ROLES)[number])
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
        const repartoId = Number.parseInt(String(req.params.id), 10)
        const itemId = Number.parseInt(String(req.params.itemId), 10)
        if (!Number.isFinite(repartoId) || repartoId < 1 || !Number.isFinite(itemId) || itemId < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await repartos.getItemPod(
          tenantId,
          repartoId,
          itemId,
          authReq.auth!.claims.role,
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
}
