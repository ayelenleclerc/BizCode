import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { requirePermission, type AuthenticatedRequest } from './auth'
import { wantsCsv, sendCsv } from './reportesContentNegotiation'
import { endOfDay, parseIsoDateParam } from './reportesPeriodUtils'
import { dashboardVentasHistoricoQuerySchema, safeParseBodySchema } from './schemas/domain'
import {
  DashboardAnalyticsService,
  dashboardVentasSeriesToCsv,
} from './services/DashboardAnalyticsService'
import { computeDaysPastDue } from './services/ReportesFinancierosService'

/**
 * @en Dashboard summary shape returned by GET /api/dashboard/summary.
 * @es Forma del resumen del dashboard retornado por GET /api/dashboard/summary.
 * @pt-BR Formato do resumo do dashboard retornado por GET /api/dashboard/summary.
 */
export type DashboardSummary = {
  /** Invoices issued today (estado = "A"). */
  ventasHoy: { count: number; total: string }
  /** Active invoices past due per customer creditDays. */
  facturasVencidas: { count: number; total: string }
  /** Customer payments registered today. */
  cobrosHoy: { count: number; total: string }
  /** Active unread alerts — placeholder until Notification model is ready (Issue #30). */
  alertasActivas: number
}

/**
 * @en Registers dashboard routes: summary and historical sales analytics (#138).
 * @es Registra rutas del dashboard: resumen y analítica histórica de ventas (#138).
 * @pt-BR Registra rotas do dashboard: resumo e análise histórica de vendas (#138).
 */
export function registerDashboardRoutes(app: Application, prisma: PrismaClient): void {
  const analytics = new DashboardAnalyticsService(prisma)

  app.get('/api/dashboard/summary', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      const tenantId = authReq.auth.claims.tenantId

      const [ventasResult, openInvoices, cobrosResult] = await Promise.all([
        prisma.factura.aggregate({
          where: { tenantId, estado: 'A', fecha: { gte: todayStart, lte: todayEnd } },
          _count: { id: true },
          _sum: { total: true },
        }),
        prisma.factura.findMany({
          where: { tenantId, estado: 'A' },
          select: {
            total: true,
            fecha: true,
            cliente: { select: { creditDays: true } },
          },
        }),
        prisma.cobro.aggregate({
          where: { tenantId, fecha: { gte: todayStart, lte: todayEnd } },
          _count: { id: true },
          _sum: { monto: true },
        }),
      ])

      let vencidasCount = 0
      let vencidasTotal = 0
      for (const inv of openInvoices) {
        if (computeDaysPastDue(inv.fecha, inv.cliente.creditDays, now) > 0) {
          vencidasCount += 1
          vencidasTotal += inv.total.toNumber()
        }
      }

      const summary: DashboardSummary = {
        ventasHoy: {
          count: ventasResult._count.id,
          total: ventasResult._sum.total?.toString() ?? '0',
        },
        facturasVencidas: {
          count: vencidasCount,
          total: vencidasTotal.toFixed(2),
        },
        cobrosHoy: {
          count: cobrosResult._count.id,
          total: cobrosResult._sum.monto?.toString() ?? '0',
        },
        alertasActivas: 0,
      }

      res.json({ success: true, data: summary })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.get(
    '/api/dashboard/ventas-historico',
    requirePermission('reports.operational.read'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }

      const parsed = safeParseBodySchema(dashboardVentasHistoricoQuerySchema, req.query)
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
        const tenantId = authReq.auth.claims.tenantId
        const data = await analytics.getVentasHistorico({
          tenantId,
          from: fromDate,
          to: endOfDay(toDate),
          groupBy: parsed.value.groupBy,
          vendedorId: parsed.value.vendedorId,
          deliveryZoneId: parsed.value.deliveryZoneId,
        })

        if (wantsCsv(req)) {
          sendCsv(res, 'dashboard-ventas-historico.csv', dashboardVentasSeriesToCsv(data.series))
          return
        }

        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    },
  )
}
