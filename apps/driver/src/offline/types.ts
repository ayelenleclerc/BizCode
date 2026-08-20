export type OutboxActionType =
  | 'pod_delivered'
  | 'pod_not_delivered'
  | 'cobro_create'
  | 'devolucion_register'

export type OutboxRow = {
  id: number
  actionType: OutboxActionType
  payloadJson: string
  createdAt: string
  attempts: number
  lastError: string | null
}

export type PodDeliveredPayload = {
  repartoId: number
  itemId: number
  input: Record<string, unknown>
}

export type PodNotDeliveredPayload = {
  repartoId: number
  itemId: number
  motivo: string
}

export type CobroCreatePayload = {
  body: Record<string, unknown>
}

export type DevolucionRegisterPayload = {
  repartoId: number
  itemId: number
  input: Record<string, unknown>
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'ok'

/**
 * @en True when cache day metadata is stale vs device local date.
 * @es True si el metadato del día de cache está obsoleto vs fecha local.
 * @pt-BR True se o metadado do dia do cache está obsoleto vs data local.
 */
export function isCacheStale(cacheDay: string | null | undefined, today: string): boolean {
  if (!cacheDay || cacheDay.trim() === '') return true
  return cacheDay !== today
}

/**
 * @en Conflict API errors that should stay queued and surface to the driver (#164).
 * @es Errores de API de conflicto que quedan en cola y se muestran al chofer (#164).
 * @pt-BR Erros de API de conflito que ficam na fila e aparecem ao motorista (#164).
 */
export function isSyncConflictError(message: string): boolean {
  return (
    message.includes('REPARTO_ITEM_INVALID_STATE') ||
    message.includes('REPARTO_INVALID_STATE') ||
    message.includes('DEVOLUCION_ALREADY_EXISTS')
  )
}

/**
 * @en Collects stop ids from outbox payloads in FIFO order.
 * @es Recolecta ids de parada de payloads outbox en orden FIFO.
 * @pt-BR Coleta ids de parada dos payloads da outbox em ordem FIFO.
 */
export function collectPendingItemIds(payloadJsons: string[]): number[] {
  const ids: number[] = []
  for (const json of payloadJsons) {
    try {
      const payload = JSON.parse(json) as { itemId?: number }
      if (typeof payload.itemId === 'number') ids.push(payload.itemId)
    } catch {
      // skip malformed payload
    }
  }
  return ids
}

/**
 * @en Maps a cached stop row to progress after an optimistic local mutation.
 * @es Recalcula progreso tras una mutación local optimista.
 * @pt-BR Recalcula progresso após mutação local otimista.
 */
export function mapProgressFromItems(items: { estado: string }[]): {
  total: number
  delivered: number
  pending: number
} {
  const delivered = items.filter((i) => i.estado === 'delivered').length
  const pending = items.filter((i) => i.estado === 'pending').length
  return { total: items.length, delivered, pending }
}
