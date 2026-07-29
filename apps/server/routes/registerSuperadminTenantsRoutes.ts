import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import {
  requirePermission,
  requireSuperAdmin,
  type AuthenticatedRequest,
} from '../auth'
import { SuperadminTenantService } from '../services/SuperadminTenantService'
import { paginatedListJson } from '../services/listPagination'

function parseTenantIdParam(raw: string): number | null {
  const id = parseInt(raw, 10)
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }
  return id
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function parseOptionalIsoDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed) : undefined
}

function actorFromReq(req: Request): { userId: number; ipAddress: string | null } {
  const authReq = req as AuthenticatedRequest
  return {
    userId: authReq.auth?.claims.userId ?? 0,
    ipAddress: typeof req.ip === 'string' ? req.ip : null,
  }
}

/**
 * @en Super-admin tenant CRUD, platform stats, and incident-response tools (#137, #222).
 * @es API CRUD de tenants, estadísticas y herramientas de respuesta a incidentes (#137, #222).
 * @pt-BR API CRUD de tenants, estatísticas e ferramentas de resposta a incidentes (#137, #222).
 */
export function registerSuperadminTenantsRoutes(app: Application, prisma: PrismaClient): void {
  const service = new SuperadminTenantService(prisma)
  const guard = [requireSuperAdmin(), requirePermission('platform.tenants.manage')]

  app.get('/api/superadmin/stats', ...guard, async (_req: Request, res: Response) => {
    const data = await service.getGlobalStats()
    res.json({ success: true, data })
  })

  app.get('/api/superadmin/tenants', ...guard, async (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const data = await service.listTenants(q)
    res.json({ success: true, data })
  })

  app.get(
    '/api/superadmin/tenants/:tenantId',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const data = await service.getTenantDetail(tenantId)
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.post('/api/superadmin/tenants', ...guard, async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    if (!isNonEmptyString(body.name) || !isNonEmptyString(body.slug)) {
      res.status(400).json({ success: false, error: 'name and slug are required' })
      return
    }

    const name = body.name.trim()
    const slug = body.slug.trim().toLowerCase()
    const plan = typeof body.plan === 'string' ? body.plan.trim() : undefined
    const ownerUsername =
      typeof body.ownerUsername === 'string' ? body.ownerUsername.trim().toLowerCase() : undefined
    const ownerPassword = typeof body.ownerPassword === 'string' ? body.ownerPassword : undefined

    if ((ownerUsername && !ownerPassword) || (!ownerUsername && ownerPassword)) {
      res.status(400).json({
        success: false,
        error: 'ownerUsername and ownerPassword must be provided together',
      })
      return
    }

    if (await service.slugExists(slug)) {
      res.status(409).json({ success: false, error: 'Tenant slug already exists' })
      return
    }

    const data = await service.createTenant({
      name,
      slug,
      plan,
      ownerUsername,
      ownerPassword,
    })
    res.status(201).json({ success: true, data })
  })

  app.patch(
    '/api/superadmin/tenants/:tenantId',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const body = (req.body ?? {}) as Record<string, unknown>
      if (typeof body.active !== 'boolean') {
        res.status(400).json({ success: false, error: 'active (boolean) is required' })
        return
      }
      const data = await service.patchTenantActive(tenantId, body.active)
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.post(
    '/api/superadmin/tenants/:tenantId/revoke-all-sessions',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const data = await service.revokeAllSessions(tenantId, actorFromReq(req))
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.post(
    '/api/superadmin/tenants/:tenantId/disable',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const data = await service.disableTenant(tenantId, actorFromReq(req))
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.post(
    '/api/superadmin/tenants/:tenantId/maintenance',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const body = (req.body ?? {}) as Record<string, unknown>
      if (typeof body.enabled !== 'boolean') {
        res.status(400).json({ success: false, error: 'enabled (boolean) is required' })
        return
      }
      const data = await service.setMaintenanceMode(tenantId, body.enabled, actorFromReq(req))
      if (!data) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json({ success: true, data })
    },
  )

  app.get(
    '/api/superadmin/tenants/:tenantId/audit-events',
    ...guard,
    async (req: Request, res: Response) => {
      const tenantId = parseTenantIdParam(String(req.params.tenantId))
      if (tenantId === null) {
        res.status(400).json({ success: false, error: 'Invalid tenant id' })
        return
      }
      const lq = req.query.limit
      const oq = req.query.offset
      const limitRaw = typeof lq === 'string' ? Number.parseInt(lq, 10) : Number.NaN
      const offsetRaw = typeof oq === 'string' ? Number.parseInt(oq, 10) : Number.NaN
      const take =
        Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, 1000) : 100
      const skip = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0
      const result = await service.listAuditEvents(tenantId, {
        startDate: parseOptionalIsoDate(req.query.startDate),
        endDate: parseOptionalIsoDate(req.query.endDate),
        take,
        skip,
      })
      if (!result) {
        res.status(404).json({ success: false, error: 'Tenant not found' })
        return
      }
      res.json(paginatedListJson(result.events, result.total, take, skip))
    },
  )
}
