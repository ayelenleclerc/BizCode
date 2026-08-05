import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireWooCommerceIntegration } from '../middleware/requireWooCommerceIntegration'
import { woocommerceHttpRateLimiter } from '../middleware/routeRateLimit'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { WooCommerceCatalogService } from '../services/WooCommerceCatalogService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en WooCommerce catalog listing routes (#188).
 * @es Rutas de publicaciones de catálogo WooCommerce (#188).
 * @pt-BR Rotas de anúncios de catálogo WooCommerce (#188).
 */
export function registerWooCommerceCatalogRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const catalog = new WooCommerceCatalogService(prisma)
  const requireWc = requireWooCommerceIntegration(prisma)
  const ownership = verifyOwnership(prisma, 'articulo')

  app.get(
    '/api/articulos/:id/woocommerce',
    requirePermission('products.read'),
    requireWc,
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
    '/api/articulos/:id/woocommerce',
    woocommerceHttpRateLimiter,
    requirePermission('products.manage'),
    requireWc,
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
    '/api/articulos/:id/woocommerce',
    woocommerceHttpRateLimiter,
    requirePermission('products.manage'),
    requireWc,
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
