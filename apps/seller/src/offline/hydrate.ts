import { articulosAPI, pedidosAPI, plantillasPedidoAPI, rubrosAPI, sellerAlertsAPI, sugerenciasPedidoAPI, visitasAPI } from '../api/sellerApi'
import { sellerHttp } from '../api/http'
import { getOfflineDb } from './db'
import { localYmd } from './localYmd'
import { offlineMeta } from './meta'
import {
  upsertArticulo,
  upsertCliente,
  upsertEstadoCredito,
  upsertPedidoCache,
  upsertRubro,
  upsertSellerPolicies,
  upsertStockSnapshot,
  upsertPlantillaPedido,
  upsertSugerenciasPedido,
  upsertUltimoPedidoRepeat,
  upsertVisita,
} from './repos'
import type { OfflineHydrateStats } from './types'

const PAGE = 500
const MAX_CLIENT_PAGES = 4
const MAX_ARTICULO_PAGES = 8
const PEDIDOS_PER_AGENDA_CLIENT = 5
const STOCK_CHUNK = 100

type Paginated<T> = {
  success: boolean
  data: T[]
  total?: number
  limit?: number
  offset?: number
}

/**
 * @en Pulls day cache from API into SQLite (online only).
 * @es Descarga el cache del día desde la API a SQLite (solo online).
 * @pt-BR Baixa o cache do dia da API para SQLite (somente online).
 */
export async function hydrateOfflineCache(opts?: {
  fecha?: string
  vendedorId?: number
}): Promise<OfflineHydrateStats> {
  const db = await getOfflineDb()
  const fecha = opts?.fecha ?? localYmd()
  const stats: OfflineHydrateStats = {
    clientes: 0,
    articulos: 0,
    rubros: 0,
    visitas: 0,
    pedidos: 0,
    estadoCredito: 0,
    stockItems: 0,
    plantillas: 0,
    sugerencias: 0,
  }

  for (let page = 0; page < MAX_CLIENT_PAGES; page++) {
    const res = await sellerHttp.get<Paginated<Record<string, unknown>>>('/clientes', {
      params: { q: '', limit: PAGE, offset: page * PAGE },
    })
    const rows = res.data.data ?? []
    for (const c of rows) {
      await upsertCliente(db, c)
      stats.clientes += 1
    }
    if (rows.length < PAGE) break
  }

  const articuloIds: number[] = []
  for (let page = 0; page < MAX_ARTICULO_PAGES; page++) {
    const rows = await articulosAPI.list('', { limit: PAGE, offset: page * PAGE })
    const list = Array.isArray(rows) ? rows : []
    for (const a of list) {
      await upsertArticulo(db, a as unknown as Record<string, unknown>)
      stats.articulos += 1
      if (typeof a.id === 'number') articuloIds.push(a.id)
    }
    if (list.length < PAGE) break
  }

  const rubros = await rubrosAPI.list({ limit: 200 })
  for (const r of Array.isArray(rubros) ? rubros : []) {
    await upsertRubro(db, r as unknown as Record<string, unknown>)
    stats.rubros += 1
  }

  const visitasRes = await visitasAPI.list({
    fecha,
    vendedorId: opts?.vendedorId,
    limit: PAGE,
  })
  const visitas = Array.isArray(visitasRes.data) ? visitasRes.data : []
  const clienteIds = new Set<number>()
  for (const v of visitas) {
    await upsertVisita(db, v as unknown as Record<string, unknown>)
    stats.visitas += 1
    if (typeof v.clienteId === 'number') clienteIds.add(v.clienteId)
  }

  for (const clienteId of clienteIds) {
    try {
      const pedRes = await pedidosAPI.list({
        clienteId,
        limit: PEDIDOS_PER_AGENDA_CLIENT,
      })
      for (const p of pedRes?.data ?? []) {
        await upsertPedidoCache(db, p as unknown as Record<string, unknown>)
        stats.pedidos += 1
      }
    } catch {
      // best-effort: agenda clients may lack pedidos permission edge cases
    }
  }

  try {
    const policies = await sellerAlertsAPI.getSellerPolicies()
    await upsertSellerPolicies(db, policies as unknown as Record<string, unknown>)
  } catch {
    // policies optional for offline
  }

  for (const clienteId of clienteIds) {
    try {
      const credit = await sellerAlertsAPI.getEstadoCredito(clienteId)
      await upsertEstadoCredito(db, clienteId, credit as unknown as Record<string, unknown>)
      stats.estadoCredito += 1
    } catch {
      // best-effort per cliente
    }
    try {
      const plantillas = await plantillasPedidoAPI.list(clienteId)
      for (const pl of plantillas) {
        await upsertPlantillaPedido(db, pl as unknown as Record<string, unknown>)
        stats.plantillas += 1
      }
    } catch {
      // best-effort templates
    }
    try {
      const prefill = await plantillasPedidoAPI.getUltimoPedidoRepeat(clienteId)
      await upsertUltimoPedidoRepeat(db, clienteId, prefill as unknown as Record<string, unknown>)
    } catch {
      // no last order is fine
    }
    try {
      const sug = await sugerenciasPedidoAPI.get(clienteId)
      await upsertSugerenciasPedido(db, clienteId, sug as unknown as Record<string, unknown>)
      stats.sugerencias += 1
    } catch {
      // best-effort suggestions
    }
  }

  const stockItems: unknown[] = []
  let stockAsOf = new Date().toISOString()
  for (let i = 0; i < articuloIds.length; i += STOCK_CHUNK) {
    const chunk = articuloIds.slice(i, i + STOCK_CHUNK)
    try {
      const snap = await sellerAlertsAPI.getStockMultiple(chunk)
      stockAsOf = snap.asOf
      stockItems.push(...snap.items)
      stats.stockItems += snap.items.length
    } catch {
      // best-effort chunk
    }
  }
  if (stockItems.length > 0) {
    await upsertStockSnapshot(db, { asOf: stockAsOf, items: stockItems })
  }

  offlineMeta.setCacheDay(fecha)
  offlineMeta.setLastHydrateAt(new Date().toISOString())
  return stats
}
