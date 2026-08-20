import type { CobroCreateBody } from '@bizcode/api-client'
import type { DevolucionEntregaRegisterInput, MotivoNoEntrega, RepartoItemPodInput } from '@bizcode/types'
import { driverCobrosApi, driverRepartosApi } from '../api/driverApi'
import { getOfflineDb } from './db'
import { offlineMeta } from './meta'
import { deleteOutbox, listOutboxFifo, markOutboxError } from './outbox'
import { hydrateOfflineCache } from './hydrate'
import { isSyncConflictError, type CobroCreatePayload, type DevolucionRegisterPayload, type PodDeliveredPayload, type PodNotDeliveredPayload } from './types'

export type SyncResult = {
  processed: number
  remaining: number
  lastError: string | null
}

/**
 * @en Flushes outbox FIFO to the API; failures stay queued for retry.
 * @es Vacía la outbox FIFO hacia la API; los fallos quedan para reintento.
 * @pt-BR Esvazia a outbox FIFO na API; falhas ficam para nova tentativa.
 */
export async function flushOutbox(): Promise<SyncResult> {
  const db = await getOfflineDb()
  const items = await listOutboxFifo(db)
  let processed = 0
  let lastError: string | null = null

  for (const item of items) {
    try {
      const payload = JSON.parse(item.payloadJson) as Record<string, unknown>
      if (item.actionType === 'pod_delivered') {
        const p = payload as unknown as PodDeliveredPayload
        await driverRepartosApi.updateItemPod(p.repartoId, p.itemId, p.input as unknown as RepartoItemPodInput)
      } else if (item.actionType === 'pod_not_delivered') {
        const p = payload as unknown as PodNotDeliveredPayload
        await driverRepartosApi.updateItemPod(p.repartoId, p.itemId, {
          outcome: 'not_delivered',
          motivoNoEntrega: p.motivo as MotivoNoEntrega,
        })
      } else if (item.actionType === 'cobro_create') {
        const p = payload as unknown as CobroCreatePayload
        await driverCobrosApi.create(p.body as unknown as CobroCreateBody)
      } else if (item.actionType === 'devolucion_register') {
        const p = payload as unknown as DevolucionRegisterPayload
        await driverRepartosApi.registerDevolucion(
          p.repartoId,
          p.itemId,
          p.input as unknown as DevolucionEntregaRegisterInput,
        )
      } else {
        throw new Error(`UNKNOWN_OUTBOX_ACTION:${item.actionType}`)
      }
      await deleteOutbox(db, item.id)
      processed += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await markOutboxError(db, item.id, item.attempts + 1, message)
      lastError = isSyncConflictError(message) ? message : message
      offlineMeta.setLastSyncError(lastError)
      break
    }
  }

  const remaining = (await listOutboxFifo(db)).length
  offlineMeta.setPendingCount(remaining)
  if (!lastError) {
    offlineMeta.setLastSyncError(null)
    offlineMeta.setLastSyncAt(new Date().toISOString())
    if (processed > 0) {
      try {
        await hydrateOfflineCache()
      } catch {
        // cache refresh is best-effort after successful flush
      }
    }
  }
  return { processed, remaining, lastError }
}
