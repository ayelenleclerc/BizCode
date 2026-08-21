import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { saasRegisterHttpRateLimiter } from '../middleware/routeRateLimit'
import { saasRegisterBodySchema } from '../schemas/saasRegister'
import { SaasOnboardingService } from '../saas/SaasOnboardingService'
import { SaasTrialService } from '../saas/SaasTrialService'
import { suggestTenantSlug } from '../saas/tenantSlug'

/**
 * @en Public SaaS registration + authenticated trial status (#180).
 * @es Registro SaaS público + estado de trial autenticado (#180).
 * @pt-BR Registro SaaS público + status de trial autenticado (#180).
 */
export function registerSaasRoutes(app: Application, prisma: PrismaClient): void {
  const onboarding = new SaasOnboardingService(prisma)
  const trial = new SaasTrialService(prisma)

  app.get('/api/saas/slug-suggestion', (req: Request, res: Response) => {
    const name = typeof req.query.name === 'string' ? req.query.name : ''
    res.json({ success: true, data: { slug: suggestTenantSlug(name) } })
  })

  app.post(
    '/api/saas/register',
    saasRegisterHttpRateLimiter,
    validateBody(saasRegisterBodySchema),
    async (req: Request, res: Response) => {
      const result = await onboarding.register(req.body)
      if (!result.ok) {
        res.status(result.status).json({
          success: false,
          error: result.error,
          code: result.code,
        })
        return
      }
      res.status(201).json({ success: true, data: result.data })
    },
  )

  app.get('/api/saas/trial', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    try {
      const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
      const snap = await trial.ensureAndGetSnapshot(tenantId)
      if (!snap) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({
        success: true,
        data: {
          saasStatus: snap.saasStatus,
          trialEndsAt: snap.trialEndsAt?.toISOString() ?? null,
          daysRemaining: snap.daysRemaining,
          invoiceMutationsBlocked: snap.invoiceMutationsBlocked,
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      res.status(500).json({ success: false, error: message })
    }
  })
}
