import type { PaginatedResponse } from './api-contracts'

/** BP1-1 (#391): commercial + logistics + collection lifecycle keys. */
export type PedidoEstado =
  | 'draft'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'invoiced'
  | 'collected'
  | 'cancelled'

/** @en Intended collection terms on Pedido (#169). @es Condición de cobro prevista en Pedido (#169). @pt-BR Condição de cobrança prevista no Pedido (#169). */
export type PedidoCondicionCobro = 'contado' | 'cuenta_corriente' | 'plazo'

export type PedidoRow = {
  id: number
  clienteId: number
  vendedorId: number | null
  estado: PedidoEstado
  total: number | string
  validUntil: string | null
  facturaId: number | null
  observaciones?: string | null
  condicionCobro?: PedidoCondicionCobro | null
  plazoDias?: number | null
  createdAt: string
  updatedAt: string
  cliente?: { id: number; codigo: number; rsocial: string }
  items?: unknown[]
}

export type PedidoListResponse = PaginatedResponse<PedidoRow> & { success: boolean }

/** Body for `POST /api/pedidos/:id/transitions`. */
export type PedidoTransitionInput = {
  to: Exclude<PedidoEstado, 'draft'>
}
