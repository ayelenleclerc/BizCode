import type { Application, Request, Response } from 'express'
import type { AnomaliaDetectadaListFilters, ConfigAnomaliaFacturaUpsertInput } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { configAnomaliaFacturaUpsertBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function parseAnomaliaListFilters(req: Request): AnomaliaDetectadaListFilters {
  const tipoRaw = req.query.tipo
  const confirmadaRaw = req.query.confirmada
  const clienteRaw = req.query.clienteId
  const facturaRaw = req.query.facturaId
  const clienteId = typeof clienteRaw === 'string' ? Number.parseInt(clienteRaw, 10) : Number.NaN
  const facturaId = typeof facturaRaw === 'string' ? Number.parseInt(facturaRaw, 10) : Number.NaN
  let confirmada: boolean | undefined
  if (confirmadaRaw === 'true' || confirmadaRaw === '1') confirmada = true
  else if (confirmadaRaw === 'false' || confirmadaRaw === '0') confirmada = false
  return {
    ...(typeof tipoRaw === 'string' && tipoRaw.trim() ? { tipo: tipoRaw.trim() } : {}),
    ...(confirmada != null ? { confirmada } : {}),
    ...(Number.isFinite(clienteId) && clienteId >= 1 ? { clienteId } : {}),
    ...(Number.isFinite(facturaId) && facturaId >= 1 ? { facturaId } : {}),
  }
}

/**
 * @en Billing anomaly config + list REST (#200).
 * @es REST de config + listado de anomalías de facturación (#200).
 * @pt-BR REST de config + listagem de anomalias de faturamento (#200).
 */
export function registerAnomaliasRoutes(app: Application, ctx: RestRouteContext): void {
  const { facturaAnomaly } = ctx.services
  const managePermission = requirePermission('settings.business.manage')
  const auditPermission = requirePermission('audit.read')

  app.get('/api/anomalias', auditPermission, async (req: Request, res: Response) => {
    try {
      const { take, skip } = parseListPagination(req)
      const filters = parseAnomaliaListFilters(req)
      const { rows, total } = await facturaAnomaly.list(getTenantId(req), filters, take, skip)
      res.json(paginatedListJson(rows, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

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
