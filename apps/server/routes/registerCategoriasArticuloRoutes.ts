import type { Application, Request, Response } from 'express'
import type {
  CategoriaArticuloCreateInput,
  CategoriaArticuloPatchInput,
  CategoriaAtributoCreateInput,
  CategoriaAtributoPatchInput,
  CategoriaAtributoValorCreateInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  categoriaArticuloCreateBodySchema,
  categoriaArticuloPatchBodySchema,
  categoriaAtributoCreateBodySchema,
  categoriaAtributoPatchBodySchema,
  categoriaAtributoValorCreateBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function pathId(req: Request, key = 'id'): number {
  return Number.parseInt(String(req.params[key]), 10)
}

/**
 * @en Hierarchical category REST endpoints for article variants (#235).
 * @es Endpoints REST de categorías jerárquicas para variantes de artículos (#235).
 * @pt-BR Endpoints REST de categorias hierárquicas para variantes de artigos (#235).
 */
export function registerCategoriasArticuloRoutes(app: Application, ctx: RestRouteContext): void {
  const { categoriaArticulo } = ctx.services
  const variantsModule = requireModule('catalog.variants')
  const readPermission = requireAnyPermission('products.read', 'products.manage')
  const writePermission = requirePermission('products.manage')

  app.get(
    '/api/categorias-articulo',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const padreRaw = req.query.padreId
        const padreId =
          padreRaw === 'null'
            ? null
            : typeof padreRaw === 'string' && padreRaw !== ''
              ? Number.parseInt(padreRaw, 10)
              : undefined
        const activo =
          typeof req.query.activo === 'string'
            ? req.query.activo === 'true'
              ? true
              : req.query.activo === 'false'
                ? false
                : null
            : null
        const result = await categoriaArticulo.list(getTenantId(req), take, skip, {
          padreId: Number.isFinite(padreId as number) || padreId === null ? padreId : undefined,
          activo,
        })
        res.json(paginatedListJson(result.rows, result.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/categorias-articulo',
    variantsModule,
    writePermission,
    validateBody(categoriaArticuloCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.create(
          getTenantId(req),
          req.body as CategoriaArticuloCreateInput & {
            codigo: string | null
            padreId: number | null
            precioDefault: number | null
            activo: boolean
          },
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'create', 'categoria_articulo', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/categorias-articulo/:id',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.getById(getTenantId(req), pathId(req))
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
    '/api/categorias-articulo/:id',
    variantsModule,
    writePermission,
    validateBody(categoriaArticuloPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.update(
          getTenantId(req),
          pathId(req),
          req.body as CategoriaArticuloPatchInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'update', 'categoria_articulo', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/categorias-articulo/:id',
    variantsModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.remove(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'delete', 'categoria_articulo', String(pathId(req)))
        res.json({ success: true })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/categorias-articulo/:id/atributos',
    variantsModule,
    writePermission,
    validateBody(categoriaAtributoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.addAtributo(
          getTenantId(req),
          pathId(req),
          req.body as CategoriaAtributoCreateInput & {
            orden: number
            valores: Array<{ valor: string; orden: number }>
          },
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/categorias-articulo/:id/atributos/:atributoId',
    variantsModule,
    writePermission,
    validateBody(categoriaAtributoPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.patchAtributo(
          getTenantId(req),
          pathId(req),
          pathId(req, 'atributoId'),
          req.body as CategoriaAtributoPatchInput,
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

  app.delete(
    '/api/categorias-articulo/:id/atributos/:atributoId',
    variantsModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.removeAtributo(
          getTenantId(req),
          pathId(req),
          pathId(req, 'atributoId'),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/categorias-articulo/:id/atributos/:atributoId/valores',
    variantsModule,
    writePermission,
    validateBody(categoriaAtributoValorCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.addValor(
          getTenantId(req),
          pathId(req),
          pathId(req, 'atributoId'),
          req.body as CategoriaAtributoValorCreateInput & { orden: number },
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/categorias-articulo/:id/atributos/:atributoId/valores/:valorId',
    variantsModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await categoriaArticulo.removeValor(
          getTenantId(req),
          pathId(req),
          pathId(req, 'atributoId'),
          pathId(req, 'valorId'),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
