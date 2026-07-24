import type { Application, Request, Response } from 'express'
import type {
  ConfigComisionCreateInput,
  ConfigComisionPatchInput,
  LiquidacionGenerarInput,
  ComisionTipo,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { comisionesMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  comisionesSettingsBodySchema,
  configComisionCreateBodySchema,
  configComisionPatchBodySchema,
  liquidacionGenerarBodySchema,
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
 * @en REST endpoints for seller commissions config and settlements (#237).
 * @es Endpoints REST de configuración y liquidación de comisiones (#237).
 * @pt-BR Endpoints REST de configuração e liquidação de comissões (#237).
 */
export function registerComisionesRoutes(app: Application, ctx: RestRouteContext): void {
  const { comisionConfig, liquidacionComision } = ctx.services
  const moduleGuard = requireModule('finance.commissions')
  const readPermission = requireAnyPermission(
    'commissions.read',
    'commissions.manage',
    'commissions.approve',
  )
  const managePermission = requirePermission('commissions.manage')
  const approvePermission = requirePermission('commissions.approve')
  const selfPermission = requirePermission('commissions.self.read')

  app.get(
    '/api/comisiones/settings',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const modoDevengo = await comisionConfig.getModoDevengo(getTenantId(req))
        res.json({ success: true, data: { modoDevengo } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/comisiones/settings',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    validateBody(comisionesSettingsBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await comisionConfig.setModoDevengo(
          getTenantId(req),
          (req.body as { modoDevengo: ComisionTipo }).modoDevengo,
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

  app.get(
    '/api/comisiones/configs',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const vendedorId =
          typeof req.query.vendedorId === 'string' && req.query.vendedorId.length > 0
            ? Number.parseInt(req.query.vendedorId, 10)
            : null
        const result = await comisionConfig.list(getTenantId(req), take, skip, {
          vendedorId: Number.isFinite(vendedorId) ? vendedorId : null,
        })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/comisiones/configs',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    validateBody(configComisionCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await comisionConfig.create(
          getTenantId(req),
          req.body as ConfigComisionCreateInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_config.create',
          'config_comision',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/comisiones/configs/:id',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    validateBody(configComisionPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await comisionConfig.update(
          getTenantId(req),
          pathId(req),
          req.body as ConfigComisionPatchInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_config.update',
          'config_comision',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/comisiones/configs/:id',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const id = pathId(req)
        const result = await comisionConfig.remove(getTenantId(req), id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_config.delete',
          'config_comision',
          String(id),
        )
        res.status(204).send()
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/comisiones/liquidaciones',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const periodo =
          typeof req.query.periodo === 'string' && req.query.periodo.length > 0
            ? req.query.periodo
            : null
        const estado =
          typeof req.query.estado === 'string' && req.query.estado.length > 0
            ? req.query.estado
            : null
        const vendedorId =
          typeof req.query.vendedorId === 'string' && req.query.vendedorId.length > 0
            ? Number.parseInt(req.query.vendedorId, 10)
            : null
        const result = await liquidacionComision.list(getTenantId(req), take, skip, {
          periodo,
          estado,
          vendedorId: Number.isFinite(vendedorId) ? vendedorId : null,
        })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/comisiones/liquidaciones/:id',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await liquidacionComision.getById(getTenantId(req), pathId(req))
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
    '/api/comisiones/liquidaciones/generar',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    validateBody(liquidacionGenerarBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as LiquidacionGenerarInput
        const result = await liquidacionComision.generate(
          getTenantId(req),
          body.periodo,
          body.vendedorId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_liquidacion.generate',
          'liquidacion_comision',
          body.periodo,
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/comisiones/liquidaciones/:id/aprobar',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    approvePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await liquidacionComision.approve(
          getTenantId(req),
          pathId(req),
          authUserId(req),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_liquidacion.approve',
          'liquidacion_comision',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/comisiones/liquidaciones/:id/pagar',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    approvePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await liquidacionComision.markPaid(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'comision_liquidacion.pay',
          'liquidacion_comision',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/comisiones/liquidaciones/:id/export.csv',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await liquidacionComision.exportCsv(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="liquidacion-comision-${pathId(req)}.csv"`,
        )
        res.status(200).send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/comisiones/ranking',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const periodo =
          typeof req.query.periodo === 'string' && /^\d{4}-\d{2}$/.test(req.query.periodo)
            ? req.query.periodo
            : null
        if (!periodo) {
          res.status(400).json({ success: false, error: 'periodo required (YYYY-MM)' })
          return
        }
        const rows = await liquidacionComision.ranking(getTenantId(req), periodo)
        res.json({ success: true, data: rows })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/comisiones/mias',
    comisionesMutationHttpRateLimiter,
    moduleGuard,
    selfPermission,
    async (req: Request, res: Response) => {
      try {
        const periodo =
          typeof req.query.periodo === 'string' && /^\d{4}-\d{2}$/.test(req.query.periodo)
            ? req.query.periodo
            : `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`
        const data = await liquidacionComision.misComisiones(
          getTenantId(req),
          authUserId(req),
          periodo,
        )
        res.json(data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
