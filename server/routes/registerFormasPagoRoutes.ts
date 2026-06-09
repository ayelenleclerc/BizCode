import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage } from './restDomainShared'

/**
 * @en Payment method lookup for sales flows.
 */
export function registerFormasPagoRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx

  app.get('/api/formas-pago', requirePermission('sales.create'), async (_req: Request, res: Response) => {
    try {
      const formas = await prisma.formaPago.findMany({
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: formas })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
}
