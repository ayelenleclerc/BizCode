import type { SQLiteDatabase } from 'expo-sqlite'

const now = () => new Date().toISOString()

export async function upsertCliente(db: SQLiteDatabase, cliente: Record<string, unknown>): Promise<void> {
  const id = Number(cliente.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO clientes (id, json, rsocial, codigo, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, rsocial=excluded.rsocial, codigo=excluded.codigo, updated_at=excluded.updated_at`,
    id,
    JSON.stringify(cliente),
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
    return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
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
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
}

export async function getClienteLocal(
  db: SQLiteDatabase,
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM clientes WHERE id = ?', id)
  return row ? (JSON.parse(row.json) as Record<string, unknown>) : null
}

export async function upsertArticulo(db: SQLiteDatabase, articulo: Record<string, unknown>): Promise<void> {
  const id = Number(articulo.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO articulos (id, json, descripcion, codigo, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, descripcion=excluded.descripcion, codigo=excluded.codigo, updated_at=excluded.updated_at`,
    id,
    JSON.stringify(articulo),
    String(articulo.descripcion ?? ''),
    Number(articulo.codigo ?? 0),
    now(),
  )
}

export async function searchArticulosLocal(
  db: SQLiteDatabase,
  q: string,
): Promise<Record<string, unknown>[]> {
  const trimmed = q.trim()
  if (!trimmed) {
    const rows = await db.getAllAsync<{ json: string }>(
      'SELECT json FROM articulos ORDER BY descripcion COLLATE NOCASE LIMIT 200',
    )
    return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
  }
  const like = `%${trimmed}%`
  const rows = await db.getAllAsync<{ json: string }>(
    `SELECT json FROM articulos
     WHERE descripcion LIKE ? COLLATE NOCASE OR CAST(codigo AS TEXT) LIKE ?
     ORDER BY descripcion COLLATE NOCASE LIMIT 200`,
    like,
    like,
  )
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
}

export async function upsertRubro(db: SQLiteDatabase, rubro: Record<string, unknown>): Promise<void> {
  const id = Number(rubro.id)
  if (!Number.isInteger(id)) return
  await db.runAsync(
    `INSERT INTO rubros (id, json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`,
    id,
    JSON.stringify(rubro),
    now(),
  )
}

export async function listRubrosLocal(db: SQLiteDatabase): Promise<Record<string, unknown>[]> {
  const rows = await db.getAllAsync<{ json: string }>('SELECT json FROM rubros ORDER BY id')
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
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
    JSON.stringify(visita),
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
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
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
    JSON.stringify(pedido),
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
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
}

export async function getPedidoLocal(
  db: SQLiteDatabase,
  id: number,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM pedidos_cache WHERE id = ?', id)
  return row ? (JSON.parse(row.json) as Record<string, unknown>) : null
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
    JSON.stringify(ruta),
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
  return row ? (JSON.parse(row.json) as Record<string, unknown>) : null
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
    JSON.stringify(feriado),
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
  return rows.map((r) => JSON.parse(r.json) as Record<string, unknown>)
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
    JSON.stringify(data),
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
  return row ? (JSON.parse(row.json) as Record<string, unknown>) : null
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
    JSON.stringify(snapshot),
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
  const parsed = JSON.parse(row.json) as { asOf?: string; items?: unknown[] }
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
    JSON.stringify(policies),
    now(),
  )
}

export async function getSellerPoliciesLocal(
  db: SQLiteDatabase,
): Promise<Record<string, unknown> | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM seller_policies_cache WHERE id = 1',
  )
  return row ? (JSON.parse(row.json) as Record<string, unknown>) : null
}

