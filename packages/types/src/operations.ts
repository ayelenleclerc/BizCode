export type OrdenCompraItemRow = {
  id: number
  articuloId: number
  codigoProveedor?: string | null
  descripcionProveedor?: string | null
  cantidad: number
  cantidadRecibida: number
  costoUnitario: string
  subtotal: string
  articulo?: { id: number; codigo: number; descripcion: string }
}

export type OrdenCompra = {
  id: number
  proveedorId: number
  estado: string
  total: string
  fechaEstimada?: string | null
  nota?: string | null
  proveedor?: { id: number; codigo: number; rsocial: string }
  items: OrdenCompraItemRow[]
}

export type RecuentoItemRow = {
  id: number
  articuloId: number
  cantSistema: number
  cantFisica: number | null
  articulo?: { id: number; codigo: number; descripcion: string }
}

export type Recuento = {
  id: number
  operadorId: number
  estado: 'in_progress' | 'closed'
  fecha: string
  closedAt?: string | null
  operador?: { id: number; username: string }
  items: RecuentoItemRow[]
}

export type RecuentoEstado = Recuento['estado']
