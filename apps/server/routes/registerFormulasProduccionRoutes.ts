import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { formulasProduccionMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import {
  formulaProduccionCreateBodySchema,
  formulaProduccionUpdateBodySchema,
  formulaProyeccionBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import { paginatedListJson } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en REST endpoints for production BOM formulas (#248).
 * @es Endpoints REST de fórmulas BOM de producción (#248).
 * @pt-BR Endpoints REST de fórmulas BOM de produção (#248).
 */
export function registerFormulasProduccionRoutes(app: Application, ctx: RestRouteContext): void {
  const { formulaProduccion } = ctx.services
  const moduleGuard = requireModule('production.bom')
  const readPermission = requirePermission('products.read')
  const managePermission = requirePermission('products.manage')

  app.get(
    '/api/formulas-produccion',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await formulaProduccion.list(getTenantId(req), req)
        res.json(paginatedListJson(result.items, result.total, result.limit, result.offset))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/formulas-produccion/:id',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await formulaProduccion.getById(getTenantId(req), id)
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
    '/api/formulas-produccion/:id/costo',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await formulaProduccion.getCosto(getTenantId(req), id)
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
    '/api/formulas-produccion',
    formulasProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(formulaProduccionCreateBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await formulaProduccion.create(getTenantId(req), parsed.value)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'formulas_produccion.create',
          'formula_produccion',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/formulas-produccion/:id',
    formulasProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const parsed = safeParseBodySchema(formulaProduccionUpdateBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await formulaProduccion.update(getTenantId(req), id, parsed.value)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'formulas_produccion.update_version',
          'formula_produccion',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/formulas-produccion/:id/desactivar',
    formulasProduccionMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await formulaProduccion.deactivate(getTenantId(req), id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'formulas_produccion.deactivate',
          'formula_produccion',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/formulas-produccion/:id/proyeccion',
    formulasProduccionMutationHttpRateLimiter,
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const parsed = safeParseBodySchema(formulaProyeccionBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await formulaProduccion.proyectar(
          getTenantId(req),
          id,
          parsed.value.unidades,
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
