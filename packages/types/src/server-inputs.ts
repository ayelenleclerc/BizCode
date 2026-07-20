/**
 * @en REST request body types for Express routes and Zod schemas in apps/server.
 * @es Tipos de cuerpo REST para rutas Express y esquemas Zod en apps/server.
 * @pt-BR Tipos de corpo REST para rotas Express e schemas Zod em apps/server.
 */

import type {
  MovimientoClienteCCTipo,
  MovimientoProveedorCCTipo,
  ProveedorCategoria,
  ProveedorCondicionPago,
  ProveedorTipoCuenta,
  ReciboCobroFormaTipo,
  ReciboPagoMetodo,
} from './domain'
import type { OrdenEntregaEstado, RepartoEstado, RepartoItemEstado, RepartoItemPodInput } from './logistics'
import type { RecuentoEstado } from './operations'
import type { PedidoEstado } from './pedidos'

export type {
  MovimientoClienteCCTipo,
  MovimientoProveedorCCTipo,
  OrdenEntregaEstado,
  PedidoEstado,
  ProveedorCategoria,
  ProveedorCondicionPago,
  ProveedorTipoCuenta,
  ReciboCobroFormaTipo,
  ReciboPagoMetodo,
  RecuentoEstado,
  RepartoEstado,
  RepartoItemEstado,
  RepartoItemPodInput,
}

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

/** @en Catalog item kind (#244). @es Tipo de ítem de catálogo (#244). @pt-BR Tipo de item de catálogo (#244). */
export type ArticuloTipo = 'articulo' | 'servicio'

/** @en Service unit when tipo=servicio (#244). @es Unidad de servicio (#244). @pt-BR Unidade de serviço (#244). */
export type UnidadServicio = 'hora' | 'dia' | 'mes' | 'proyecto' | 'km' | 'unidad' | 'otro'

export type ArticuloInput = {
  codigo: number
  descripcion: string
  rubroId: number
  condIva: '1' | '2' | '3'
  umedida: string
  /** @en Defaults to articulo when omitted. @es Por defecto articulo. @pt-BR Padrão articulo. */
  tipo?: ArticuloTipo
  unidadServicio?: UnidadServicio | null
  /** @en Warranty months; null = no warranty (#251). @es Meses de garantía (#251). @pt-BR Meses de garantia (#251). */
  mesesGarantia?: number | null
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
  cbu?: string | null
  alias?: string | null
  banco?: string | null
  tipoCuenta?: ProveedorTipoCuenta | null
  moneda?: string
  condicionPago?: ProveedorCondicionPago | null
  plazoHabitual?: number | null
  descuentoPct?: number | null
  limiteCredito?: number | null
  categoria?: ProveedorCategoria | null
  contactoNombre?: string | null
  contactoEmail?: string | null
  contactoTel?: string | null
  notas?: string | null
}

export type ProveedorCuentaCorrienteAjusteInput = {
  monto: number
  motivo: string
}

export type ClienteCuentaCorrienteAjusteInput = {
  monto: number
  motivo: string
}

export type ReciboPagoFacturaInput = {
  comprobanteCompraId?: number | null
  facturaRef: string
  monto: number
}

/** @en Withholding line on supplier payment (#276). @es Línea de retención en pago a proveedor (#276). @pt-BR Linha de retenção em pagamento (#276). */
export type ReciboPagoRetencionInput = {
  regimenId: number
  baseImponible: number
  alicuota: number
  importe: number
}

export type ReciboPagoInput = {
  fecha: string
  total: number
  metodoPago: ReciboPagoMetodo
  chequeId?: number | null
  cbu?: string | null
  referencia?: string | null
  notas?: string | null
  facturas: ReciboPagoFacturaInput[]
  retenciones?: ReciboPagoRetencionInput[]
}

/** @en Payment line on customer receipt (#233). @es Línea de forma de pago en recibo de cobro (#233). @pt-BR Linha de forma de pagamento no recibo (#233). */
export type ReciboCobroFormaInput = {
  tipo: ReciboCobroFormaTipo
  importe: number
  chequeId?: number | null
  chequeNuevo?: ChequeInput | null
  referencia?: string | null
  banco?: string | null
}

