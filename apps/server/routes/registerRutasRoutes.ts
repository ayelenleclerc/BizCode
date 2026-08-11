import type { Application, Request, Response } from 'express'
import {
  hasPermission,
  type RutaParadaPatchInput,
  type RutaParadasReplaceInput,
  type RutaVendedorCreateInput,
  type UserRole,
} from '@bizcode/types'
import {
  requireAnyPermission,
  requirePermission,
  type AuthenticatedRequest,
} from '../auth'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { validateBody } from '../middleware/validateBody'
import {
  rutaCreateBodySchema,
  rutaParadaPatchBodySchema,
  rutaParadasReplaceBodySchema,
} from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function canManageOtherSellers(role: string): boolean {
  return (
    hasPermission(role as UserRole, 'reports.operational.read') ||
    hasPermission(role as UserRole, 'customers.manage')
  )
}

/**
 * @en Daily seller route REST (#267).
 * @es REST de ruta diaria del vendedor (#267).
 * @pt-BR REST da rota diária do vendedor (#267).
 */
export function registerRutasRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { ruta } = services
  const ownership = verifyOwnership(ctx.prisma, 'ruta')

  app.get(
    '/api/rutas',
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
        const result = await ruta.getByFilters(tenantId, { fecha: fechaRaw, vendedorId })
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
    '/api/rutas',
    requirePermission('orders.create'),
    validateBody(rutaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const body = req.body as RutaVendedorCreateInput
        if (
          body.vendedorId !== authReq.auth!.claims.userId &&
          !canManageOtherSellers(authReq.auth!.claims.role)
        ) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        const result = await ruta.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'ruta_create', 'ruta', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/rutas/:id/paradas',
    requirePermission('orders.create'),
    ownership,
    validateBody(rutaParadasReplaceBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const existing = await ruta.getById(tenantId, id)
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
        const body = req.body as RutaParadasReplaceInput
        const result = await ruta.replaceParadas(tenantId, id, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'ruta_paradas_replace', 'ruta', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/rutas/:id/paradas/:paradaId',
    requirePermission('orders.create'),
    ownership,
    validateBody(rutaParadaPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const paradaId = parseInt(String(req.params.paradaId), 10)
        if (!Number.isInteger(paradaId) || paradaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid paradaId' })
          return
        }
        const existing = await ruta.getById(tenantId, id)
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
        const body = req.body as RutaParadaPatchInput
        const result = await ruta.patchParada(tenantId, id, paradaId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'ruta_parada_patch', 'ruta', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/rutas/:id/stats',
    requireAnyPermission('orders.create', 'reports.operational.read', 'customers.manage'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const existing = await ruta.getById(tenantId, id)
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
        const result = await ruta.stats(tenantId, id)
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
