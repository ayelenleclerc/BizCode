import type { PrismaClient } from '@prisma/client'
import { createNotification } from '../notifications'

export type DriverRepartoPushType =
  | 'reparto_assigned'
  | 'reparto_stop_added'
  | 'reparto_stop_removed'

export type DriverRepartoPushPayload = {
  repartoId: number
  stopCount?: number
  itemId?: number
  addedCount?: number
}

/**
 * @en Notifies the assigned driver about a reparto lifecycle event (#165).
 * @es Notifica al chofer asignado sobre un evento de reparto (#165).
 * @pt-BR Notifica o motorista atribuído sobre um evento de reparto (#165).
 */
export async function notifyDriverForRepartoEvent(
  prisma: PrismaClient,
  tenantId: number,
  choferId: number,
  type: DriverRepartoPushType,
  payload: DriverRepartoPushPayload,
): Promise<void> {
  await createNotification(prisma, tenantId, choferId, type, payload)
}
