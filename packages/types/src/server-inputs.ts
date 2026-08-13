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
import type { PedidoCondicionCobro, PedidoEstado } from './pedidos'

export type {
  MovimientoClienteCCTipo,
  MovimientoProveedorCCTipo,
  OrdenEntregaEstado,
  PedidoCondicionCobro,
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
  listaPrecioId?: number | null
  /** @en Customer bank CBU (#191). @es CBU bancario del cliente (#191). @pt-BR CBU bancário do cliente (#191). */
  cbu?: string | null
  /** @en Customer bank alias (#191). @es Alias bancario del cliente (#191). @pt-BR Alias bancário do cliente (#191). */
  alias?: string | null
}

/** @en Catalog item kind (#244). @es Tipo de ítem de catálogo (#244). @pt-BR Tipo de item de catálogo (#244). */
export type ArticuloTipo = 'articulo' | 'servicio'

/** @en Service unit when tipo=servicio (#244). @es Unidad de servicio (#244). @pt-BR Unidade de serviço (#244). */
export type UnidadServicio = 'hora' | 'dia' | 'mes' | 'proyecto' | 'km' | 'unidad' | 'otro'

export type ArticuloInput = {
  codigo: number
  /** @en Optional barcode (#255). @es Código de barras opcional (#255). @pt-BR Código de barras opcional (#255). */
  codigoBarras?: string | null
  descripcion: string
  rubroId: number
  /** @en Optional hierarchical category (#235). @es Categoría jerárquica opcional (#235). @pt-BR Categoria hierárquica opcional (#235). */
  categoriaId?: number | null
  /** @en Parent product flag (#235). @es Marca de artículo padre (#235). @pt-BR Marca de artigo pai (#235). */
  esPadre?: boolean
  padreId?: number | null
  heredaPrecio?: boolean
  precioOverride?: number | null
  costoOverride?: number | null
  condIva: '1' | '2' | '3'
  umedida: string
  /** @en Defaults to articulo when omitted. @es Por defecto articulo. @pt-BR Padrão articulo. */
  tipo?: ArticuloTipo
  unidadServicio?: UnidadServicio | null
  /** @en Warranty months; null = no warranty (#251). @es Meses de garantía (#251). @pt-BR Meses de garantia (#251). */
  mesesGarantia?: number | null
  /** @en Lot control opt-in (#202). @es Opt-in control de lote (#202). @pt-BR Opt-in controle de lote (#202). */
  controlLote?: boolean
  /** @en Base unit of measure for stock/quantity rules (#203). @es Unidad de medida base para reglas de stock/cantidad (#203). @pt-BR Unidade de medida base para regras de estoque/quantidade (#203). */
  unidadBase?: 'unidad' | 'kg' | 'gramo' | 'litro' | 'metro' | 'm2' | 'm3' | 'rollo' | 'caja'
  /** @en Purchase unit label, may differ from unidadBase (#203). @es Etiqueta de unidad de compra, puede diferir de unidadBase (#203). @pt-BR Rótulo da unidade de compra, pode diferir de unidadBase (#203). */
  unidadCompra?: string | null
  /** @en Purchase-to-base conversion factor (#203). @es Factor de conversión compra a base (#203). @pt-BR Fator de conversão compra para base (#203). */
  factorConversion?: number | string
  /** @en Sale multiple/step for cut-to-size items (#203). @es Múltiplo/paso de venta para artículos a medida (#203). @pt-BR Múltiplo/passo de venda para itens sob medida (#203). */
  multiploVenta?: number | string | null
  /** @en Weight in kg per base unit, for shipping/costing (#203). @es Peso en kg por unidad base, para envío/costeo (#203). @pt-BR Peso em kg por unidade base, para envio/custeio (#203). */
  pesoKg?: number | string | null
  /** @en Volume in m3 per base unit, for shipping/costing (#203). @es Volumen en m3 por unidad base, para envío/costeo (#203). @pt-BR Volume em m3 por unidade base, para envio/custeio (#203). */
  volumenM3?: number | string | null
  precioLista1: number
  precioLista2: number
  costo: number
  /** @en Catalog price currency ARS|USD|EUR (#243). @es Moneda de precio (#243). @pt-BR Moeda de preço (#243). */
  monedaPrecio?: 'ARS' | 'USD' | 'EUR'
  /** @en Foreign price when monedaPrecio is USD/EUR (#243). @es Precio en moneda origen (#243). @pt-BR Preço na moeda de origem (#243). */
  precioEnMonedaOrigen?: number | null
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
  /** @en Dispatch deposit (#236). @es Depósito de despacho (#236). @pt-BR Depósito de despacho (#236). */
  depositoId?: number | null
  /**
   * @en Loyalty points to redeem on this invoice (#250).
   * @es Puntos de fidelización a canjear en esta factura (#250).
   * @pt-BR Pontos de fidelização a resgatar nesta fatura (#250).
   */
  puntosCanje?: number | null
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
  /** @en Deposit for the adjustment (#236). @es Depósito del ajuste (#236). @pt-BR Depósito do ajuste (#236). */
  depositoId?: number | null
  /** @en Lot for FEFO-tracked articles (#202). @es Lote para artículos con FEFO (#202). @pt-BR Lote para artigos com FEFO (#202). */
  loteId?: number | null
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
  /** @en Receipt destination deposit (#236). @es Depósito destino de recepción (#236). @pt-BR Depósito destino da recepção (#236). */
  depositoId?: number | null
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
  /** @en Manufacturer lot number when article tracks lots (#202). */
  nroLote?: string | null
  /** @en Lot expiry ISO date (YYYY-MM-DD) when article tracks lots (#202). */
  fechaVencimiento?: string | null
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
  /** @en Intended dispatch deposit (#236). @es Depósito de despacho previsto (#236). @pt-BR Depósito de despacho previsto (#236). */
  depositoId?: number | null
  /** @en Warehouse notes (#169). @es Observaciones depósito (#169). @pt-BR Observações depósito (#169). */
  observaciones?: string | null
  /** @en Collection terms (#169). @es Condición de cobro (#169). @pt-BR Condição de cobrança (#169). */
  condicionCobro?: PedidoCondicionCobro | null
  /** @en Days when condicionCobro is plazo (#169). @es Días si condición es plazo (#169). @pt-BR Dias se condição é plazo (#169). */
  plazoDias?: number | null
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
