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

export type PedidoRow = {
  id: number
  clienteId: number
  vendedorId: number | null
  estado: PedidoEstado
  total: number | string
  validUntil: string | null
  facturaId: number | null
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
