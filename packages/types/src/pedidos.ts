import type { PaginatedResponse } from './api-contracts'

export type PedidoEstado = 'draft' | 'confirmed' | 'invoiced' | 'cancelled'

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
