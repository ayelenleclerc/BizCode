/**
 * @en Lists security-classified audit events for the super_admin timeline (#221).
 * @es Lista eventos de audit clasificados de seguridad para el timeline de super_admin (#221).
 * @pt-BR Lista eventos de audit classificados de segurança para o timeline do super_admin (#221).
 */

import type { PrismaClient } from '@prisma/client'

export type SecurityEventListItem = {
  id: number
  tenantId: number
  tenantSlug: string | null
  userId: number | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  securityEventType: string
  severity: string
  metadata: unknown
  createdAt: string
}

export type ListSecurityEventsResult = {
  data: SecurityEventListItem[]
  total: number
}

export class SecurityEventsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Returns security events from the last `hours` (default 24), newest first.
   * @es Devuelve eventos de seguridad de las últimas `hours` (default 24), más recientes primero.
   * @pt-BR Retorna eventos de segurança das últimas `hours` (padrão 24), mais recentes primeiro.
   */
  async listRecent(options?: {
    hours?: number
    severity?: string
    limit?: number
    offset?: number
  }): Promise<ListSecurityEventsResult> {
    const hours = options?.hours != null && options.hours > 0 ? Math.min(options.hours, 168) : 24
    const limit = options?.limit != null && options.limit > 0 ? Math.min(options.limit, 500) : 100
    const offset = options?.offset != null && options.offset >= 0 ? options.offset : 0
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const where = {
      createdAt: { gte: since },
      securityEventType: { not: null },
      ...(options?.severity
        ? { severity: options.severity }
        : {}),
    }

    const [total, rows] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          tenant: { select: { slug: true } },
        },
      }),
    ])

    return {
      total,
      data: rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        tenantSlug: row.tenant.slug,
        userId: row.userId,
        action: row.action,
        resource: row.resource,
        resourceId: row.resourceId,
        ipAddress: row.ipAddress,
        securityEventType: row.securityEventType ?? 'unknown',
        severity: row.severity ?? 'info',
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
      })),
    }
  }
}
