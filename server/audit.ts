import type { PrismaClient, Prisma } from '@prisma/client'

export type WriteAuditEventInput = {
  prisma: PrismaClient
  tenantId: number
  userId?: number | null
  action: string
  resource: string
  resourceId?: string | null
  ipAddress?: string | null
  metadata?: Prisma.InputJsonValue
}

/**
 * @en Persists an `AuditEvent`. Swallows errors so business flows are not blocked.
 * @es Persiste un `AuditEvent`. Ignora errores para no bloquear flujos de negocio.
 * @pt-BR Persiste um `AuditEvent`. Engole erros para não bloquear fluxos de negócio.
 */
export async function writeAuditEvent(input: WriteAuditEventInput): Promise<void> {
  try {
    await input.prisma.auditEvent.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        ipAddress: input.ipAddress ?? null,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      },
    })
  } catch {
    // Audit failures must not block core business operations.
  }
}
