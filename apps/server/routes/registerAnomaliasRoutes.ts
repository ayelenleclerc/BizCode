import type { Application, Request, Response } from 'express'
import type { ConfigAnomaliaFacturaUpsertInput } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { configAnomaliaFacturaUpsertBodySchema } from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en Billing anomaly threshold config REST (#200 residual).
 * @es REST de umbrales de anomalía de facturación (#200 residual).
 * @pt-BR REST de limiares de anomalia de faturamento (#200 residual).
 */
export function registerAnomaliasRoutes(app: Application, ctx: RestRouteContext): void {
  const { facturaAnomaly } = ctx.services
  const managePermission = requirePermission('settings.business.manage')

  app.get('/api/anomalias/config', managePermission, async (req: Request, res: Response) => {
    try {
      const data = await facturaAnomaly.getConfig(getTenantId(req))
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put(
    '/api/anomalias/config',
    managePermission,
    validateBody(configAnomaliaFacturaUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await facturaAnomaly.upsertConfig(
          getTenantId(req),
          req.body as ConfigAnomaliaFacturaUpsertInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'anomalia_config_update',
          'config_anomalia_factura',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
