import type { Application, Request, Response } from 'express'
import type { ConfigFefoUpsertInput } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { fefoMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  configFefoUpsertBodySchema,
  loteCreateBodySchema,
  loteListQuerySchema,
  trazabilidadQuerySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function articuloIdParam(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en FEFO / lots REST endpoints (#202).
 * @es Endpoints REST de FEFO / lotes (#202).
 * @pt-BR Endpoints REST de FEFO / lotes (#202).
 */
export function registerLotesRoutes(app: Application, ctx: RestRouteContext): void {
  const { lotes } = ctx.services
  const fefoModule = requireModule('inventory.fefo')
  const lotsModule = requireModule('inventory.lots')
  const readPermission = requirePermission('products.read')
  const adjustPermission = requirePermission('inventory.adjust')

  app.get(
    '/api/fefo/config',
    fefoModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const data = await lotes.getConfig(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/fefo/config',
    fefoModule,
    adjustPermission,
    fefoMutationHttpRateLimiter,
    validateBody(configFefoUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await lotes.upsertConfig(
          getTenantId(req),
          req.body as ConfigFefoUpsertInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'fefo_config_update',
          'config_fefo',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get('/api/lotes', fefoModule, readPermission, async (req: Request, res: Response) => {
    try {
      const parsed = loteListQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid query parameters' })
        return
      }
      const data = await lotes.list(getTenantId(req), parsed.data)
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get(
    '/api/lotes/por-vencer',
    fefoModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const data = await lotes.listExpiring(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/lotes',
    fefoModule,
    adjustPermission,
    fefoMutationHttpRateLimiter,
    validateBody(loteCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as {
          articuloId: number
          depositoId: number
          nroLote: string
          fechaVencimiento: string
          proveedorId?: number | null
          stockInicial?: number
        }
        const result = await lotes.create(getTenantId(req), body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lote_create',
          'lote',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/lotes/preview-fefo',
    fefoModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const articuloId = Number.parseInt(String(req.query.articuloId ?? ''), 10)
        const depositoId = Number.parseInt(String(req.query.depositoId ?? ''), 10)
        const quantity = Number.parseInt(String(req.query.quantity ?? ''), 10)
        if (
          !Number.isInteger(articuloId) ||
          articuloId < 1 ||
          !Number.isInteger(depositoId) ||
          depositoId < 1 ||
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          res.status(400).json({
            success: false,
            error: 'articuloId, depositoId and quantity must be positive integers',
          })
          return
        }
        const result = await lotes.previewFefo(getTenantId(req), articuloId, depositoId, quantity)
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
    '/api/articulos/:id/trazabilidad',
    lotsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = trazabilidadQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'loteId query is required' })
          return
        }
        const result = await lotes.getTrazabilidad(
          getTenantId(req),
          articuloIdParam(req),
          parsed.data.loteId,
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
