import * as SQLite from 'expo-sqlite'
import { SELLER_OFFLINE_DB_V2 } from '../security/offlineStorageIds'

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
  codigo_barras TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articulos_desc ON articulos(descripcion);
CREATE INDEX IF NOT EXISTS idx_articulos_barcode ON articulos(codigo_barras);

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

CREATE TABLE IF NOT EXISTS plantillas_pedido_cache (
  id INTEGER PRIMARY KEY NOT NULL,
  cliente_id INTEGER NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plantillas_cliente ON plantillas_pedido_cache(cliente_id);

CREATE TABLE IF NOT EXISTS ultimo_pedido_repeat_cache (
  cliente_id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sugerencias_pedido_cache (
  cliente_id INTEGER PRIMARY KEY NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`

/**
 * @en Opens the Seller offline SQLite DB v2 (singleton) and ensures schema (#220 encrypted JSON).
 * @es Abre la SQLite offline Seller v2 (singleton) y asegura el schema (#220 JSON cifrado).
 * @pt-BR Abre o SQLite offline Seller v2 (singleton) e garante o schema (#220 JSON cifrado).
 */
export async function getOfflineDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(SELLER_OFFLINE_DB_V2)
      await db.execAsync(SCHEMA)
      // @en Add codigo_barras for DBs created before #255 (CREATE TABLE IF NOT EXISTS does not alter).
      // @es Añade codigo_barras en DBs previas a #255 (CREATE TABLE IF NOT EXISTS no altera).
      // @pt-BR Adiciona codigo_barras em DBs anteriores a #255 (CREATE TABLE IF NOT EXISTS não altera).
      try {
        await db.execAsync('ALTER TABLE articulos ADD COLUMN codigo_barras TEXT')
      } catch {
        // column already exists
      }
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_articulos_barcode ON articulos(codigo_barras)')
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
