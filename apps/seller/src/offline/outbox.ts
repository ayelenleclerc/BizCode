import type { SQLiteDatabase } from 'expo-sqlite'
import { offlineMeta } from './meta'
import { nextLocalId, type OutboxActionType, type OutboxRow } from './types'

/**
 * @en Enqueues an offline action (FIFO) and updates pending counter.
 * @es Encola una acción offline (FIFO) y actualiza el contador pendiente.
 * @pt-BR Enfileira uma ação offline (FIFO) e atualiza o contador pendente.
 */
export async function enqueueOutbox(
  db: SQLiteDatabase,
  actionType: OutboxActionType,
  payload: Record<string, unknown>,
): Promise<number> {
  const createdAt = new Date().toISOString()
  const result = await db.runAsync(
    `INSERT INTO outbox (action_type, payload_json, created_at, attempts, last_error)
     VALUES (?, ?, ?, 0, NULL)`,
    actionType,
    JSON.stringify(payload),
    createdAt,
  )
  const count = await countOutbox(db)
  offlineMeta.setPendingCount(count)
  return Number(result.lastInsertRowId)
}

export async function countOutbox(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM outbox')
  return row?.c ?? 0
}

export async function listOutboxFifo(db: SQLiteDatabase): Promise<OutboxRow[]> {
  const rows = await db.getAllAsync<{
    id: number
    action_type: string
    payload_json: string
    created_at: string
    attempts: number
    last_error: string | null
  }>('SELECT * FROM outbox ORDER BY id ASC')
  return rows.map((r) => ({
    id: r.id,
    actionType: r.action_type as OutboxActionType,
    payloadJson: r.payload_json,
    createdAt: r.created_at,
    attempts: r.attempts,
    lastError: r.last_error,
  }))
}

export async function deleteOutbox(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM outbox WHERE id = ?', id)
  offlineMeta.setPendingCount(await countOutbox(db))
}

export async function markOutboxError(
  db: SQLiteDatabase,
  id: number,
  attempts: number,
  error: string,
): Promise<void> {
  await db.runAsync('UPDATE outbox SET attempts = ?, last_error = ? WHERE id = ?', attempts, error, id)
}

/**
 * @en Allocates a new provisional negative local id for entity.
 * @es Asigna un nuevo id local provisional negativo para la entidad.
 * @pt-BR Aloca um novo id local provisório negativo para a entidade.
 */
export async function allocateLocalId(
  db: SQLiteDatabase,
  entity: 'pedido' | 'visita',
): Promise<number> {
  const mapMin = await db.getFirstAsync<{ m: number | null }>(
    'SELECT MIN(local_id) as m FROM id_map WHERE entity = ?',
    entity,
  )
  const table = entity === 'pedido' ? 'pedidos_cache' : 'visitas'
  const cacheMin = await db.getFirstAsync<{ m: number | null }>(
    `SELECT MIN(id) as m FROM ${table} WHERE id < 0`,
  )
  const candidates = [mapMin?.m, cacheMin?.m].filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  )
  const min = candidates.length ? Math.min(...candidates) : 0
  return nextLocalId(min)
}

export async function saveIdMap(
  db: SQLiteDatabase,
  entity: 'pedido' | 'visita',
  localId: number,
  serverId: number,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO id_map (entity, local_id, server_id) VALUES (?, ?, ?)`,
    entity,
    localId,
    serverId,
  )
}

export async function resolveServerId(
  db: SQLiteDatabase,
  entity: 'pedido' | 'visita',
  id: number,
): Promise<number | null> {
  if (id > 0) return id
  const row = await db.getFirstAsync<{ server_id: number }>(
    'SELECT server_id FROM id_map WHERE entity = ? AND local_id = ?',
    entity,
    id,
  )
  return row?.server_id ?? null
}
