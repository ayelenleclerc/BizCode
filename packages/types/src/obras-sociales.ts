/**
 * @en Types for pharmacy insurer / prepaid (obra social) vertical (#252).
 * @es Tipos del vertical farmacia obras sociales / prepagas (#252).
 * @pt-BR Tipos do vertical farmácia planos de saúde / prepagas (#252).
 */

export const OS_TIPO_PRODUCTOS = ['generico', 'marca', 'cronico', 'oncologico'] as const
export type OsTipoProducto = (typeof OS_TIPO_PRODUCTOS)[number]

export const VENTA_OS_ESTADOS = [
  'pendiente_cobro_os',
  'presentado',
  'cobrado',
  'rechazado_os',
] as const
export type VentaOsEstado = (typeof VENTA_OS_ESTADOS)[number]

export const PRESENTACION_OS_ESTADOS = [
  'generada',
  'presentada',
  'cobrada',
  'con_rechazos',
] as const
export type PresentacionOsEstado = (typeof PRESENTACION_OS_ESTADOS)[number]

export type CoberturaOSRow = {
  id: number
  tenantId: number
  obraSocialId: number
  tipoProducto: OsTipoProducto
  cobertura: number
  createdAt: string
  updatedAt: string
}

export type ObraSocialRow = {
  id: number
  tenantId: number
  nombre: string
  codigo: string
  activa: boolean
  createdAt: string
  updatedAt: string
  coberturas?: CoberturaOSRow[]
}

export type ObraSocialCreateInput = {
  nombre: string
  codigo: string
  activa?: boolean
  coberturas?: ReadonlyArray<{ tipoProducto: OsTipoProducto; cobertura: number }>
}

export type ObraSocialUpdateInput = {
  nombre?: string
  codigo?: string
  activa?: boolean
}

export type CoberturaOSUpsertInput = {
  tipoProducto: OsTipoProducto
  cobertura: number
}

export type VentaOSItemInput = {
  articuloId?: number | null
  descripcion: string
  tipoProducto: OsTipoProducto
  cantidad: number
  precioUnitario: number
}

export type VentaConOSCreateInput = {
  clienteId: number
  obraSocialId: number
  nroAfiliado: string
  nroReceta?: string | null
  facturaId?: number | null
  items: ReadonlyArray<VentaOSItemInput>
}

export type VentaOSItemRow = {
  id: number
  tenantId: number
  ventaConOSId: number
  articuloId: number | null
  descripcion: string
  tipoProducto: OsTipoProducto
  cantidad: number
  precioUnitario: number
  subtotal: number
  coberturaPct: number
  creditoOS: number
  copago: number
}

export type VentaConOSRow = {
  id: number
  tenantId: number
  facturaId: number | null
  clienteId: number
  obraSocialId: number
  nroAfiliado: string
  nroReceta: string | null
  totalVenta: number
  copagoPaciente: number
  creditoOS: number
  estado: VentaOsEstado
  presentacionId: number | null
  fecha: string
  createdAt: string
  updatedAt: string
  items?: VentaOSItemRow[]
  obraSocial?: { id: number; nombre: string; codigo: string } | null
  cliente?: { id: number; rsocial: string } | null
}

export type PresentacionOSRechazoRow = {
  id: number
  tenantId: number
  presentacionId: number
  ventaConOSId: number
  ventaOSItemId: number | null
  importeRechazado: number
  motivo: string | null
  createdAt: string
}

export type PresentacionOSRow = {
  id: number
  tenantId: number
  obraSocialId: number
  periodo: string
  totalCredito: number
  estado: PresentacionOsEstado
  archivoCsvName: string | null
  fechaPago: string | null
  importeCobrado: number | null
  createdAt: string
  updatedAt: string
  obraSocial?: { id: number; nombre: string; codigo: string } | null
  ventasCount?: number
  rechazos?: PresentacionOSRechazoRow[]
}

export type PresentacionOSCreateInput = {
  obraSocialId: number
  periodo: string
}

export type PresentacionOSCobroInput = {
  importeCobrado: number
  fechaPago?: string
}

export type PresentacionOSRechazoInput = {
  ventaConOSId: number
  ventaOSItemId?: number | null
  importeRechazado: number
  motivo?: string | null
}

export type ObraSocialCuentaCorrienteRow = {
  obraSocialId: number
  nombre: string
  codigo: string
  creditoPendiente: number
  creditoPresentado: number
  creditoCobrado: number
  creditoRechazado: number
  saldoAbierto: number
}
