import * as SQLite from 'expo-sqlite'
import { DRIVER_OFFLINE_DB_V2 } from '../security/offlineStorageIds'

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

const SCHEMA = `
CREATE TABLE IF NOT EXISTS kv_cache (
  key TEXT PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);
`

/**
 * @en Opens the Driver offline SQLite DB v2 (singleton) and ensures schema (#220 encrypted payloads).
 * @es Abre la SQLite offline Driver v2 (singleton) y asegura el schema (#220 payloads cifrados).
 * @pt-BR Abre o SQLite offline Driver v2 (singleton) e garante o schema (#220 payloads cifrados).
 */
export async function getOfflineDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DRIVER_OFFLINE_DB_V2)
      await db.execAsync(SCHEMA)
      return db
    })()
  }
  return dbPromise
}

/**
 * @en Test helper: reset singleton (does not delete file).
 * @es Helper de test: resetea el singleton (no borra el archivo).
 * @pt-BR Helper de teste: redefine o singleton (não apaga o arquivo).
 */
export function resetOfflineDbSingleton(): void {
  dbPromise = null
}
