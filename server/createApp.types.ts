/** Shared REST body types used by [`createApp`](./createApp.ts) and [`schemas/domain`](./schemas/domain.ts). */

export type ClienteInput = {
  codigo: number
  rsocial: string
  condIva: 'RI' | 'Mono' | 'CF' | 'Exento'
  activo: boolean
  fantasia?: string | null
  cuit?: string | null
  domicilio?: string | null
  localidad?: string | null
  cpost?: string | null
  telef?: string | null
  email?: string | null
  creditLimit?: number | null
  creditDays?: number
  suspended?: boolean
  deliveryZoneId?: number | null
}

export type ArticuloInput = {
  codigo: number
  descripcion: string
  rubroId: number
  condIva: '1' | '2' | '3'
  umedida: string
  precioLista1: number
  precioLista2: number
  costo: number
  stock: number
  minimo: number
  activo: boolean
}

export type RubroInput = {
  codigo: number
  nombre: string
}

export type ProveedorInput = {
  codigo: number
  rsocial: string
  condIva: ClienteInput['condIva']
  activo: boolean
  fantasia?: string | null
  cuit?: string | null
  telef?: string | null
  email?: string | null
}

export type FacturaItemInput = {
  articuloId: number
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
}

export type FacturaInput = {
  fecha: string
  tipo: 'A' | 'B'
  prefijo?: string
  numero: number
  clienteId: number
  formaPagoId?: number | null
  neto1: number
  neto2: number
  neto3: number
  iva1: number
  iva2: number
  total: number
  items: FacturaItemInput[]
}

export type DeliveryZoneCreateParsed = {
  nombre: string
  tipo: 'barrio' | 'manual' | 'predefinida'
  diasEntrega: string | null
  horario: string | null
}

export type DeliveryZoneUpdateParsed = {
  nombre?: string
  tipo?: 'barrio' | 'manual' | 'predefinida'
  diasEntrega?: string | null
  horario?: string | null
  activo?: boolean
}
