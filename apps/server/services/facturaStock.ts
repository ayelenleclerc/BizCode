import type { FacturaItemInput } from '@bizcode/types'

export type ArticuloStockSnapshot = {
  id: number
  codigo: number
  descripcion: string
  stock: number
  minimo: number
  /** @en articulo | servicio (#244). @es articulo | servicio (#244). @pt-BR articulo | serviço (#244). */
  tipo: string
}

export type StockBelowMinimumAlert = {
  articuloId: number
  codigo: number
  descripcion: string
  stock: number
  minimo: number
}

/**
 * @en Aggregates invoice line quantities for physical catalog articles only (#244).
 * @es Agrupa cantidades solo para artículos físicos del catálogo (#244).
 * @pt-BR Agrega quantidades só para artigos físicos do catálogo (#244).
 */
export function aggregateItemQuantities(
  items: FacturaItemInput[],
  articuloTipoById?: Map<number, string>,
): Map<number, number> {
  const qtyByArticulo = new Map<number, number>()
  for (const item of items) {
    const id = item.articuloId
    if (id == null || id < 1) continue
    if (articuloTipoById && articuloTipoById.get(id) === 'servicio') continue
    qtyByArticulo.set(id, (qtyByArticulo.get(id) ?? 0) + item.cantidad)
  }
  return qtyByArticulo
}

/**
 * @en Validates stock will not go negative; returns alerts when result stock is below minimum.
 * @es Valida que el stock no quede negativo; alertas si queda bajo el mínimo.
 * @pt-BR Valida que o estoque não fique negativo; alertas se ficar abaixo do mínimo.
 */
export function evaluateStockForInvoice(
  articulos: ArticuloStockSnapshot[],
  qtyByArticulo: Map<number, number>,
): { insufficient: boolean; alerts: StockBelowMinimumAlert[] } {
  const byId = new Map(articulos.map((a) => [a.id, a]))
  const alerts: StockBelowMinimumAlert[] = []

  for (const [articuloId, qty] of qtyByArticulo) {
    const art = byId.get(articuloId)
    if (!art) continue
    if (art.tipo === 'servicio') continue
    const stockAfter = art.stock - qty
    if (stockAfter < 0) {
      return { insufficient: true, alerts: [] }
    }
    if (stockAfter < art.minimo) {
      alerts.push({
        articuloId: art.id,
        codigo: art.codigo,
        descripcion: art.descripcion,
        stock: stockAfter,
        minimo: art.minimo,
      })
    }
  }

  return { insufficient: false, alerts }
}
