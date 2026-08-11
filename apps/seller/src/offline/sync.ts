import { pedidosAPI, rutasAPI, visitasAPI } from '../api/sellerApi'
import { getOfflineDb } from './db'
import { offlineMeta } from './meta'
import {
  deleteOutbox,
  listOutboxFifo,
  markOutboxError,
  resolveServerId,
  saveIdMap,
} from './outbox'
import { replacePedidoId, replaceRutaId, replaceVisitaId, upsertRuta, upsertVisita } from './repos'
import type {
  PedidoCreateConfirmPayload,
  RutaCreatePayload,
  RutaParadaPatchPayload,
  RutaParadasReplacePayload,
  VisitaCreatePayload,
  VisitaUpdatePayload,
} from './types'

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
      if (item.actionType === 'pedido_create_confirm') {
        const p = payload as unknown as PedidoCreateConfirmPayload
        const created = await pedidosAPI.create(p.body)
        const confirmed = await pedidosAPI.confirm(created.id)
        await saveIdMap(db, 'pedido', p.localPedidoId, confirmed.id)
        await replacePedidoId(db, p.localPedidoId, confirmed as unknown as Record<string, unknown>)
      } else if (item.actionType === 'visita_create') {
        const p = payload as unknown as VisitaCreatePayload
        const created = await visitasAPI.create(p.body)
        await saveIdMap(db, 'visita', p.localVisitaId, created.id)
        await replaceVisitaId(db, p.localVisitaId, created as unknown as Record<string, unknown>)
      } else if (item.actionType === 'visita_update') {
        const p = payload as unknown as VisitaUpdatePayload
        const serverId = await resolveServerId(db, 'visita', p.visitaId)
        if (serverId == null) {
          throw new Error(`visita local ${p.visitaId} not synced yet`)
        }
        const updated = await visitasAPI.update(serverId, p.body)
        await upsertVisita(db, updated as unknown as Record<string, unknown>, { pendingSync: false })
      } else if (item.actionType === 'ruta_create') {
        const p = payload as unknown as RutaCreatePayload
        const created = await rutasAPI.createRuta(p.body)
        await saveIdMap(db, 'ruta', p.localRutaId, created.id)
        await replaceRutaId(db, p.localRutaId, created as unknown as Record<string, unknown>)
      } else if (item.actionType === 'ruta_paradas_replace') {
        const p = payload as unknown as RutaParadasReplacePayload
        const serverRutaId = await resolveServerId(db, 'ruta', p.rutaId)
        if (serverRutaId == null) {
          throw new Error(`ruta local ${p.rutaId} not synced yet`)
        }
        const updated = await rutasAPI.replaceParadas(serverRutaId, p.body)
        await upsertRuta(db, updated as unknown as Record<string, unknown>, { pendingSync: false })
      } else if (item.actionType === 'ruta_parada_patch') {
        const p = payload as unknown as RutaParadaPatchPayload
        const serverRutaId = await resolveServerId(db, 'ruta', p.rutaId)
        if (serverRutaId == null) {
          throw new Error(`ruta local ${p.rutaId} not synced yet`)
        }
        const updated = await rutasAPI.patchParada(serverRutaId, p.paradaId, p.body)
        await upsertRuta(db, updated as unknown as Record<string, unknown>, { pendingSync: false })
      }
      await deleteOutbox(db, item.id)
      processed += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : 'sync_failed'
      lastError = message
      await markOutboxError(db, item.id, item.attempts + 1, message)
      break
    }
  }

  const remaining = (await listOutboxFifo(db)).length
  offlineMeta.setPendingCount(remaining)
  offlineMeta.setLastSyncError(lastError)
  offlineMeta.setLastSyncAt(new Date().toISOString())
  return { processed, remaining, lastError }
}
