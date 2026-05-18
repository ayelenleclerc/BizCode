import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { CobranzasService } from '../services/CobranzasService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const recordatorioBodySchema = z.object({
  facturaId: z.number().int().min(1),
  canal: z.string().min(1).max(20).optional(),
})

/**
 * @en Collections overdue list and reminders (#134).
 */
export function registerCobranzasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const cobranzas = new CobranzasService(prisma)

  app.get(
    '/api/cobranzas/vencidas',
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await cobranzas.listVencidas(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/cobranzas/recordatorios',
    requirePermission('reports.financial.read'),
    validateBody(recordatorioBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as { facturaId: number; canal?: string }
        const canal = body.canal ?? 'email'
        const result = await cobranzas.sendReminder(tenantId, body.facturaId, canal)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'cobranza_recordatorio_send',
          'factura',
          String(body.facturaId),
          { canal },
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
