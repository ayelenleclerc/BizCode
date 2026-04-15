import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { type AuthenticatedRequest } from './auth'

/**
 * @en Dashboard summary shape returned by GET /api/dashboard/summary.
 * @es Forma del resumen del dashboard retornado por GET /api/dashboard/summary.
 * @pt-BR Formato do resumo do dashboard retornado por GET /api/dashboard/summary.
 */
export type DashboardSummary = {
  /** Invoices issued today (estado = "A"). */
  ventasHoy: { count: number; total: string }
  /**
   * Overdue invoices: active invoices whose fecha < (today – 30 days).
   * Approximation until credit-term fields are available (Issue #31).
   */
  facturasVencidas: { count: number; total: string }
  /** Pending collections — placeholder until payment model is ready (Issue #31). */
  cobrosHoy: { count: number; total: string }
  /** Active unread alerts — placeholder until Notification model is ready (Issue #30). */
  alertasActivas: number
}

/**
 * @en Registers the dashboard summary route: GET /api/dashboard/summary.
 *     Accessible to all authenticated users (no specific permission required).
 *     Role-aware seller filtering deferred to Issue #31 (vendedorId field).
 * @es Registra la ruta del resumen del dashboard: GET /api/dashboard/summary.
 *     Accesible para todos los usuarios autenticados (sin permiso específico requerido).
 *     Filtro por vendedor diferido al Issue #31 (campo vendedorId).
 * @pt-BR Registra a rota do resumo do dashboard: GET /api/dashboard/summary.
 *     Acessível a todos os usuários autenticados (sem permissão específica necessária).
 *     Filtro por vendedor adiado para a Issue #31 (campo vendedorId).
 */
export function registerDashboardRoutes(app: Application, prisma: PrismaClient): void {
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

      // 30-day threshold for overdue approximation (real credit-term calculation in Issue #31)
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [ventasResult, vencidasResult] = await Promise.all([
        // Active invoices created today
        prisma.factura.aggregate({
          where: { estado: 'A', fecha: { gte: todayStart, lte: todayEnd } },
          _count: { id: true },
          _sum: { total: true },
        }),
        // Active invoices older than 30 days (overdue approximation)
        prisma.factura.aggregate({
          where: { estado: 'A', fecha: { lt: thirtyDaysAgo } },
          _count: { id: true },
          _sum: { total: true },
        }),
      ])

      const summary: DashboardSummary = {
        ventasHoy: {
          count: ventasResult._count.id,
          total: ventasResult._sum.total?.toString() ?? '0',
        },
        facturasVencidas: {
          count: vencidasResult._count.id,
          total: vencidasResult._sum.total?.toString() ?? '0',
        },
        // Placeholders — implemented in Issues #30 (notifications) and #31 (payments)
        cobrosHoy: { count: 0, total: '0' },
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
}
