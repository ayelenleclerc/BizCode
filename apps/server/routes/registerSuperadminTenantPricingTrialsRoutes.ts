import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { requirePermission, requireSuperAdmin, type AuthenticatedRequest } from '../auth'
import { parseModulesQuery, TenantPricingService } from '../services/TenantPricingService'
import { TenantTrialService } from '../services/TenantTrialService'

function parseTenantIdParam(raw: string): number | null {
  const id = parseInt(raw, 10)
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }
  return id
}

/**
 * @en Super-admin tenant pricing estimate and module trials API (#226).
 * @es API de precio estimado y trials de módulos por tenant para super-admin (#226).
 * @pt-BR API de preço estimado e trials de módulos por tenant para super-admin (#226).
 */
export function registerSuperadminTenantPricingTrialsRoutes(
  app: Application,
  prisma: PrismaClient,
): void {
  const pricingService = new TenantPricingService(prisma)
  const trialService = new TenantTrialService(prisma)
  const guard = [requireSuperAdmin(), requirePermission('platform.tenants.manage')]

  app.get(
    '/api/superadmin/tenants/:tenantId/pricing',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }

      const modulesParam =
        typeof req.query.modules === 'string' ? req.query.modules : undefined
      const previewModules = parseModulesQuery(modulesParam)
      if (previewModules === null) {
        res.status(400).json({ success: false, error: 'Invalid modules query' })
        return
      }

      const data = await pricingService.getPricing(tenantId, previewModules)
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.get(
    '/api/superadmin/tenants/:tenantId/trials',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
      if (!tenant) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      const data = await trialService.listActiveTrials(tenantId)
      res.json({ success: true, data })
    },
  )

  app.post(
    '/api/superadmin/tenants/:tenantId/trials',
    ...guard,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const body = (req.body ?? {}) as Record<string, unknown>
      const moduleKey = typeof body.moduleKey === 'string' ? body.moduleKey.trim() : ''
      const days =
        typeof body.days === 'number'
          ? body.days
          : typeof body.days === 'string'
            ? parseInt(body.days, 10)
            : 30
      const reason =
        typeof body.reason === 'string' && body.reason.trim()
          ? body.reason.trim()
          : `module_trial_activate:${moduleKey}`

      if (!moduleKey) {
        res.status(400).json({ success: false, error: 'moduleKey is required' })
        return
      }

      try {
        const data = await trialService.activateTrial(
          tenantId,
          moduleKey,
          days,
          authReq.auth!.claims.userId,
          reason,
        )
        res.status(201).json({ success: true, data })
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'tenant_not_found') {
            res.status(404).json({ success: false, error: e.message })
            return
          }
          if (e.message === 'invalid_module_key' || e.message === 'invalid_trial_days') {
            res.status(400).json({ success: false, error: e.message })
            return
          }
          if (e.message === 'invalid_module_set') {
            const validation = (e as Error & { validation?: unknown }).validation
            res.status(400).json({ success: false, error: 'invalid_module_set', validation })
            return
          }
        }
        throw e
      }
    },
  )

  app.delete(
    '/api/superadmin/tenants/:tenantId/trials/:moduleKey',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const moduleKey = String(req.params.moduleKey ?? '').trim()
      if (!moduleKey) {
        res.status(400).json({ success: false, error: 'moduleKey is required' })
        return
      }

      try {
        const data = await trialService.deactivateTrial(tenantId, moduleKey)
        if (!data) {
          res.status(404).json({ success: false, error: 'Trial not found' })
          return
        }
        res.json({ success: true, data })
      } catch (e) {
        if (e instanceof Error && e.message === 'invalid_module_key') {
          res.status(400).json({ success: false, error: e.message })
          return
        }
        throw e
      }
    },
  )
}
