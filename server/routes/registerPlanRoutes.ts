import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import { TenantPlanService } from '../services/TenantPlanService'

/**
 * @en Public plan catalog and authenticated tenant plan snapshot (#181).
 * @es Catálogo público de planes y snapshot del plan del tenant autenticado (#181).
 * @pt-BR Catálogo público de planos e snapshot do plano do tenant autenticado (#181).
 */
export function registerPlanRoutes(app: Application, prisma: PrismaClient): void {
  const service = new TenantPlanService(prisma)

  app.get('/api/planes', async (_req: Request, res: Response) => {
    try {
      const plans = await service.listPublicPlans()
      res.json({ success: true, data: plans })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.get('/api/me/plan', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
    try {
      const data = authReq.tenantPlan ?? (await service.getSnapshotForTenant(tenantId))
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}
