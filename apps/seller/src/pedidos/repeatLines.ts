import type { PedidoPrefill } from '@bizcode/types'
import type { SellerCartLine } from './cartTypes'

/**
 * @en Maps API prefill lines into seller cart lines (#253).
 * @es Mapea líneas de precarga API al carrito Seller (#253).
 * @pt-BR Mapeia linhas de pré-carga da API para o carrinho Seller (#253).
 */
export function prefillToCartLines(prefill: PedidoPrefill): SellerCartLine[] {
  return prefill.lines.map((line) => ({
    articuloId: line.articuloId,
    descripcion: line.descripcion,
    precio: line.precio,
    stock: line.stock,
    cantidad: line.cantidad,
    dscto: 0,
    condIva: line.condIva,
  }))
}

/**
 * @en Whole days elapsed since an ISO timestamp (#253).
 * @es Días enteros transcurridos desde un ISO (#253).
 * @pt-BR Dias inteiros desde um timestamp ISO (#253).
 */
export function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 0
  const ms = now.getTime() - then.getTime()
  if (ms <= 0) return 0
  return Math.floor(ms / 86_400_000)
}
