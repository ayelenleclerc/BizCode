import type { NextFunction, Response } from 'express'
import type { PlanFeatureKey } from '@bizcode/types'
import { planIncludesFeature } from '@bizcode/types'
import type { AuthenticatedRequest } from '../auth'
import { planErrorBody } from '../services/TenantPlanService'

/**
 * @en Blocks the route when the tenant plan does not include the feature (#181).
 * @es Bloquea la ruta si el plan del tenant no incluye la feature (#181).
 * @pt-BR Bloqueia a rota quando o plano do tenant não inclui o recurso (#181).
 */
export function requirePlanFeature(featureKey: PlanFeatureKey) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const snapshot = req.tenantPlan
    if (!snapshot) {
      res.status(402).json({
        success: false,
        error: 'plan_feature_required',
        feature: featureKey,
        currentPlan: 'unknown',
      })
      return
    }
    if (!planIncludesFeature(snapshot.features, featureKey)) {
      res.status(402).json({
        success: false,
        error: 'plan_feature_required',
        feature: featureKey,
        currentPlan: snapshot.planKey,
      })
      return
    }
    next()
  }
}

export function sendPlanLimitError(
  res: Response,
  err: Error & { statusCode?: number; feature?: string; currentPlan?: string },
): void {
  const status = err.statusCode === 402 ? 402 : 402
  res.status(status).json(planErrorBody(err))
}
