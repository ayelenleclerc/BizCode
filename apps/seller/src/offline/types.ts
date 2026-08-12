export type OutboxActionType =
  | 'pedido_create_confirm'
  | 'visita_create'
  | 'visita_update'
  | 'ruta_create'
  | 'ruta_paradas_replace'
  | 'ruta_parada_patch'

export type OutboxRow = {
  id: number
  actionType: OutboxActionType
  payloadJson: string
  createdAt: string
  attempts: number
  lastError: string | null
}

export type PedidoCreateConfirmPayload = {
  localPedidoId: number
  body: Record<string, unknown>
}

export type VisitaCreatePayload = {
  localVisitaId: number
  body: Record<string, unknown>
}

export type VisitaUpdatePayload = {
  /** Server id when known; negative local id when created offline. */
  visitaId: number
  body: Record<string, unknown>
}

export type RutaCreatePayload = {
  localRutaId: number
  body: Record<string, unknown>
}

export type RutaParadasReplacePayload = {
  rutaId: number
  body: Record<string, unknown>
}

export type RutaParadaPatchPayload = {
  rutaId: number
  paradaId: number
  body: Record<string, unknown>
}

export type OfflineHydrateStats = {
  clientes: number
  articulos: number
  rubros: number
  visitas: number
  pedidos: number
  estadoCredito: number
  stockItems: number
  plantillas: number
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'ok'

/**
 * @en Allocates the next provisional negative id (pure helper for tests).
 * @es Asigna el próximo id provisional negativo (helper puro para tests).
 * @pt-BR Aloca o próximo id provisório negativo (helper puro para testes).
 */
export function nextLocalId(previousMin: number): number {
  if (!Number.isFinite(previousMin) || previousMin >= 0) return -1
  return previousMin - 1
}

/**
 * @en True when cache day metadata is stale vs device local date.
 * @es True si el metadato del día de cache está obsoleto vs fecha local.
 * @pt-BR True se o metadado do dia do cache está obsoleto vs data local.
 */
export function isCacheStale(cacheDay: string | null | undefined, today: string): boolean {
  if (!cacheDay || cacheDay.trim() === '') return true
  return cacheDay !== today
}
