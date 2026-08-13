import type { PedidoCondicionCobro, PedidoInput, PedidoItemInput } from '@bizcode/types'
import type { PedidoCondicionCobroUi, SellerCartLine } from './cartTypes'

/**
 * @en Line subtotal after percent discount.
 * @es Subtotal de línea tras descuento porcentual.
 * @pt-BR Subtotal da linha após desconto percentual.
 */
export function lineSubtotal(line: Pick<SellerCartLine, 'cantidad' | 'precio' | 'dscto'>): number {
  const gross = line.cantidad * line.precio
  const net = gross - (gross * line.dscto) / 100
  return Math.round(net * 100) / 100
}

/**
 * @en Sum of cart line subtotals.
 * @es Suma de subtotales del carrito.
 * @pt-BR Soma dos subtotais do carrinho.
 */
export function cartTotal(lines: SellerCartLine[]): number {
  const sum = lines.reduce((acc, line) => acc + lineSubtotal(line), 0)
  return Math.round(sum * 100) / 100
}

/**
 * @en Applies the same line discount percent to every cart line (#264).
 * @es Aplica el mismo descuento porcentual a todas las líneas del carrito (#264).
 * @pt-BR Aplica o mesmo desconto percentual a todas as linhas do carrinho (#264).
 */
export function applyDsctoToAll<T extends { dscto: number }>(lines: T[], pct: number): T[] {
  const clamped = Math.min(100, Math.max(0, pct))
  return lines.map((line) => ({ ...line, dscto: clamped }))
}

/**
 * @en Maps cart lines to PedidoItemInput[] for POST /api/pedidos.
 * @es Mapea líneas del carrito a PedidoItemInput[] para POST /api/pedidos.
 * @pt-BR Mapeia linhas do carrinho para PedidoItemInput[] no POST /api/pedidos.
 */
export function toPedidoItems(lines: SellerCartLine[]): PedidoItemInput[] {
  return lines.map((line) => ({
    articuloId: line.articuloId,
    cantidad: line.cantidad,
    precio: line.precio,
    dscto: line.dscto,
    subtotal: lineSubtotal(line),
  }))
}

export type BuildPedidoBodyArgs = {
  clienteId: number
  lines: SellerCartLine[]
  observaciones?: string | null
  condicionCobro?: PedidoCondicionCobroUi | null
  plazoDias?: number | null
  vendedorId?: number | null
}

/**
 * @en Builds PedidoInput body for create (client sends lines; server recalculates subtotals).
 * @es Arma el body PedidoInput para create (el cliente envía líneas; el server recalcula).
 * @pt-BR Monta o body PedidoInput para create (cliente envia linhas; servidor recalcula).
 */
export function buildPedidoBody(args: BuildPedidoBodyArgs): PedidoInput {
  const body: PedidoInput = {
    clienteId: args.clienteId,
    items: toPedidoItems(args.lines),
  }
  if (args.vendedorId != null) {
    body.vendedorId = args.vendedorId
  }
  if (args.observaciones !== undefined) {
    body.observaciones = args.observaciones
  }
  if (args.condicionCobro !== undefined && args.condicionCobro !== null) {
    body.condicionCobro = args.condicionCobro as PedidoCondicionCobro
  }
  if (args.condicionCobro === 'plazo' && args.plazoDias != null) {
    body.plazoDias = args.plazoDias
  }
  return body
}

/**
 * @en True when any line quantity exceeds available stock (warning only).
 * @es True si alguna cantidad supera el stock (solo advertencia).
 * @pt-BR True se alguma quantidade supera o estoque (apenas aviso).
 */
export function hasStockWarnings(lines: SellerCartLine[]): boolean {
  return lines.some((line) => line.cantidad > line.stock)
}

/**
 * @en Available credit = creditLimit - saldo (null if unknown).
 * @es Crédito disponible = límite - saldo (null si desconocido).
 * @pt-BR Crédito disponível = limite - saldo (null se desconhecido).
 */
export function availableCredit(
  saldo: number | null | undefined,
  creditLimit: number | null | undefined,
): number | null {
  if (saldo == null || creditLimit == null || !Number.isFinite(creditLimit)) {
    return null
  }
  return Math.round((creditLimit - saldo) * 100) / 100
}
