import type { SQLiteDatabase } from 'expo-sqlite'
import type { CobroTransferInfo, FormaPagoDTO } from '@bizcode/api-client'
import type { Reparto, RepartoItemRow } from '@bizcode/types'
import { openJson, sealJson } from '../security/offlineCrypto'
import { mapProgressFromItems } from './types'

const KEY_REPARTO = 'mi_reparto'
const KEY_FORMAS = 'formas_pago'
const KEY_TRANSFER = 'transfer_info'

async function putJson(db: SQLiteDatabase, key: string, value: unknown): Promise<void> {
  const updatedAt = new Date().toISOString()
  await db.runAsync(
    `INSERT OR REPLACE INTO kv_cache (key, json, updated_at) VALUES (?, ?, ?)`,
    key,
    await sealJson(value),
    updatedAt,
  )
}

async function getJson<T>(db: SQLiteDatabase, key: string): Promise<T | null> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM kv_cache WHERE key = ?', key)
  if (!row?.json) return null
  try {
    return await openJson<T>(row.json)
  } catch {
    return null
  }
}

export async function saveRepartoCache(db: SQLiteDatabase, reparto: Reparto | null): Promise<void> {
  await putJson(db, KEY_REPARTO, reparto)
}

export async function loadRepartoCache(db: SQLiteDatabase): Promise<Reparto | null> {
  return getJson<Reparto>(db, KEY_REPARTO)
}

export async function saveFormasPagoCache(db: SQLiteDatabase, rows: FormaPagoDTO[]): Promise<void> {
  await putJson(db, KEY_FORMAS, rows)
}

export async function loadFormasPagoCache(db: SQLiteDatabase): Promise<FormaPagoDTO[]> {
  return (await getJson<FormaPagoDTO[]>(db, KEY_FORMAS)) ?? []
}

export async function saveTransferInfoCache(
  db: SQLiteDatabase,
  info: CobroTransferInfo | null,
): Promise<void> {
  await putJson(db, KEY_TRANSFER, info)
}

export async function loadTransferInfoCache(db: SQLiteDatabase): Promise<CobroTransferInfo | null> {
  return getJson<CobroTransferInfo>(db, KEY_TRANSFER)
}

/**
 * @en Applies a patched stop into the cached route and recomputes progress.
 * @es Aplica una parada parcheada en la ruta cacheada y recalcula progreso.
 * @pt-BR Aplica uma parada atualizada na rota em cache e recalcula o progresso.
 */
export async function patchCachedItem(
  db: SQLiteDatabase,
  itemId: number,
  next: RepartoItemRow,
): Promise<Reparto | null> {
  const prev = await loadRepartoCache(db)
  if (!prev) return null
  const items = prev.items.map((item) => (item.id === itemId ? next : item))
  const patched: Reparto = { ...prev, items, progress: mapProgressFromItems(items) }
  await saveRepartoCache(db, patched)
  return patched
}
