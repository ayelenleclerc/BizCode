import type { Application, Request, Response } from 'express'
import { requireAnyPermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import {
  articuloProveedoresComparadorQuerySchema,
  proveedoresCompararQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type {
  ArticuloProveedoresSortDirection,
  ArticuloProveedoresSortField,
} from '../services/ArticuloProveedoresComparadorService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseSortOptions(query: {
  sortBy?: ArticuloProveedoresSortField
  sortDir?: ArticuloProveedoresSortDirection
}): { sortBy?: ArticuloProveedoresSortField; sortDir?: ArticuloProveedoresSortDirection } {
  return {
    ...(query.sortBy !== undefined ? { sortBy: query.sortBy } : {}),
    ...(query.sortDir !== undefined ? { sortDir: query.sortDir } : {}),
  }
}

/**
 * @en Article ↔ supplier price comparator routes (#274).
 * @es Rutas del comparador de precios por artículo (#274).
 * @pt-BR Rotas do comparador de preços por artigo (#274).
 */
export function registerArticuloProveedoresComparadorRoutes(
  app: Application,
  ctx: RestRouteContext,
): void {
  const { articuloProveedoresComparador } = ctx.services
  const purchasesModule = requireModule('logistics.purchases')
  const readAccess = requireAnyPermission('products.read', 'suppliers.read')

  const respondComparador = async (
    req: Request,
    res: Response,
    articuloId: number,
    sortOptions: ReturnType<typeof parseSortOptions>,
  ): Promise<void> => {
    try {
      const tenantId = getTenantId(req)
      const data = await articuloProveedoresComparador.listProveedoresForArticulo(
        tenantId,
        articuloId,
        sortOptions,
      )
      if (!data) {
        res.status(404).json({ success: false, error: 'Articulo not found' })
        return
      }
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  }

  app.get(
    '/api/articulos/:id/proveedores',
    purchasesModule,
    readAccess,
    async (req: Request, res: Response) => {
      const articuloId = parsePositiveIntParam(String(req.params.id))
      if (articuloId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const parsed = safeParseBodySchema(articuloProveedoresComparadorQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }

      await respondComparador(req, res, articuloId, parseSortOptions(parsed.value))
    },
  )

  app.get(
    '/api/proveedores/comparar',
    purchasesModule,
    readAccess,
    async (req: Request, res: Response) => {
      const parsed = safeParseBodySchema(proveedoresCompararQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }

      await respondComparador(req, res, parsed.value.articuloId, parseSortOptions(parsed.value))
    },
  )
}
