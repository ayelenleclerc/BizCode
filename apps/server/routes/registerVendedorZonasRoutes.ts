import type { Application, Request, Response } from 'express'
import { hasPermission, type UserRole, type VendedorZonaCreateInput } from '@bizcode/types'
import {
  requireAnyPermission,
  requirePermission,
  type AuthenticatedRequest,
} from '../auth'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { validateBody } from '../middleware/validateBody'
import { vendedorZonaCreateBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function canManageZones(role: string): boolean {
  return (
    hasPermission(role as UserRole, 'customers.manage') ||
    hasPermission(role as UserRole, 'users.manage') ||
    hasPermission(role as UserRole, 'reports.operational.read')
  )
}

/**
 * @en Seller zone assignment REST (#267).
 * @es REST de asignación de zonas al vendedor (#267).
 * @pt-BR REST de atribuição de zonas ao vendedor (#267).
 */
export function registerVendedorZonasRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { vendedorZona } = services
  const ownership = verifyOwnership(ctx.prisma, 'vendedorZona')

  app.get(
    '/api/vendedor-zonas',
    requireAnyPermission('orders.create', 'reports.operational.read', 'customers.manage'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const role = authReq.auth!.claims.role
        const userId = authReq.auth!.claims.userId
        const vendedorIdRaw = req.query.vendedorId
        let vendedorId: number | undefined
        if (typeof vendedorIdRaw === 'string' && vendedorIdRaw.trim() !== '') {
          vendedorId = parseInt(vendedorIdRaw, 10)
          if (!Number.isInteger(vendedorId) || vendedorId < 1) {
            res.status(400).json({ success: false, error: 'vendedorId must be >= 1' })
            return
          }
          if (vendedorId !== userId && !canManageZones(role)) {
            res.status(403).json({ success: false, error: 'Forbidden' })
            return
          }
        } else if (!canManageZones(role)) {
          vendedorId = userId
        }
        const { take, skip } = parseListPagination(req)
        const result = await vendedorZona.list(tenantId, { vendedorId }, take, skip)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(paginatedListJson(result.data.items, result.data.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/vendedor-zonas',
    requirePermission('customers.manage'),
    validateBody(vendedorZonaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as VendedorZonaCreateInput
        const result = await vendedorZona.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'vendedor_zona_create',
          'vendedorZona',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/vendedor-zonas/:id',
    requirePermission('customers.manage'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const result = await vendedorZona.delete(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'vendedor_zona_delete', 'vendedorZona', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
