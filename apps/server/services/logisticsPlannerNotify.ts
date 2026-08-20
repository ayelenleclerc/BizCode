import type { PrismaClient } from '@prisma/client'
import { writeAuditEvent } from '../audit'
import { createNotification } from '../notifications'

export const REPARTO_SYNC_CONFLICT_ROLES = ['owner', 'manager', 'logistics_planner'] as const

export type RepartoSyncConflictCode =
  | 'REPARTO_ITEM_INVALID_STATE'
  | 'REPARTO_INVALID_STATE'
  | 'DEVOLUCION_ALREADY_EXISTS'

/**
 * @en Notifies logistics planners of an App Driver offline sync conflict (#164).
 * @es Notifica a planners de un conflicto de sync offline de App Driver (#164).
 * @pt-BR Notifica planners de um conflito de sync offline do App Driver (#164).
 */
export async function notifyLogisticsPlannersForRepartoConflict(
  prisma: PrismaClient,
  tenantId: number,
  payload: {
    repartoId: number
    itemId?: number
    code: RepartoSyncConflictCode
    actorUserId: number
  },
): Promise<void> {
  const users = await prisma.appUser.findMany({
    where: {
      tenantId,
      active: true,
      role: { in: [...REPARTO_SYNC_CONFLICT_ROLES] },
    },
    select: { id: true },
  })
  const detail = `code=${payload.code} repartoId=${payload.repartoId}`
  await Promise.all(
    users.map((user) =>
      createNotification(prisma, tenantId, user.id, 'reparto_sync_conflict', {
        detail,
        username: String(payload.actorUserId),
      }),
    ),
  )
  await writeAuditEvent({
    prisma,
    tenantId,
    userId: payload.actorUserId,
    action: 'reparto_sync_conflict',
    resource: 'reparto',
    resourceId: String(payload.repartoId),
    metadata: {
      code: payload.code,
      itemId: payload.itemId ?? null,
    },
  })
}
