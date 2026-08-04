import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireTiendanubeIntegration } from '../middleware/requireTiendanubeIntegration'
import { tiendanubeOAuthHttpRateLimiter } from '../middleware/routeRateLimit'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { TiendanubeCatalogService } from '../services/TiendanubeCatalogService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Tiendanube catalog listing routes (#187).
 * @es Rutas de publicaciones de catálogo Tiendanube (#187).
 * @pt-BR Rotas de anúncios de catálogo Tiendanube (#187).
 */
export function registerTiendanubeCatalogRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const catalog = new TiendanubeCatalogService(prisma)
  const requireTn = requireTiendanubeIntegration(prisma)
  const ownership = verifyOwnership(prisma, 'articulo')

  app.get(
    '/api/articulos/:id/tiendanube',
    requirePermission('products.read'),
    requireTn,
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
    '/api/articulos/:id/tiendanube',
    tiendanubeOAuthHttpRateLimiter,
    requirePermission('products.manage'),
    requireTn,
    ownership,
    async (req: Request, res: Response) => {
      try {
        const articuloId = Number.parseInt(String(req.params.id), 10)
        if (!Number.isInteger(articuloId)) {
          res.status(400).json({ success: false, error: 'Invalid articulo id' })
          return
        }
        const result = await catalog.upsertAndSync(getTenantId(req), articuloId)
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
    '/api/articulos/:id/tiendanube',
    tiendanubeOAuthHttpRateLimiter,
    requirePermission('products.manage'),
    requireTn,
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
