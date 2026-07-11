import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { rowsToCsv, sendCsv, wantsCsv } from '../reportesContentNegotiation'
import { parseIsoDateParam } from '../reportesPeriodUtils'
import {
  reportesPeriodQuerySchema,
  reportesVentasQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type { ReporteCobranzasRow } from '../services/ReportesFinancierosService'
import type { ReporteVentasRow, StockCriticoRow } from '../services/ReportesOperacionalesService'
import { ReportesOperacionalesService } from '../services/ReportesOperacionalesService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

function ventasToCsv(rows: ReporteVentasRow[]): string {
  return rowsToCsv(
    ['periodo', 'count', 'total', 'neto1', 'neto2', 'iva1', 'iva2'],
    rows.map((r) => [r.periodo, r.count, r.total, r.neto1, r.neto2, r.iva1, r.iva2]),
  )
}

function stockCriticoToCsv(rows: StockCriticoRow[]): string {
  return rowsToCsv(
    ['codigo', 'descripcion', 'stock', 'minimo', 'deficit'],
    rows.map((r) => [
      r.articulo.codigo,
      r.articulo.descripcion,
      r.stock,
      r.minimo,
      r.deficit,
    ]),
  )
}

function cobranzasToCsv(rows: ReporteCobranzasRow[]): string {
  const flat: (string | number)[][] = []
  for (const day of rows) {
    if (day.porFormaPago.length === 0) {
      flat.push([day.fecha, day.count, day.total, '', '', ''])
      continue
    }
    for (const fp of day.porFormaPago) {
      flat.push([
        day.fecha,
        day.count,
        day.total,
        fp.formaPagoId ?? '',
        fp.descripcion,
        fp.total,
      ])
    }
  }
  return rowsToCsv(
    ['fecha', 'count', 'total', 'formaPagoId', 'formaPagoDescripcion', 'formaPagoTotal'],
    flat,
  )
}

/**
 * @en Financial and operational report REST routes (`/api/reportes/*`).
 * @es Rutas REST de reportes financieros y operativos (`/api/reportes/*`).
 * @pt-BR Rotas REST de relatórios financeiros e operacionais (`/api/reportes/*`).
 */
export function registerReportesRoutes(app: Application, ctx: RestRouteContext): void {
  const { services } = ctx
  const { reportes, reportesOperacionales } = services

  app.get(
    '/api/reportes/aging',
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await reportes.getAgingAr(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/reportes/cuenta-corriente/:clienteId',
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }

      const clienteId = parsePositiveIntParam(String(req.params.clienteId))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'clienteId must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const data = await reportes.getCuentaCorriente(tenantId, clienteId)
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/reportes/ventas',
    requirePermission('reports.operational.read'),
    async (req: Request, res: Response) => {
      const parsed = safeParseBodySchema(reportesVentasQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }
      const fromDate = parseIsoDateParam(parsed.value.from)
      const toDate = parseIsoDateParam(parsed.value.to)
      if (!fromDate || !toDate) {
        res.status(400).json({ success: false, error: 'Invalid from or to date' })
        return
      }
      const { from, to } = ReportesOperacionalesService.buildDateRange(fromDate, toDate)

      try {
        const tenantId = getTenantId(req)
        const data = await reportesOperacionales.getVentasPorPeriodo(
          tenantId,
          from,
          to,
          parsed.value.agrupar,
        )
        if (wantsCsv(req)) {
          sendCsv(res, 'reportes-ventas.csv', ventasToCsv(data))
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/reportes/stock-critico',
    requirePermission('reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await reportesOperacionales.getStockCritico(tenantId)
        if (wantsCsv(req)) {
          sendCsv(res, 'reportes-stock-critico.csv', stockCriticoToCsv(data))
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/reportes/ventas-por-tipo',
    requirePermission('reports.operational.read'),
    async (req: Request, res: Response) => {
      const parsed = safeParseBodySchema(reportesPeriodQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }
      const fromDate = parseIsoDateParam(parsed.value.from)
      const toDate = parseIsoDateParam(parsed.value.to)
      if (!fromDate || !toDate) {
        res.status(400).json({ success: false, error: 'Invalid from or to date' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await reportesOperacionales.getVentasPorTipo(tenantId, fromDate, toDate)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/reportes/cobranzas',
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const parsed = safeParseBodySchema(reportesPeriodQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }
      const fromDate = parseIsoDateParam(parsed.value.from)
      const toDate = parseIsoDateParam(parsed.value.to)
      if (!fromDate || !toDate) {
        res.status(400).json({ success: false, error: 'Invalid from or to date' })
        return
      }
      const { from, to } = ReportesOperacionalesService.buildDateRange(fromDate, toDate)

      try {
        const tenantId = getTenantId(req)
        const data = await reportes.getCobranzasPorPeriodo(tenantId, from, to)
        if (wantsCsv(req)) {
          sendCsv(res, 'reportes-cobranzas.csv', cobranzasToCsv(data))
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
