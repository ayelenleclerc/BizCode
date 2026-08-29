import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { MODULE_PRESET_KEYS, MODULE_KEYS, type ModuleKey, type ModulePresetKey } from '@bizcode/types'
import { requirePermission, requireSuperAdmin, type AuthenticatedRequest } from '../auth'
import { TenantConfigService } from '../services/TenantConfigService'

function parseTenantIdParam(raw: string): number | null {
  const id = parseInt(raw, 10)
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }
  return id
}

function parseModulesBody(raw: unknown): ModuleKey[] | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const keys: ModuleKey[] = []
  for (const entry of raw) {
    if (typeof entry !== 'string' || !(MODULE_KEYS as readonly string[]).includes(entry)) {
      return null
    }
    keys.push(entry as ModuleKey)
  }
  return keys
}

/**
 * @en Super-admin tenant module configuration API (#223).
 * @es API de configuración de módulos por tenant para super-admin (#223).
 * @pt-BR API de configuração de módulos por tenant para super-admin (#223).
 */
export function registerSuperadminTenantConfigRoutes(
  app: Application,
  prisma: PrismaClient,
): void {
  const service = new TenantConfigService(prisma)
  const guard = [requireSuperAdmin(), requirePermission('platform.tenants.manage')]

  app.get(
    '/api/superadmin/tenants/:tenantId/config',
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
      let config = await service.getConfig(tenantId)
      if (!config) {
        config = await service.createDefaultForTenant(tenantId)
      }
      res.json({ success: true, data: config })
    },
  )

  app.put(
    '/api/superadmin/tenants/:tenantId/config',
    ...guard,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const body = (req.body ?? {}) as Record<string, unknown>
      const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
      if (!reason) {
        res.status(400).json({ success: false, error: 'reason is required' })
        return
      }
      const modules = parseModulesBody(body.modules)
      if (!modules) {
        res.status(400).json({ success: false, error: 'Invalid modules array' })
        return
      }
      try {
        const data = await service.upsertConfig(
          tenantId,
          {
            businessType: typeof body.businessType === 'string' ? body.businessType : undefined,
            rubros: Array.isArray(body.rubros)
              ? body.rubros.filter((r): r is string => typeof r === 'string')
              : undefined,
            plan: typeof body.plan === 'string' ? body.plan : undefined,
            modules,
            integrations: Array.isArray(body.integrations)
              ? body.integrations.filter((r): r is string => typeof r === 'string')
              : undefined,
            jurisdiccionFiscal:
              typeof body.jurisdiccionFiscal === 'string' ? body.jurisdiccionFiscal : undefined,
          },
          authReq.auth!.claims.userId,
          reason,
        )
        res.json({ success: true, data })
      } catch (e) {
        if (e instanceof Error && e.message === 'invalid_module_set') {
          const validation = (e as Error & { validation?: unknown }).validation
          res.status(400).json({ success: false, error: 'invalid_module_set', validation })
          return
        }
        if (
          e instanceof Error &&
          (e.message === 'invalid_business_type' ||
            e.message === 'invalid_plan' ||
            e.message === 'invalid_jurisdiction')
        ) {
          res.status(400).json({ success: false, error: e.message })
          return
        }
        throw e
      }
    },
  )

  app.get(
    '/api/superadmin/tenants/:tenantId/config/history',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const take = Math.min(parseInt(String(req.query.take ?? '20'), 10) || 20, 100)
      const skip = parseInt(String(req.query.skip ?? '0'), 10) || 0
      const data = await service.listHistory(tenantId, take, skip)
      res.json({ success: true, data })
    },
  )

  app.post(
    '/api/superadmin/tenants/:tenantId/config/apply-template',
    ...guard,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const body = (req.body ?? {}) as Record<string, unknown>
      const preset = typeof body.preset === 'string' ? body.preset.trim() : ''
      if (!(MODULE_PRESET_KEYS as readonly string[]).includes(preset)) {
        res.status(400).json({ success: false, error: 'Invalid preset' })
        return
      }
      const reason =
        typeof body.reason === 'string' && body.reason.trim()
          ? body.reason.trim()
          : `apply_template:${preset}`
      try {
        const data = await service.applyPreset(
          tenantId,
          preset as ModulePresetKey,
          authReq.auth!.claims.userId,
          reason,
        )
        res.json({ success: true, data })
      } catch (e) {
        if (e instanceof Error && e.message === 'invalid_module_set') {
          const validation = (e as Error & { validation?: unknown }).validation
          res.status(400).json({ success: false, error: 'invalid_module_set', validation })
          return
        }
        throw e
      }
    },
  )
}
