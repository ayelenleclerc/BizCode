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
  /** @en articulo | servicio (#244). @es articulo | servicio (#244). @pt-BR articulo | serviço (#244). */
  tipo?: 'articulo' | 'servicio'
  unidadServicio?: string | null
  precioLista1: number | string
  precioLista2: number | string
  costo: number | string
  stock: number
  minimo: number
  activo: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Cobro {
  id: number
  tenantId?: number
  clienteId: number
  fecha: string | Date
  monto: number | string
  formaPagoId?: number | null
  referencia?: string | null
  nota?: string | null
  cliente?: Pick<Cliente, 'id' | 'codigo' | 'rsocial'>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Rubro {
  id: number
  codigo: number
  nombre: string
}

export type ProveedorTipoCuenta = 'cc' | 'ca'
export type ProveedorCondicionPago = 'contado' | '15dias' | '30dias' | '60dias' | 'otro'
export type ProveedorCategoria = 'materia_prima' | 'insumos' | 'servicios' | 'logistica'

export type MovimientoProveedorCCTipo = 'factura_compra' | 'pago' | 'nc_proveedor' | 'ajuste'

export type MovimientoClienteCCTipo =
  | 'saldo_inicial'
  | 'factura'
  | 'nota_credito'
  | 'cobro'
  | 'retencion'
  | 'percepcion'
  | 'cheque_rechazado'
  | 'ajuste'

export interface MovimientoClienteCC {
  id: number
  tipo: MovimientoClienteCCTipo
  referencia: string | null
  monto: string
  saldoPost: string
  fecha: string
  usuarioId: number
  notas: string | null
  facturaId?: number
  cobroId?: number
  notaCreditoId?: number
  chequeId?: number
  retencionAplicadaId?: number
}

export interface ClienteCuentaCorrienteChartPoint {
  period: string
  saldo: string
}

export interface ClienteCuentaCorriente {
  clienteId: number
  codigo: number
  rsocial: string
  saldo: string
  creditLimit: string | null
  excedeLimite: boolean
  movimientos: MovimientoClienteCC[]
  serie: ClienteCuentaCorrienteChartPoint[]
  total: number
  limit: number
  offset: number
}

export interface ClienteCuentaCorrienteSaldo {
  clienteId: number
  saldo: string
  creditLimit: string | null
  excedeLimite: boolean
}

export interface ClienteCuentaCorrienteAntiguedad {
  clienteId: number
  buckets: Array<{ label: '0-30' | '31-60' | '61-90' | '+90'; total: string }>
  totalPendiente: string
}

export interface MovimientoProveedorCC {
  id: number
  tipo: MovimientoProveedorCCTipo
  referencia: string | null
  monto: string
  saldoPost: string
  fecha: string
  usuarioId: number
  notas: string | null
}

export interface ProveedorCuentaCorrienteChartPoint {
  period: string
  saldo: string
}

export interface ProveedorCuentaCorriente {
  proveedorId: number
  codigo: number
  rsocial: string
  saldo: string
  limiteCredito: string | null
  excedeLimite: boolean
  movimientos: MovimientoProveedorCC[]
  serie: ProveedorCuentaCorrienteChartPoint[]
}

export interface ProveedorCuentaCorrienteSaldo {
  proveedorId: number
  saldo: string
  limiteCredito: string | null
  excedeLimite: boolean
}

export type ReciboPagoMetodo = 'transferencia' | 'cheque' | 'efectivo' | 'echeq'

export interface ReciboPagoFactura {
  id: number
  comprobanteCompraId: number | null
  facturaRef: string
  monto: string
}

export interface ReciboPagoRetencion {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
}

export interface ReciboPago {
  id: number
  numero: number
  proveedorId: number
  fecha: string
  total: string
  totalBruto: string
  metodoPago: ReciboPagoMetodo
  cbu: string | null
  referencia: string | null
  estado: string
  notas: string | null
  usuarioId: number
  proveedor: { id: number; codigo: number; rsocial: string; cuit: string | null }
  usuario: { id: number; username: string }
  facturas: ReciboPagoFactura[]
  retenciones: ReciboPagoRetencion[]
  createdAt: string
}

export interface ComprobantePendiente {
  comprobanteCompraId: number
  facturaRef: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
}

export type ReciboCobroFormaTipo =
  | 'efectivo'
  | 'transferencia'
  | 'cheque'
  | 'mercadopago'
  | 'tarjeta'
  | 'otro'

export interface ReciboCobroForma {
  id: number
  tipo: ReciboCobroFormaTipo
  importe: string
  chequeId: number | null
  referencia: string | null
  banco: string | null
  chequeNumero: string | null
  chequeBanco: string | null
}

export interface ReciboCobroImputacion {
  id: number
  facturaId: number
  facturaRef: string
  importe: string
  saldoPrevio: string
  saldoPostPago: string
}

export interface ReciboCobroRetencion {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
}

export interface ReciboCobro {
  id: number
  numero: number
  clienteId: number
  fecha: string
  totalCobrado: string
  totalBruto: string
  concepto: string | null
  estado: string
  anulacionMotivo: string | null
  usuarioId: number
  cliente: { id: number; codigo: number; rsocial: string; cuit: string | null }
  usuario: { id: number; username: string }
  formas: ReciboCobroForma[]
  imputaciones: ReciboCobroImputacion[]
  retenciones: ReciboCobroRetencion[]
  createdAt: string
}

export interface FacturaPendienteCliente {
  facturaId: number
  facturaRef: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
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
  cbu?: string | null
  alias?: string | null
  banco?: string | null
  tipoCuenta?: ProveedorTipoCuenta | null
  moneda?: string
  condicionPago?: ProveedorCondicionPago | null
  plazoHabitual?: number | null
  descuentoPct?: number | string | null
  limiteCredito?: number | string | null
  categoria?: ProveedorCategoria | null
  contactoNombre?: string | null
  contactoEmail?: string | null
  contactoTel?: string | null
  notas?: string | null
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
  mpPreferenceId?: string | null
  mpPaymentLink?: string | null
  mpEstado?: string | null
  mpPagadoAt?: Date | string | null
  mpPreferenceExpiresAt?: Date | string | null
  cae?: string | null
  caeVto?: Date | string | null
  estadoCae?: 'pending' | 'issued' | 'failed' | null
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

export interface EmpresaConfig {
  id: number | null
  nombre: string
  cuit: string
  domicilio: string | null
  puntoVenta: number
  tipoFactura: 'A' | 'B' | 'C'
  logoUrl: string | null
  prefijoFactura: string
  recordatorioDiasGracia: number
  timezone: string
  recordatorioHoraInicio: number
  recordatorioHoraFin: number
  condicionIva: 'RI' | 'Mono' | 'CF' | 'Exento'
  ingresosBrutos: string | null
  fechaInicioActividades: string | null
}

/** @deprecated Use EmpresaConfig — kept for legacy references */
export interface ParamEmpresa {
  id: number
  nombre: string
  cuit: string
  domicilio?: string
}
