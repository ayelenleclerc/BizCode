import type { Application, Request, Response } from 'express'
import type { Prisma, PrismaClient } from '@prisma/client'
import { requirePermission, type AuthenticatedRequest } from './auth'
import { paginatedListJson } from './services/listPagination'

const AUDIT_PAGE_DEFAULT = 50 as const
const AUDIT_PAGE_MAX = 500 as const

function parseAuditPagination(req: Request): { take: number; skip: number } {
  const lq = req.query.limit
  const oq = req.query.offset
  const limitRaw = typeof lq === 'string' ? Number.parseInt(lq, 10) : Number.NaN
  const offsetRaw = typeof oq === 'string' ? Number.parseInt(oq, 10) : Number.NaN
  const take =
    Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, AUDIT_PAGE_MAX) : AUDIT_PAGE_DEFAULT
  const skip = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0
  return { take, skip }
}

function parseOptionalInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function parseOptionalIsoDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed) : undefined
}

function buildAuditWhere(req: Request, tenantId: number): Prisma.AuditEventWhereInput {
  const where: Prisma.AuditEventWhereInput = { tenantId }
  const userId = parseOptionalInt(req.query.userId)
  if (userId !== undefined) {
    where.userId = userId
  }
  const action = typeof req.query.action === 'string' ? req.query.action.trim() : ''
  if (action) {
    where.action = action
  }
  const resource = typeof req.query.resource === 'string' ? req.query.resource.trim() : ''
  if (resource) {
    where.resource = resource
  }
  const startDate = parseOptionalIsoDate(req.query.startDate)
  const endDate = parseOptionalIsoDate(req.query.endDate)
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    }
  }
  return where
}

/**
 * @en Registers read-only audit event listing for operators with `audit.read`.
 * @es Registra listado de solo lectura de eventos de auditoría para operadores con `audit.read`.
 * @pt-BR Registra listagem somente leitura de eventos de auditoria para operadores com `audit.read`.
 */
export function registerAuditEventRoutes(app: Application, prisma: PrismaClient): void {
  app.get('/api/audit-events', requirePermission('audit.read'), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    try {
      const tenantId = authReq.auth!.claims.tenantId
      const where = buildAuditWhere(req, tenantId)
      const { take, skip } = parseAuditPagination(req)
      const [total, events] = await Promise.all([
        prisma.auditEvent.count({ where }),
        prisma.auditEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
          skip,
          include: {
            user: {
              select: { username: true },
            },
          },
        }),
      ])
      const data = events.map((event) => ({
        id: event.id,
        tenantId: event.tenantId,
        userId: event.userId,
        username: event.user?.username ?? null,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        ipAddress: event.ipAddress,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
      }))
      res.json(paginatedListJson(data, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })
}
