import type { SQLiteDatabase } from 'expo-sqlite'
import { openJson, sealJson } from '../security/offlineCrypto'

const now = () => new Date().toISOString()

export async function upsertCliente(db: SQLiteDatabase, cliente: Record<string, unknown>): Promise<void> {
  const id = Number(cliente.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO clientes (id, json, rsocial, codigo, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, rsocial=excluded.rsocial, codigo=excluded.codigo, updated_at=excluded.updated_at`,
    id,
    await sealJson(cliente),
    String(cliente.rsocial ?? ''),
    Number(cliente.codigo ?? 0),
    now(),
  )
}

export async function searchClientesLocal(
  db: SQLiteDatabase,
  q: string,
): Promise<Record<string, unknown>[]> {
  const trimmed = q.trim()
  if (!trimmed) {
    const rows = await db.getAllAsync<{ json: string }>(
      'SELECT json FROM clientes ORDER BY rsocial COLLATE NOCASE LIMIT 200',
    )
    return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
  }
  const like = `%${trimmed}%`
  const asCode = Number.parseInt(trimmed, 10)
  const rows = await db.getAllAsync<{ json: string }>(
    `SELECT json FROM clientes
     WHERE rsocial LIKE ? COLLATE NOCASE
        OR CAST(codigo AS TEXT) LIKE ?
        OR (? IS NOT NULL AND codigo = ?)
     ORDER BY rsocial COLLATE NOCASE LIMIT 200`,
    like,
    like,
    Number.isInteger(asCode) ? asCode : null,
    Number.isInteger(asCode) ? asCode : -1,
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function getClienteLocal(
  db: SQLiteDatabase,
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM clientes WHERE id = ?', id)
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

export async function upsertArticulo(db: SQLiteDatabase, articulo: Record<string, unknown>): Promise<void> {
  const id = Number(articulo.id)
  if (!Number.isInteger(id)) return
  const barcode =
    typeof articulo.codigoBarras === 'string' && articulo.codigoBarras.trim()
      ? articulo.codigoBarras.trim()
      : null
  await db.runAsync(
    `INSERT INTO articulos (id, json, descripcion, codigo, codigo_barras, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, descripcion=excluded.descripcion, codigo=excluded.codigo, codigo_barras=excluded.codigo_barras, updated_at=excluded.updated_at`,
    id,
    await sealJson(articulo),
    String(articulo.descripcion ?? ''),
    Number(articulo.codigo ?? 0),
    barcode,
    now(),
  )
}

export async function getArticuloByBarcodeLocal(
  db: SQLiteDatabase,
  codigoBarras: string,
): Promise<Record<string, unknown> | null> {
  const code = codigoBarras.trim()
  if (!code) return null
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM articulos WHERE codigo_barras = ? LIMIT 1',
    code,
  )
  if (!row) return null
  const articulo = await openJson<Record<string, unknown>>(row.json)
  if (articulo.activo === false || articulo.esPadre === true || articulo.tipo === 'servicio') {
    return null
  }
  return articulo
}

export async function searchArticulosLocal(
  db: SQLiteDatabase,
  q: string,
): Promise<Record<string, unknown>[]> {
  const trimmed = q.trim()
  if (!trimmed) {
    const rows = await db.getAllAsync<{ json: string }>(
      'SELECT json FROM articulos ORDER BY descripcion COLLATE NOCASE LIMIT 500',
    )
    return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
  }
  const like = `%${trimmed}%`
  const rows = await db.getAllAsync<{ json: string }>(
    `SELECT json FROM articulos
     WHERE descripcion LIKE ? COLLATE NOCASE
        OR CAST(codigo AS TEXT) LIKE ?
        OR codigo_barras = ?
     ORDER BY descripcion COLLATE NOCASE LIMIT 500`,
    like,
    like,
    trimmed,
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function upsertRubro(db: SQLiteDatabase, rubro: Record<string, unknown>): Promise<void> {
  const id = Number(rubro.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO rubros (id, json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`,
    id,
    await sealJson(rubro),
    now(),
  )
}

export async function listRubrosLocal(db: SQLiteDatabase): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>('SELECT json FROM rubros ORDER BY id')
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function upsertVisita(
  db: SQLiteDatabase,
  visita: Record<string, unknown>,
  opts?: { pendingSync?: boolean },
): Promise<void> {
  const id = Number(visita.id)
  if (!Number.isFinite(id)) return
  const fecha = String(visita.fechaPlanificada ?? '').slice(0, 10)
  await db.runAsync(
    `INSERT INTO visitas (id, fecha, json, pending_sync, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET fecha=excluded.fecha, json=excluded.json, pending_sync=excluded.pending_sync, updated_at=excluded.updated_at`,
    id,
    fecha,
    await sealJson(visita),
    opts?.pendingSync ? 1 : 0,
    now(),
  )
}

export async function listVisitasByFechaLocal(
  db: SQLiteDatabase,
  fecha: string,
): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>(
    'SELECT json FROM visitas WHERE fecha = ? ORDER BY id',
    fecha,
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function upsertPedidoCache(
  db: SQLiteDatabase,
  pedido: Record<string, unknown>,
  opts?: { pendingSync?: boolean },
): Promise<void> {
  const id = Number(pedido.id)
  const clienteId = Number(pedido.clienteId)
  if (!Number.isFinite(id) || !Number.isInteger(clienteId)) return
  await db.runAsync(
    `INSERT INTO pedidos_cache (id, cliente_id, json, pending_sync, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET cliente_id=excluded.cliente_id, json=excluded.json, pending_sync=excluded.pending_sync, updated_at=excluded.updated_at`,
    id,
    clienteId,
    await sealJson(pedido),
    opts?.pendingSync ? 1 : 0,
    now(),
  )
}

export async function listPedidosByClienteLocal(
  db: SQLiteDatabase,
  clienteId: number,
  limit = 10,
): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>(
    'SELECT json FROM pedidos_cache WHERE cliente_id = ? ORDER BY id DESC LIMIT ?',
    clienteId,
    limit,
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function getPedidoLocal(
  db: SQLiteDatabase,
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM pedidos_cache WHERE id = ?', id)
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

export async function replacePedidoId(
  db: SQLiteDatabase,
  localId: number,
  serverPedido: Record<string, unknown>,
): Promise<void> {
  await db.runAsync('DELETE FROM pedidos_cache WHERE id = ?', localId)
  await upsertPedidoCache(db, serverPedido, { pendingSync: false })
}

export async function replaceVisitaId(
  db: SQLiteDatabase,
  localId: number,
  serverVisita: Record<string, unknown>,
): Promise<void> {
  await db.runAsync('DELETE FROM visitas WHERE id = ?', localId)
  await upsertVisita(db, serverVisita, { pendingSync: false })
}

export async function upsertRuta(
  db: SQLiteDatabase,
  ruta: Record<string, unknown>,
  opts?: { pendingSync?: boolean },
): Promise<void> {
  const id = Number(ruta.id)
  if (!Number.isInteger(id)) return
  const fecha = String(ruta.fecha ?? '').slice(0, 10)
  await db.runAsync(
    `INSERT INTO rutas (id, fecha, json, pending_sync, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET fecha=excluded.fecha, json=excluded.json, pending_sync=excluded.pending_sync, updated_at=excluded.updated_at`,
    id,
    fecha,
    await sealJson(ruta),
    opts?.pendingSync ? 1 : 0,
    now(),
  )
}

export async function getRutaByFechaLocal(
  db: SQLiteDatabase,
  fecha: string,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM rutas WHERE fecha = ? ORDER BY id DESC LIMIT 1',
    fecha.slice(0, 10),
  )
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

export async function replaceRutaId(
  db: SQLiteDatabase,
  localId: number,
  serverRuta: Record<string, unknown>,
): Promise<void> {
  await db.runAsync('DELETE FROM rutas WHERE id = ?', localId)
  await upsertRuta(db, serverRuta, { pendingSync: false })
}

export async function upsertFeriado(db: SQLiteDatabase, feriado: Record<string, unknown>): Promise<void> {
  const id = Number(feriado.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO feriados_cache (id, fecha, json, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET fecha=excluded.fecha, json=excluded.json, updated_at=excluded.updated_at`,
    id,
    String(feriado.fecha ?? '').slice(0, 10),
    await sealJson(feriado),
    now(),
  )
}

export async function listFeriadosOnDateLocal(
  db: SQLiteDatabase,
  fecha: string,
): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>(
    'SELECT json FROM feriados_cache WHERE fecha = ?',
    fecha.slice(0, 10),
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

/**
 * @en Upserts cached estado-credito for offline seller alerts (#256).
 * @es Guarda estado-crédito en cache offline (#256).
 * @pt-BR Salva estado-crédito no cache offline (#256).
 */
export async function upsertEstadoCredito(
  db: SQLiteDatabase,
  clienteId: number,
  data: Record<string, unknown>,
): Promise<void> {
  if (!Number.isInteger(clienteId) || clienteId < 1) return
  const asOf = String(data.asOf ?? new Date().toISOString())
  await db.runAsync(
    `INSERT INTO estado_credito_cache (cliente_id, json, as_of, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(cliente_id) DO UPDATE SET json=excluded.json, as_of=excluded.as_of, updated_at=excluded.updated_at`,
    clienteId,
    await sealJson(data),
    asOf,
    now(),
  )
}

export async function getEstadoCreditoLocal(
  db: SQLiteDatabase,
  clienteId: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM estado_credito_cache WHERE cliente_id = ?',
    clienteId,
  )
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

/**
 * @en Upserts stock-multiple snapshot (#256).
 * @es Guarda snapshot stock-multiple (#256).
 * @pt-BR Salva snapshot stock-multiple (#256).
 */
export async function upsertStockSnapshot(
  db: SQLiteDatabase,
  snapshot: { asOf: string; items: unknown[] },
): Promise<void> {
  await db.runAsync(
    `INSERT INTO stock_snapshot (id, json, as_of, updated_at) VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, as_of=excluded.as_of, updated_at=excluded.updated_at`,
    await sealJson(snapshot),
    snapshot.asOf,
    now(),
  )
}

export async function getStockSnapshotLocal(
  db: SQLiteDatabase,
): Promise<{ asOf: string; items: unknown[] } | null> {
  const row = await db.getFirstAsync<{ json: string; as_of: string }>(
    'SELECT json, as_of FROM stock_snapshot WHERE id = 1',
  )
  if (!row) return null
  const parsed = await openJson<{ asOf?: string; items?: unknown[] }>(row.json)
  return {
    asOf: parsed.asOf ?? row.as_of,
    items: Array.isArray(parsed.items) ? parsed.items : [],
  }
}

export async function upsertSellerPolicies(
  db: SQLiteDatabase,
  policies: Record<string, unknown>,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO seller_policies_cache (id, json, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`,
    await sealJson(policies),
    now(),
  )
}

export async function getSellerPoliciesLocal(
  db: SQLiteDatabase,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM seller_policies_cache WHERE id = 1',
  )
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

/**
 * @en Upserts a customer order template for offline use (#253).
 * @es Guarda una plantilla de pedido en cache offline (#253).
 * @pt-BR Salva um modelo de pedido no cache offline (#253).
 */
export async function upsertPlantillaPedido(
  db: SQLiteDatabase,
  plantilla: Record<string, unknown>,
): Promise<void> {
  const id = Number(plantilla.id)
  const clienteId = Number(plantilla.clienteId)
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(clienteId) || clienteId < 1) return
  await db.runAsync(
    `INSERT INTO plantillas_pedido_cache (id, cliente_id, json, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET cliente_id=excluded.cliente_id, json=excluded.json, updated_at=excluded.updated_at`,
    id,
    clienteId,
    await sealJson(plantilla),
    now(),
  )
}

export async function listPlantillasByClienteLocal(
  db: SQLiteDatabase,
  clienteId: number,
): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>(
    'SELECT json FROM plantillas_pedido_cache WHERE cliente_id = ?',
    clienteId,
  )
  return Promise.all(rows.map(async (r) => openJson<Record<string, unknown>>(r.json)))
}

export async function upsertUltimoPedidoRepeat(
  db: SQLiteDatabase,
  clienteId: number,
  data: Record<string, unknown>,
): Promise<void> {
  if (!Number.isInteger(clienteId) || clienteId < 1) return
  await db.runAsync(
    `INSERT INTO ultimo_pedido_repeat_cache (cliente_id, json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(cliente_id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`,
    clienteId,
    await sealJson(data),
    now(),
  )
}

export async function getUltimoPedidoRepeatLocal(
  db: SQLiteDatabase,
  clienteId: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM ultimo_pedido_repeat_cache WHERE cliente_id = ?',
    clienteId,
  )
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

/**
 * @en Upserts order suggestions for offline check mode (#254).
 * @es Guarda sugerencias de pedido en cache offline (#254).
 * @pt-BR Salva sugestões de pedido no cache offline (#254).
 */
export async function upsertSugerenciasPedido(
  db: SQLiteDatabase,
  clienteId: number,
  data: Record<string, unknown>,
): Promise<void> {
  if (!Number.isInteger(clienteId) || clienteId < 1) return
  await db.runAsync(
    `INSERT INTO sugerencias_pedido_cache (cliente_id, json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(cliente_id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`,
    clienteId,
    await sealJson(data),
    now(),
  )
}

export async function getSugerenciasPedidoLocal(
  db: SQLiteDatabase,
  clienteId: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM sugerencias_pedido_cache WHERE cliente_id = ?',
    clienteId,
  )
  return row ? await openJson<Record<string, unknown>>(row.json) : null
}

