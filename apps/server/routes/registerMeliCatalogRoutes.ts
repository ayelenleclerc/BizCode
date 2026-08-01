import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireMeliIntegration } from '../middleware/requireMeliIntegration'
import { meliOAuthHttpRateLimiter } from '../middleware/routeRateLimit'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { MeliCatalogService } from '../services/MeliCatalogService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

type MeliAttributeBody = { id: string; value_name?: string; value_id?: string }

function parseAtributosBody(raw: unknown): MeliAttributeBody[] | null {
  if (raw == null) return []
  if (!Array.isArray(raw)) return null
  const out: MeliAttributeBody[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null
    const rec = row as Record<string, unknown>
    if (typeof rec.id !== 'string' || !rec.id.trim()) return null
    const attr: MeliAttributeBody = { id: rec.id.trim() }
    if (rec.value_name != null) {
      if (typeof rec.value_name !== 'string') return null
      attr.value_name = rec.value_name
    }
    if (rec.value_id != null) {
      if (typeof rec.value_id !== 'string') return null
      attr.value_id = rec.value_id
    }
    out.push(attr)
  }
  return out
}

/**
 * @en Mercado Libre catalog listing routes (#184).
 * @es Rutas de publicaciones de catálogo Mercado Libre (#184).
 * @pt-BR Rotas de anúncios de catálogo Mercado Livre (#184).
 */
export function registerMeliCatalogRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const catalog = new MeliCatalogService(prisma)
  const requireMeli = requireMeliIntegration(prisma)
  const ownership = verifyOwnership(prisma, 'articulo')

  app.get(
    '/api/meli/categories/search',
    meliOAuthHttpRateLimiter,
    requirePermission('products.read'),
    requireMeli,
    async (req: Request, res: Response) => {
      try {
        const q = typeof req.query.q === 'string' ? req.query.q : ''
        const result = await catalog.searchCategories(getTenantId(req), q)
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
    '/api/articulos/:id/meli',
    requirePermission('products.read'),
    requireMeli,
    ownership,
    async (req: Request, res: Response) => {
      try {
        const articuloId = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(articuloId)) {
          res.status(400).json({ success: false, error: 'Invalid articulo id' })
          return
        }
        const result = await catalog.getStatus(getTenantId(req), articuloId)
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

  app.put(
    '/api/articulos/:id/meli',
    meliOAuthHttpRateLimiter,
    requirePermission('products.manage'),
    requireMeli,
    ownership,
    async (req: Request, res: Response) => {
      try {
        const articuloId = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(articuloId)) {
          res.status(400).json({ success: false, error: 'Invalid articulo id' })
          return
        }
        const body = req.body as Record<string, unknown>
        const meliCategoryId = typeof body.meliCategoryId === 'string' ? body.meliCategoryId : ''
        const atributos = parseAtributosBody(body.atributos)
        if (atributos == null) {
          res.status(400).json({ success: false, error: 'atributos must be an array of { id, value_name?, value_id? }' })
          return
        }
        const result = await catalog.upsertAndSync(getTenantId(req), articuloId, {
          meliCategoryId,
          atributos,
        })
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
    '/api/articulos/:id/meli',
    meliOAuthHttpRateLimiter,
    requirePermission('products.manage'),
    requireMeli,
    ownership,
    async (req: Request, res: Response) => {
      try {
        const articuloId = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(articuloId)) {
          res.status(400).json({ success: false, error: 'Invalid articulo id' })
          return
        }
        const result = await catalog.unlink(getTenantId(req), articuloId)
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
