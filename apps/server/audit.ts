import type { PrismaClient, Prisma } from '@prisma/client'
import {
  classifyAuditEvent,
  type SecurityEventType,
  type SecuritySeverity,
} from './security/securityTaxonomy'

export type WriteAuditEventInput = {
  prisma: PrismaClient
  tenantId: number
  userId?: number | null
  action: string
  resource: string
  resourceId?: string | null
  ipAddress?: string | null
  metadata?: Prisma.InputJsonValue
  /** @en Optional explicit taxonomy override (#221). @es Override opcional de taxonomía (#221). @pt-BR Override opcional da taxonomia (#221). */
  securityEventType?: SecurityEventType | null
  /** @en Optional explicit severity override (#221). @es Override opcional de severidad (#221). @pt-BR Override opcional de severidade (#221). */
  severity?: SecuritySeverity | null
}

/**
 * @en Persists an `AuditEvent` with optional security classification (#221). Swallows errors so business flows are not blocked.
 * @es Persiste un `AuditEvent` con clasificación de seguridad opcional (#221). Ignora errores para no bloquear flujos de negocio.
 * @pt-BR Persiste um `AuditEvent` com classificação de segurança opcional (#221). Engole erros para não bloquear fluxos de negócio.
 */
export async function writeAuditEvent(input: WriteAuditEventInput): Promise<void> {
  try {
    const classified = classifyAuditEvent(input.action, input.metadata)
    const securityEventType =
      input.securityEventType !== undefined ? input.securityEventType : classified.securityEventType
    const severity = input.severity !== undefined ? input.severity : classified.severity

    await input.prisma.auditEvent.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        ipAddress: input.ipAddress ?? null,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        ...(securityEventType != null ? { securityEventType } : {}),
        ...(severity != null ? { severity } : {}),
      },
    })
  } catch {
    // Audit failures must not block core business operations.
  }
}
