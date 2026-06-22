import type { NextFunction, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { PLAN_CATALOG, DEFAULT_PLAN_KEY, type TenantPlanSnapshot } from '../../web/src/lib/plans'
import type { AuthenticatedRequest } from '../auth'
import { TenantPlanService } from '../services/TenantPlanService'

function testPlanSnapshot(): TenantPlanSnapshot {
  const def = PLAN_CATALOG[DEFAULT_PLAN_KEY]
  return {
    planKey: def.key,
    planName: def.name,
    monthlyPrice: def.monthlyPrice,
    currency: def.currency,
    maxUsers: def.maxUsers,
    maxInvoicesPerMonth: def.maxInvoicesPerMonth,
    features: [...def.features],
    status: 'active',
    usage: { usersUsed: 0, invoicesUsed: 0 },
  }
}

/**
 * @en Loads tenant SaaS plan snapshot onto the request (#181).
 * @es Carga snapshot del plan SaaS del tenant en la request (#181).
 * @pt-BR Carrega snapshot do plano SaaS do tenant na request (#181).
 */
export function tenantPlan(prisma: PrismaClient) {
  const service = new TenantPlanService(prisma)
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const tenantId = req.tenantId ?? req.auth?.claims.tenantId
    if (typeof tenantId !== 'number' || tenantId <= 0 || !req.auth) {
      next()
      return
    }

    if (process.env.NODE_ENV === 'test' && process.env.BIZCODE_TEST_AUTH_BYPASS !== 'false') {
      req.tenantPlan = testPlanSnapshot()
      next()
      return
    }

    try {
      req.tenantPlan = await service.getSnapshotForTenant(tenantId)
    } catch {
      req.tenantPlan = testPlanSnapshot()
    }
    next()
  }
}
