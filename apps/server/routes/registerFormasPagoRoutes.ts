import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { formaPagoPatchBodySchema } from '../schemas/domain'
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

  app.patch(
    '/api/formas-pago/:id',
    requirePermission('sales.create'),
    validateBody(formaPagoPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const existing = await prisma.formaPago.findUnique({ where: { id } })
        if (!existing) {
          res.status(404).json({ success: false, error: 'FormaPago not found' })
          return
        }
        const updated = await prisma.formaPago.update({
          where: { id },
          data: { esEfectivo: Boolean(req.body.esEfectivo) },
        })
        res.json({ success: true, data: updated })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
