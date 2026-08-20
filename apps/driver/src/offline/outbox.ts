import type { SQLiteDatabase } from 'expo-sqlite'
import { openUtf8, sealJson } from '../security/offlineCrypto'
import { offlineMeta } from './meta'
import { collectPendingItemIds, type OutboxActionType, type OutboxRow } from './types'

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
    await sealJson(payload),
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
  return Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      actionType: r.action_type as OutboxActionType,
      payloadJson: await openUtf8(r.payload_json),
      createdAt: r.created_at,
      attempts: r.attempts,
      lastError: r.last_error,
    })),
  )
}

export async function pendingItemIds(db: SQLiteDatabase): Promise<Set<number>> {
  const rows = await listOutboxFifo(db)
  return new Set(collectPendingItemIds(rows.map((row) => row.payloadJson)))
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