/** @en Invoice allocation on customer receipt (#233). @es Imputación a factura en recibo de cobro (#233). @pt-BR Imputação a fatura no recibo (#233). */
export type ReciboCobroImputacionInput = {
  facturaId: number
  importe: number
}

/** @en Customer payment receipt body (#233). @es Cuerpo de recibo de cobro (#233). @pt-BR Corpo do recibo de cobrança (#233). */
export type ReciboCobroInput = {
  fecha: string
  totalCobrado: number
  concepto?: string | null
  formas: ReciboCobroFormaInput[]
  imputaciones?: ReciboCobroImputacionInput[]
  fifo?: boolean
  retenciones?: CobroRetencionInput[]
}

export type FacturaItemInput = {
  /** Null/omitted for ad-hoc service lines (#244). */
  articuloId?: number | null
  /** Required for ad-hoc lines; server fills from catalog when articuloId is set. */
  descripcion?: string
  condIva?: '1' | '2' | '3'
  unidadServicio?: UnidadServicio | null
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
  /** Optional serial for warranty registration when article has mesesGarantia (#251). */
  nroSerie?: string | null
  /** Optional IMEI for warranty registration (#251). */
  nroImei?: string | null
}

export type FacturaPercepcionInput = {
  regimenId: number
  baseImponible: number
  alicuota: number
  importe: number
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
  percepciones?: FacturaPercepcionInput[]
}

export type CobroRetencionInput = {
  regimenId: number
  baseImponible: number
  alicuota: number
  importe: number
}

export type FacturaPrintInput = {
  device: 'pdf' | 'fiscal' | 'thermal'
}

export type PrintingTestInput = {
  device: 'fiscal' | 'thermal'
}

export type CobroInput = {
  clienteId: number
  fecha: string
  monto: number
  formaPagoId?: number | null
  chequeId?: number | null
  chequeNuevo?: ChequeInput | null
  referencia?: string | null
  nota?: string | null
  retenciones?: CobroRetencionInput[]
}

export type ChequeTipo = 'recibido' | 'emitido'
export type ChequeModalidad = 'fisico' | 'echeq'
export type ChequeEstado =
  | 'en_cartera'
  | 'emitido'
  | 'depositado'
  | 'endosado'
  | 'descontado'
  | 'cobrado'
  | 'rechazado'
  | 'anulado'
export type ChequeMovTipo = 'recepcion' | 'deposito' | 'endoso' | 'descuento' | 'cobro' | 'rechazo'

export type ChequeInput = {
  tipo: ChequeTipo
  modalidad: ChequeModalidad
  numero: string
  banco: string
  sucursal?: string | null
  cbuOrigen?: string | null
  libradorNombre: string
  libradorCuit?: string | null
  monto: number
  moneda?: string
  fechaEmision: string
  fechaVencimiento: string
  clienteId?: number | null
  proveedorId?: number | null
  observaciones?: string | null
}

export type ChequeUpdateInput = {
  banco?: string
  sucursal?: string | null
  cbuOrigen?: string | null
  libradorNombre?: string
  libradorCuit?: string | null
  fechaVencimiento?: string
  observaciones?: string | null
}

export type ChequeTransicionInput = {
  destino?: string | null
  nota?: string | null
  proveedorId?: number | null
  monto?: number | null
}

export type RemitoTipo = 'remito_x' | 'remito_ingreso'

export type RemitoEstado = 'borrador' | 'emitido' | 'entregado' | 'anulado'

export type RemitoItemInput = {
  articuloId: number
  descripcion: string
  cantidad: number
  unidad: string
}

export type RemitoInput = {
  tipo: RemitoTipo
  clienteId?: number | null
  proveedorId?: number | null
  facturaId?: number | null
  pedidoId?: number | null
  ordenEntregaId?: number | null
  fecha?: string
  observaciones?: string | null
  items: RemitoItemInput[]
}

