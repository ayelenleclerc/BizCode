/**
 * @en Order template + last-order prefill types for App Seller (#253).
 * @es Tipos de plantilla de pedido y precarga del último pedido App Seller (#253).
 * @pt-BR Tipos de modelo de pedido e pré-carga do último pedido App Seller (#253).
 */

export type RepeatOmitReason = 'inactive' | 'parent' | 'missing' | 'service'

export type PedidoPrefillLine = {
  articuloId: number
  descripcion: string
  precio: number
  stock: number
  cantidad: number
  condIva: string
}

export type PedidoPrefillOmitted = {
  articuloId: number | null
  descripcion: string
  reason: RepeatOmitReason
}

export type PedidoPrefillSource = 'last_pedido' | 'plantilla'

export type PedidoPrefill = {
  source: PedidoPrefillSource
  pedidoId: number | null
  plantillaId: number | null
  total: string
  createdAt: string | null
  lines: PedidoPrefillLine[]
  omitted: PedidoPrefillOmitted[]
  omittedCount: number
}

export type PlantillaPedidoItem = {
  id: number
  articuloId: number
  cantidad: number
  activo: boolean
  orden: number
  descripcion?: string
}

export type PlantillaPedido = {
  id: number
  tenantId: number
  clienteId: number
  vendedorId: number | null
  nombre: string
  activa: boolean
  createdAt: string
  updatedAt: string
  items: PlantillaPedidoItem[]
}

export type PlantillaPedidoItemInput = {
  articuloId: number
  cantidad: number
  activo?: boolean
  orden?: number
}

export type PlantillaPedidoCreateInput = {
  nombre: string
  activa?: boolean
  vendedorId?: number | null
  items: PlantillaPedidoItemInput[]
}

export type PlantillaPedidoPatchInput = {
  nombre?: string
  activa?: boolean
  items?: PlantillaPedidoItemInput[]
}
