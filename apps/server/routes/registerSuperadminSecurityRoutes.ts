import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { requirePermission, requireSuperAdmin } from '../auth'
import { SecurityEventsService } from '../services/SecurityEventsService'

/**
 * @en Super-admin security events timeline API (#221).
 * @es API de timeline de eventos de seguridad para super_admin (#221).
 * @pt-BR API de timeline de eventos de segurança para super_admin (#221).
 */
export function registerSuperadminSecurityRoutes(app: Application, prisma: PrismaClient): void {
  const service = new SecurityEventsService(prisma)
  const guard = [requireSuperAdmin(), requirePermission('platform.tenants.manage')]

  app.get('/api/superadmin/security-events', ...guard, async (req: Request, res: Response) => {
    const hoursRaw = typeof req.query.hours === 'string' ? Number.parseInt(req.query.hours, 10) : NaN
    const limitRaw = typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : NaN
    const offsetRaw = typeof req.query.offset === 'string' ? Number.parseInt(req.query.offset, 10) : NaN
    const severity =
      typeof req.query.severity === 'string' && req.query.severity.trim() !== ''
        ? req.query.severity.trim()
        : undefined

    const result = await service.listRecent({
      hours: Number.isFinite(hoursRaw) ? hoursRaw : undefined,
      limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
      offset: Number.isFinite(offsetRaw) ? offsetRaw : undefined,
      severity,
    })
    res.json({ success: true, data: result.data, total: result.total })
  })
}
