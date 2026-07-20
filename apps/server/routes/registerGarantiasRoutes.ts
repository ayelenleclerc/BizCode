import type { Application, Request, Response } from 'express'
import type { GarantiaRegisterInput, GarantiaUsoInput } from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { garantiaRegisterBodySchema, garantiaUsoBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function garantiaId(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en Warranty REST endpoints (#251).
 * @es Endpoints REST de garantías (#251).
 * @pt-BR Endpoints REST de garantias (#251).
 */
export function registerGarantiasRoutes(app: Application, ctx: RestRouteContext): void {
  const { garantia } = ctx.services
  const warrantiesModule = requireModule('service.warranties')
  const readPermission = requireAnyPermission('sales.create', 'reports.operational.read')
  const writePermission = requirePermission('sales.create')

  app.get(
    '/api/garantias',
    warrantiesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const estado = typeof req.query.estado === 'string' ? req.query.estado : null
        const q = typeof req.query.q === 'string' ? req.query.q : null
        const proximas =
          req.query.proximas === '1' ||
          req.query.proximas === 'true' ||
          req.query.proximas === 'yes'
        const result = await garantia.list(getTenantId(req), take, skip, {
          estado,
          q,
          proximas,
        })
        res.json({
          ...paginatedListJson(result.garantias, result.total, take, skip),
          counts: result.counts,
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/garantias/lookup',
    warrantiesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const serial = typeof req.query.serial === 'string' ? req.query.serial : ''
        if (!serial.trim()) {
          res.status(400).json({ success: false, error: 'serial query is required' })
          return
        }
        const result = await garantia.lookupBySerial(getTenantId(req), serial)
        res.json({ success: true, data: result })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/garantias/:id',
    warrantiesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await garantia.getById(getTenantId(req), garantiaId(req))
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
    '/api/garantias',
    warrantiesModule,
    writePermission,
    validateBody(garantiaRegisterBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await garantia.register(
          getTenantId(req),
          req.body as GarantiaRegisterInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'garantia_create', 'garantia', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/garantias/:id/anular',
    warrantiesModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await garantia.anular(getTenantId(req), garantiaId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'garantia_anular', 'garantia', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/garantias/:id/usos',
    warrantiesModule,
    writePermission,
    validateBody(garantiaUsoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const userId = (req as AuthenticatedRequest).auth!.claims.userId
        const result = await garantia.registrarUso(
          getTenantId(req),
          garantiaId(req),
          userId,
          req.body as GarantiaUsoInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'garantia_uso', 'garantia', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
