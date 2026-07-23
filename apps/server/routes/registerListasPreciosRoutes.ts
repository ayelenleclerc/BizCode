import type { Application, Request, Response } from 'express'
import type {
  ListaPrecioBulkUpdateInput,
  ListaPrecioCreateInput,
  ListaPrecioPatchInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  listaPrecioBulkUpdateBodySchema,
  listaPrecioCreateBodySchema,
  listaPrecioItemBodySchema,
  listaPrecioPatchBodySchema,
  precioEfectivoQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type { ListaPrecioItemUpsertInput } from '../services/ListaPrecioService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function pathId(req: Request, key = 'id'): number {
  return Number.parseInt(String(req.params[key]), 10)
}

/**
 * @en Price-list REST endpoints: CRUD, tiers, bulk update and effective price (#234).
 * @es Endpoints REST de listas de precios: CRUD, tramos, actualización masiva y precio efectivo (#234).
 * @pt-BR Endpoints REST de listas de preços: CRUD, faixas, atualização em massa e preço efetivo (#234).
 */
export function registerListasPreciosRoutes(app: Application, ctx: RestRouteContext): void {
  const { listaPrecio } = ctx.services
  const priceModule = requireModule('catalog.pricelists')
  const readPermission = requireAnyPermission('products.read', 'products.manage')
  const writePermission = requirePermission('products.manage')

  app.get(
    '/api/listas-precios',
    priceModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const activa =
          typeof req.query.activa === 'string'
            ? req.query.activa === 'true'
              ? true
              : req.query.activa === 'false'
                ? false
                : null
            : null
        const result = await listaPrecio.list(getTenantId(req), take, skip, { activa })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/listas-precios',
    priceModule,
    writePermission,
    validateBody(listaPrecioCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.create(
          getTenantId(req),
          req.body as ListaPrecioCreateInput & {
            moneda: string
            activa: boolean
            esDefault: boolean
            vigenciaHasta: string | null
          },
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lista_precio_create',
          'lista_precio',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  // Must be registered before `/:id` so it is not captured as a numeric id.
  app.get(
    '/api/listas-precios/precio-efectivo',
    priceModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(precioEfectivoQuerySchema, req.query)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await listaPrecio.getPrecioEfectivo(
          getTenantId(req),
          parsed.value.articuloId,
          parsed.value.listaPrecioId ?? undefined,
          parsed.value.cantidad,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/listas-precios/:id',
    priceModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.getById(getTenantId(req), pathId(req))
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

  app.patch(
    '/api/listas-precios/:id',
    priceModule,
    writePermission,
    validateBody(listaPrecioPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.update(
          getTenantId(req),
          pathId(req),
          req.body as ListaPrecioPatchInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lista_precio_update',
          'lista_precio',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/listas-precios/:id',
    priceModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.remove(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lista_precio_delete',
          'lista_precio',
          String(pathId(req)),
        )
        res.status(204).send()
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/listas-precios/:id/items',
    priceModule,
    writePermission,
    validateBody(listaPrecioItemBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.upsertItem(
          getTenantId(req),
          pathId(req),
          req.body as ListaPrecioItemUpsertInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lista_precio_item_upsert',
          'lista_precio_item',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/listas-precios/:id/items/:itemId',
    priceModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await listaPrecio.removeItem(
          getTenantId(req),
          pathId(req),
          pathId(req, 'itemId'),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lista_precio_item_delete',
          'lista_precio_item',
          String(pathId(req, 'itemId')),
        )
        res.status(204).send()
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/listas-precios/:id/actualizar-masivo',
    priceModule,
    writePermission,
    validateBody(listaPrecioBulkUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as ListaPrecioBulkUpdateInput & { preview: boolean }
        const result = await listaPrecio.bulkUpdate(
          getTenantId(req),
          pathId(req),
          body.porcentaje,
          body.preview,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        if (!body.preview) {
          await ctx.writeAudit(
            req as AuthenticatedRequest,
            'lista_precio_bulk_update',
            'lista_precio',
            String(pathId(req)),
          )
        }
        res.json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
