import type { Application, Request, Response } from 'express'
import type { DespachanteInput } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { exportacionMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { despachanteNotificarBodySchema } from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en Export vertical REST endpoints (#206): Incoterms catalog and customs broker notification.
 * @es Endpoints REST del vertical exportación (#206): catálogo de Incoterms y aviso al despachante.
 * @pt-BR Endpoints REST do vertical exportação (#206): catálogo de Incoterms e aviso ao despachante.
 *
 * @en Local record only: no ANMAT/AFIP type E filing and no customs declaration is submitted.
 * @es Registro local únicamente: sin comprobante AFIP tipo E ni declaración aduanera.
 * @pt-BR Somente registro local: sem comprovante AFIP tipo E nem declaração aduaneira.
 */
export function registerExportacionRoutes(app: Application, ctx: RestRouteContext): void {
  const { exportacion } = ctx.services
  const exportModule = requireModule('vertical.export')
  const readPermission = requirePermission('products.read')
  const writePermission = requirePermission('orders.create')

  app.get(
    '/api/exportacion/incoterms',
    exportModule,
    readPermission,
    (_req: Request, res: Response) => {
      res.json({ success: true, data: exportacion.listIncoterms() })
    },
  )

  app.post(
    '/api/pedidos/:id/notificar-despachante',
    exportModule,
    writePermission,
    exportacionMutationHttpRateLimiter,
    validateBody(despachanteNotificarBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await exportacion.notifyDespachante(
          getTenantId(req),
          Number.parseInt(String(req.params.id), 10),
          req.body as DespachanteInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'pedido_notificar_despachante',
          'pedido',
          String(result.data.pedidoId),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
