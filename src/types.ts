export interface Cliente {
  id: number
  codigo: number
  rsocial: string
  fantasia?: string
  cuit?: string
  condIva: string // RI, Mono, CF, Exento
  domicilio?: string
  localidad?: string
  cpost?: string
  telef?: string
  email?: string
  formaPago?: number
  activo: boolean
  // Financial fields (Issue #31)
  creditLimit?: number | string | null
  creditDays?: number
  balance?: number | string
  balanceInicial?: number | string
  score?: number
  suspended?: boolean
  deliveryZoneId?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Articulo {
  id: number
  codigo: number
  descripcion: string
  rubroId: number
  rubro?: Rubro
  condIva: string // 1=21%, 2=10.5%, 3=Exento
  umedida: string
  precioLista1: number | string
  precioLista2: number | string
  costo: number | string
  stock: number
  minimo: number
  activo: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Rubro {
  id: number
  codigo: number
  nombre: string
}

export interface Proveedor {
  id: number
  codigo: number
  rsocial: string
  fantasia?: string | null
  cuit?: string | null
  condIva: string
  telef?: string | null
  email?: string | null
  activo: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface FormaPago {
  id: number
  codigo: number
  descripcion: string
  vto_dias: number
}

export interface Factura {
  id: number
  fecha: Date | string
  tipo: string // A, B, C, X
  prefijo: string
  numero: number
  clienteId: number
  cliente?: Cliente
  neto1: number | string
  neto2: number | string
  neto3: number | string
  iva1: number | string
  iva2: number | string
  total: number | string
  formaPagoId?: number
  estado: string // A, N (anulada)
  items?: FacturaItem[]
  createdAt?: Date
  updatedAt?: Date
}

export interface FacturaItem {
  id: number
  facturaId: number
  articuloId: number
  articulo?: Articulo
  cantidad: number
  precio: number | string
  dscto: number | string
  subtotal: number | string
  createdAt?: Date
}

export interface DeliveryZone {
  id: number
  tenantId: number
  nombre: string
  /** barrio | manual | predefinida */
  tipo: string
  diasEntrega?: string | null
  horario?: string | null
  activo: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ParamEmpresa {
  id: number
  nombre: string
  cuit: string
  domicilio?: string
}
