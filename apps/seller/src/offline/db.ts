import * as SQLite from 'expo-sqlite'

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  rsocial TEXT,
  codigo INTEGER,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clientes_rsocial ON clientes(rsocial);

CREATE TABLE IF NOT EXISTS articulos (
  id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  descripcion TEXT,
  codigo INTEGER,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articulos_desc ON articulos(descripcion);

CREATE TABLE IF NOT EXISTS rubros (
  id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visitas (
  id INTEGER PRIMARY KEY NOT NULL,
  fecha TEXT NOT NULL,
  json TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha);

CREATE TABLE IF NOT EXISTS pedidos_cache (
  id INTEGER PRIMARY KEY NOT NULL,
  cliente_id INTEGER NOT NULL,
  json TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos_cache(cliente_id);

CREATE TABLE IF NOT EXISTS rutas (
  id INTEGER PRIMARY KEY NOT NULL,
  fecha TEXT NOT NULL,
  json TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha);

CREATE TABLE IF NOT EXISTS feriados_cache (
  id INTEGER PRIMARY KEY NOT NULL,
  fecha TEXT NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feriados_fecha ON feriados_cache(fecha);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS id_map (
  entity TEXT NOT NULL,
  local_id INTEGER NOT NULL,
  server_id INTEGER NOT NULL,
  PRIMARY KEY (entity, local_id)
);

CREATE TABLE IF NOT EXISTS estado_credito_cache (
  cliente_id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  as_of TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_snapshot (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  json TEXT NOT NULL,
  as_of TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seller_policies_cache (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`

/**
 * @en Opens the Seller offline SQLite DB (singleton) and ensures schema.
 * @es Abre la SQLite offline del Seller (singleton) y asegura el schema.
 * @pt-BR Abre o SQLite offline do Seller (singleton) e garante o schema.
 */
export async function getOfflineDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('bizcode-seller-offline.db')
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
