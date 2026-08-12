/**
 * @en Pure ranking helpers for App Seller order suggestions (#254).
 * @es Helpers puros de ranking para sugerencias de pedido App Seller (#254).
 * @pt-BR Helpers puros de ranking para sugestões de pedido App Seller (#254).
 */

export const SUGERENCIAS_WINDOW_MS = 183 * 24 * 60 * 60 * 1000 // ~6 months
export const SUGERENCIAS_TOP_N = 20
export const SUGERENCIAS_QTY_LOOKBACK = 3
export const SUGERENCIAS_INTERVAL_PEDIDOS = 6
export const SUGERENCIAS_ANOMALY_RATIO = 1.4
export const SUGERENCIAS_CACHE_TTL_SECONDS = 3600

export type HabitualPurchaseEvent = {
  articuloId: number
  pedidoId: number
  cantidad: number
  createdAt: Date
}

export type HabitualRankRow = {
  articuloId: number
  pedidoCount: number
  lastBoughtAt: Date
  recentCantidades: number[]
}

/**
 * @en Whole days between two dates (floor, non-negative).
 * @es Días enteros entre dos fechas (piso, no negativo).
 * @pt-BR Dias inteiros entre duas datas (piso, não negativo).
 */
export function daysBetween(later: Date, earlier: Date): number {
  const ms = later.getTime() - earlier.getTime()
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.floor(ms / 86_400_000)
}

/**
 * @en Average interval in days between consecutive pedido timestamps (newest first).
 * @es Intervalo promedio en días entre timestamps de pedidos consecutivos (más reciente primero).
 * @pt-BR Intervalo médio em dias entre timestamps de pedidos consecutivos (mais recente primeiro).
 */
export function averagePedidoIntervalDays(pedidoDatesDesc: Date[]): number | null {
  if (pedidoDatesDesc.length < 2) return null
  const take = pedidoDatesDesc.slice(0, SUGERENCIAS_INTERVAL_PEDIDOS)
  if (take.length < 2) return null
  let sum = 0
  let n = 0
  for (let i = 0; i < take.length - 1; i++) {
    const d = daysBetween(take[i], take[i + 1])
    if (d > 0) {
      sum += d
      n += 1
    }
  }
  if (n === 0) return null
  return sum / n
}

/**
 * @en Rounds a suggested qty to multiploVenta (or whole units ≥ 1).
 * @es Redondea cantidad sugerida a multiploVenta (o enteros ≥ 1).
 * @pt-BR Arredonda quantidade sugerida para multiploVenta (ou inteiros ≥ 1).
 */
export function roundSuggestedQty(avg: number, multiploVenta: number | null | undefined): number {
  if (!Number.isFinite(avg) || avg <= 0) return 1
  const multiplo =
    multiploVenta != null && Number.isFinite(multiploVenta) && multiploVenta > 0
      ? multiploVenta
      : 1
  const rounded = Math.round(avg / multiplo) * multiplo
  if (rounded <= 0) return multiplo
  // Avoid floating dust for common decimals
  return Math.round(rounded * 10_000) / 10_000
}

/**
 * @en True when days since last buy exceeds 1.4× average frequency.
 * @es True cuando los días desde la última compra superan 1.4× la frecuencia promedio.
 * @pt-BR True quando os dias desde a última compra excedem 1.4× a frequência média.
 */
export function isFrequencyAnomaly(diasDesdeUltima: number, frecuenciaDias: number | null): boolean {
  if (frecuenciaDias == null || frecuenciaDias <= 0) return false
  return diasDesdeUltima / frecuenciaDias > SUGERENCIAS_ANOMALY_RATIO
}

/**
 * @en Ranks SKUs by distinct pedido count then recency; keeps qty lookback.
 * @es Rankea SKUs por pedidos distintos y recencia; conserva lookback de cantidades.
 * @pt-BR Classifica SKUs por pedidos distintos e recência; mantém lookback de quantidades.
 */
export function rankHabitualPurchases(events: HabitualPurchaseEvent[]): HabitualRankRow[] {
  const bySku = new Map<
    number,
    {
      pedidoIds: Set<number>
      lastBoughtAt: Date
      // newest first
      recentCantidades: number[]
    }
  >()

  const sorted = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  for (const ev of sorted) {
    let row = bySku.get(ev.articuloId)
    if (!row) {
      row = { pedidoIds: new Set(), lastBoughtAt: ev.createdAt, recentCantidades: [] }
      bySku.set(ev.articuloId, row)
    }
    row.pedidoIds.add(ev.pedidoId)
    if (ev.createdAt.getTime() > row.lastBoughtAt.getTime()) {
      row.lastBoughtAt = ev.createdAt
    }
    if (row.recentCantidades.length < SUGERENCIAS_QTY_LOOKBACK) {
      row.recentCantidades.push(ev.cantidad)
    }
  }

  const rows: HabitualRankRow[] = [...bySku.entries()].map(([articuloId, row]) => ({
    articuloId,
    pedidoCount: row.pedidoIds.size,
    lastBoughtAt: row.lastBoughtAt,
    recentCantidades: row.recentCantidades,
  }))

  rows.sort((a, b) => {
    if (b.pedidoCount !== a.pedidoCount) return b.pedidoCount - a.pedidoCount
    return b.lastBoughtAt.getTime() - a.lastBoughtAt.getTime()
  })
  return rows
}

/**
 * @en Discount percent of list vs offer price (0–100, 1 decimal).
 * @es Porcentaje de descuento lista vs oferta (0–100, 1 decimal).
 * @pt-BR Percentual de desconto lista vs oferta (0–100, 1 decimal).
 */
export function discountPct(precioLista: number, precioOferta: number): number {
  if (!Number.isFinite(precioLista) || precioLista <= 0) return 0
  if (!Number.isFinite(precioOferta) || precioOferta < 0) return 0
  const pct = ((precioLista - precioOferta) / precioLista) * 100
  if (pct <= 0) return 0
  return Math.round(pct * 10) / 10
}
