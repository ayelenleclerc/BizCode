import type { Application, Request, Response } from 'express'
import { hasPermission, type UserRole } from '@bizcode/types'
import {
  requireAnyPermission,
  requirePermission,
  type AuthenticatedRequest,
} from '../auth'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { validateBody } from '../middleware/validateBody'
import { visitaCreateBodySchema, visitaUpdateBodySchema } from '../schemas/domain'
import type { VisitaVendedorCreateInput, VisitaVendedorUpdateInput } from '@bizcode/types'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function canManageOtherSellers(role: string): boolean {
  return (
    hasPermission(role as UserRole, 'reports.operational.read') ||
    hasPermission(role as UserRole, 'customers.manage')
  )
}

/**
 * @en Field seller visit agenda REST (#170).
 * @es REST de agenda de visitas del vendedor (#170).
 * @pt-BR REST da agenda de visitas do vendedor (#170).
 */
export function registerVisitasRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { visita } = services
  const ownership = verifyOwnership(ctx.prisma, 'visita')

  app.get(
    '/api/visitas',
    requireAnyPermission('orders.create', 'reports.operational.read', 'customers.manage'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const role = authReq.auth!.claims.role
        const userId = authReq.auth!.claims.userId
        const fechaRaw = typeof req.query.fecha === 'string' ? req.query.fecha.trim() : ''
        if (!fechaRaw) {
          res.status(400).json({ success: false, error: 'fecha is required (YYYY-MM-DD)' })
          return
        }
        const vendedorIdRaw = req.query.vendedorId
        const vendedorId =
          typeof vendedorIdRaw === 'string' && vendedorIdRaw.trim() !== ''
            ? parseInt(vendedorIdRaw, 10)
            : userId
        if (!Number.isInteger(vendedorId) || vendedorId < 1) {
          res.status(400).json({ success: false, error: 'vendedorId must be >= 1' })
          return
        }
        if (vendedorId !== userId && !canManageOtherSellers(role)) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        const { take, skip } = parseListPagination(req)
        const result = await visita.list(tenantId, { fecha: fechaRaw, vendedorId }, take, skip)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({
          ...paginatedListJson(result.data.visitas, result.data.total, take, skip),
          kpi: result.data.kpi,
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/visitas/:id',
    requireAnyPermission('orders.create', 'reports.operational.read', 'customers.manage'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await visita.getById(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        if (
          result.data.vendedorId !== authReq.auth!.claims.userId &&
          !canManageOtherSellers(authReq.auth!.claims.role)
        ) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/visitas',
    requirePermission('orders.create'),
    validateBody(visitaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as VisitaVendedorCreateInput
        if (
          body.vendedorId !== authReq.auth!.claims.userId &&
          !canManageOtherSellers(authReq.auth!.claims.role)
        ) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        const result = await visita.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'visita_create',
          'visita',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/visitas/:id',
    requirePermission('orders.create'),
    ownership,
    validateBody(visitaUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const existing = await visita.getById(tenantId, id)
        if (!existing.ok) {
          res.status(existing.status).json({ success: false, error: existing.error })
          return
        }
        if (
          existing.data.vendedorId !== authReq.auth!.claims.userId &&
          !canManageOtherSellers(authReq.auth!.claims.role)
        ) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        const body = req.body as VisitaVendedorUpdateInput
        const result = await visita.update(tenantId, id, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'visita_update', 'visita', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