export type RemitoUpdateInput = {
  clienteId?: number | null
  proveedorId?: number | null
  observaciones?: string | null
  items?: RemitoItemInput[]
}

export type RemitoEntregarInput = {
  firmadoPor: string
  fechaEntrega?: string
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

export type OrdenEntregaCreateInput = {
  clienteId: number
  fecha: string
  facturaId?: number | null
  zonaId?: number | null
  driverId?: number | null
  nota?: string | null
}

export type OrdenEntregaUpdateBody = {
  estado: OrdenEntregaEstado
  driverId?: number | null
  zonaId?: number | null
  nota?: string | null
}

export type RepartoCreateInput = {
  fecha: string
  choferId: number
  vehiculo?: string | null
  observaciones?: string | null
  ordenEntregaIds: number[]
}

export type RepartoUbicacionInput = {
  lat: number
  lng: number
}

export type StockAjusteInput = {
  cantidad: number
  motivo: string
}

export type OrdenCompraEstado = 'draft' | 'sent' | 'received' | 'cancelled'

export type OrdenCompraItemInput = {
  articuloId: number
  cantidad: number
  costoUnitario: number
}

export type OrdenCompraCreateInput = {
  proveedorId: number
  fechaEstimada?: string | null
  nota?: string | null
  items: OrdenCompraItemInput[]
}

export type OrdenCompraUpdateInput = {
  proveedorId?: number
  fechaEstimada?: string | null
  nota?: string | null
  items?: OrdenCompraItemInput[]
}

export type OrdenCompraReceiveLineInput = {
  itemId: number
  cantidad: number
}

export type RecuentoItemLineInput = {
  articuloId: number
  cantFisica: number
}

export type EmpresaInput = {
  nombre: string
  cuit: string
  domicilio?: string | null
  puntoVenta: number
  tipoFactura: 'A' | 'B' | 'C'
  logoUrl?: string | null
  recordatorioDiasGracia?: number
  timezone?: string
  recordatorioHoraInicio?: number
  recordatorioHoraFin?: number
  condicionIva?: 'RI' | 'Mono' | 'CF' | 'Exento'
  ingresosBrutos?: string | null
  fechaInicioActividades?: string | null
}

export type PedidoItemInput = {
  /** Null/omitted for ad-hoc service lines (#244). */
  articuloId?: number | null
  descripcion?: string
  condIva?: '1' | '2' | '3'
  unidadServicio?: UnidadServicio | null
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
}

export type PedidoInput = {
  clienteId: number
  vendedorId?: number | null
  validUntil?: string | null
  items: PedidoItemInput[]
}

export type PedidoInvoiceInput = {
  fecha: string
  tipo: 'A' | 'B'
  numero: number
  prefijo?: string
  formaPagoId?: number | null
}

/** @en Supplier payable alert settings (#275). @es Config alertas facturas a pagar (#275). @pt-BR Config alertas faturas a pagar (#275). */
export type AlertaProveedorConfigInput = {
  diasPrevioAviso?: number
  diasCritico?: number
  notifEmail?: boolean
  notifInApp?: boolean
}

/** @en Withholding/perception regime (#228). @es Régimen de retención/percepción (#228). @pt-BR Regime de retenção/percepção (#228). */
export type RegimenRetencionInput = {
  tipo: 'ganancias' | 'iva' | 'iibb'
  subtipo: 'retencion' | 'percepcion'
  nombre: string
  alicuota: number
  alicuotaMin?: number | null
  provincia?: string | null
  activo?: boolean
}

export type RegimenRetencionUpdateInput = {
  nombre?: string
  alicuota?: number
  alicuotaMin?: number | null
  provincia?: string | null
  activo?: boolean
}

/** @en Tenant withholding agent flags (#228). @es Flags agente de retención (#228). @pt-BR Flags agente de retenção (#228). */
export type FiscalRetencionesConfigInput = {
  esAgenteRetencionGanancias?: boolean
  esAgenteRetencionIVA?: boolean
  esAgenteRetencionIIBB?: boolean
}
