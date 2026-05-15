import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

/**
 * @en Financial report REST routes (`/api/reportes/*`).
 * @es Rutas REST de reportes financieros (`/api/reportes/*`).
 * @pt-BR Rotas REST de relatórios financeiros (`/api/reportes/*`).
 */
export function registerReportesRoutes(app: Application, ctx: RestRouteContext): void {
  const { services } = ctx
  const { reportes } = services

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
}
