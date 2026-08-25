import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { z } from 'zod'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const ordenCompraSugeridaBodySchema = z
  .object({
    proveedorId: z.number().int().positive(),
    articuloIds: z.array(z.number().int().positive()).min(1).max(100),
    horizonDays: z.number().int().positive().max(90).optional(),
    create: z.boolean().optional(),
  })
  .strict()

/**
 * @en Replenishment / demand forecast routes (#198 Fase 1).
 * @es Rutas de reposición / predicción de demanda (#198 Fase 1).
 * @pt-BR Rotas de reposição / previsão de demanda (#198 Fase 1).
 */
export function registerReplenishmentRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { replenishmentForecast, compras } = services
  const articuloOwnership = verifyOwnership(prisma, 'articulo')
  const purchasesModule = requireModule('logistics.purchases')

  app.get(
    '/api/catalogo/reposicion',
    requirePermission('products.read'),
    purchasesModule,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const horizonRaw = typeof req.query.horizonDays === 'string' ? parseInt(req.query.horizonDays, 10) : 30
        const horizonDays = Number.isFinite(horizonRaw) && horizonRaw > 0 ? Math.min(horizonRaw, 90) : 30
        const data = await replenishmentForecast.listReplenishment(tenantId, horizonDays)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/reposicion-forecast',
    requirePermission('products.read'),
    purchasesModule,
    articuloOwnership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const articuloId = parseInt(String(req.params.id), 10)
        const data = await replenishmentForecast.getArticuloForecast(tenantId, articuloId)
        if (!data) {
          res.status(404).json({ success: false, error: 'Articulo not found or not forecastable' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/catalogo/reposicion/orden-compra-sugerida',
    requirePermission('suppliers.manage'),
    purchasesModule,
    validateBody(ordenCompraSugeridaBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as z.infer<typeof ordenCompraSugeridaBodySchema>
        const horizonDays = body.horizonDays ?? 30
        const { lines, skipped } = await replenishmentForecast.buildSuggestedOcLines(
          tenantId,
          body.articuloIds,
          body.proveedorId,
          horizonDays,
        )
        if (lines.length === 0) {
          res.status(422).json({
            success: false,
            error: 'No suggested lines could be built',
            code: 'NO_SUGGESTED_LINES',
            skipped,
          })
          return
        }

        if (body.create === true) {
          const created = await compras.create(tenantId, {
            proveedorId: body.proveedorId,
            nota: 'OC sugerida por reposición (#198)',
            items: lines,
          })
          if (!created.ok) {
            res.status(created.status).json({ success: false, error: created.error })
            return
          }
          await writeAudit(
            req as AuthenticatedRequest,
            'compra.create',
            'OrdenCompra',
            String(created.data.id),
            { source: 'reposicion_forecast', skipped },
          )
          res.status(201).json({ success: true, data: { ordenCompra: created.data, skipped, lines } })
          return
        }

        res.json({
          success: true,
          data: {
            prefill: {
              proveedorId: body.proveedorId,
              lines: lines.map((l) => ({
                articuloId: l.articuloId,
                cantidad: l.cantidad,
                costoUnitario: String(l.costoUnitario),
              })),
            },
            skipped,
          },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
