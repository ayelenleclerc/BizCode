import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { getObservabilitySnapshot, isMetricsEnabled } from '../middleware/observability'

/**
 * @en Registers in-memory metrics endpoint (`/api/metrics`) for operational diagnostics.
 * @es Registra endpoint de métricas en memoria (`/api/metrics`) para diagnóstico operativo.
 * @pt-BR Registra endpoint de métricas em memória (`/api/metrics`) para diagnóstico operacional.
 */
export function registerMetricsRoute(app: Application): void {
  app.get('/api/metrics', requirePermission('audit.read'), (_req: Request, res: Response) => {
    if (!isMetricsEnabled()) {
      res.status(404).json({ success: false, error: 'Not found' })
      return
    }
    res.json({
      success: true,
      data: getObservabilitySnapshot(),
    })
  })
}
