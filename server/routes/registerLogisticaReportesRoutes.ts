import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { rowsToCsv, sendCsv, wantsCsv } from '../reportesContentNegotiation'
import { parseIsoDateParam } from '../reportesPeriodUtils'
import { logisticaReportesQuerySchema, safeParseBodySchema } from '../schemas/domain'
import type {
  LogisticaChoferRow,
  LogisticaReportesService,
  LogisticaZonaRow,
} from '../services/LogisticaReportesService'
import { LogisticaReportesService as LogisticaReportesServiceClass } from '../services/LogisticaReportesService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function choferesToCsv(rows: LogisticaChoferRow[]): string {
  return rowsToCsv(
    ['choferId', 'choferUsername', 'day', 'dispatched', 'delivered', 'notDelivered'],
    rows.map((r) => [r.choferId, r.choferUsername, r.day, r.dispatched, r.delivered, r.notDelivered]),
  )
}

function zonasToCsv(rows: LogisticaZonaRow[]): string {
  return rowsToCsv(
    ['zonaId', 'zonaNombre', 'dispatched', 'delivered', 'notDelivered'],
    rows.map((r) => [r.zonaId ?? '', r.zonaNombre, r.dispatched, r.delivered, r.notDelivered]),
  )
}

function parsePeriod(
  req: Request,
  res: Response,
): { from: Date; to: Date; choferId?: number } | null {
  const parsed = safeParseBodySchema(logisticaReportesQuerySchema, req.query)
  if (!parsed.ok) {
    res.status(400).json({ success: false, error: parsed.error })
    return null
  }
  const fromDate = parseIsoDateParam(parsed.value.from)
  const toDate = parseIsoDateParam(parsed.value.to)
  if (!fromDate || !toDate) {
    res.status(400).json({ success: false, error: 'Invalid from or to date' })
    return null
  }
  const { from, to } = LogisticaReportesServiceClass.buildDateRange(fromDate, toDate)
  return { from, to, choferId: parsed.value.choferId }
}

/**
 * @en Logistics KPI and report routes (`/api/logistica/*`, #145).
 * @es Rutas de KPIs y reportes logísticos (`/api/logistica/*`, #145).
 * @pt-BR Rotas de KPIs e relatórios logísticos (`/api/logistica/*`, #145).
 */
export function registerLogisticaReportesRoutes(app: Application, ctx: RestRouteContext): void {
  const dispatchesModule = requireModule('logistics.dispatches')
  const logisticaReportes: LogisticaReportesService = ctx.services.logisticaReportes

  app.get(
    '/api/logistica/kpis',
    requirePermission('logistics.read'),
    dispatchesModule,
    async (req: Request, res: Response) => {
      const period = parsePeriod(req, res)
      if (!period) return
      try {
        const tenantId = getTenantId(req)
        const data = await logisticaReportes.getKpis({
          tenantId,
          from: period.from,
          to: period.to,
          choferId: period.choferId,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/logistica/reporte-choferes',
    requirePermission('logistics.read'),
    dispatchesModule,
    async (req: Request, res: Response) => {
      const period = parsePeriod(req, res)
      if (!period) return
      try {
        const tenantId = getTenantId(req)
        const data = await logisticaReportes.getReporteChoferes({
          tenantId,
          from: period.from,
          to: period.to,
          choferId: period.choferId,
        })
        if (wantsCsv(req)) {
          sendCsv(res, 'logistica-choferes.csv', choferesToCsv(data))
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/logistica/reporte-zonas',
    requirePermission('logistics.read'),
    dispatchesModule,
    async (req: Request, res: Response) => {
      const period = parsePeriod(req, res)
      if (!period) return
      try {
        const tenantId = getTenantId(req)
        const data = await logisticaReportes.getReporteZonas({
          tenantId,
          from: period.from,
          to: period.to,
        })
        if (wantsCsv(req)) {
          sendCsv(res, 'logistica-zonas.csv', zonasToCsv(data))
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
