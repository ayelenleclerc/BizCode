import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { requirePermission, requireSuperAdmin, type AuthenticatedRequest } from '../auth'
import { TenantPlanService } from '../services/TenantPlanService'
import type { RestRouteContext } from './restRouteTypes'

function parseTenantId(raw: string): number | null {
  const id = parseInt(raw, 10)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * @en SuperAdmin tenant plan changes (#181).
 * @es Cambio de plan SaaS por tenant desde SuperAdmin (#181).
 * @pt-BR Alteração de plano SaaS por tenant via SuperAdmin (#181).
 */
export function registerSuperadminTenantPlanRoutes(
  app: Application,
  prisma: PrismaClient,
  ctx: Pick<RestRouteContext, 'writeAudit'>,
): void {
  const service = new TenantPlanService(prisma)
  const guard = [requireSuperAdmin(), requirePermission('platform.tenants.manage')]

  app.post(
    '/api/superadmin/tenants/:tenantId/plan',
    ...guard,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const tenantId = parseTenantId(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'invalid_tenant_id' })
        return
      }

      const body = (req.body ?? {}) as Record<string, unknown>
      const planKey = typeof body.planKey === 'string' ? body.planKey.trim() : ''
      const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
      if (!planKey) {
        res.status(400).json({ success: false, error: 'planKey is required' })
        return
      }
      if (!reason) {
        res.status(400).json({ success: false, error: 'reason is required' })
        return
      }

      try {
        const data = await service.changeTenantPlan(
          tenantId,
          planKey,
          authReq.auth!.claims.userId,
          reason,
        )
        await ctx.writeAudit(authReq, 'tenant_plan_change', 'tenant_plan', String(tenantId), {
          planKey: data.planKey,
          reason,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'invalid_plan') {
          res.status(400).json({ success: false, error: 'invalid_plan' })
          return
        }
        res.status(500).json({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    },
  )
}
