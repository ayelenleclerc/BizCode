export type OrdenEntregaEstado =
  | 'pending'
  | 'picking'
  | 'ready'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled'

/** @en Carrier codes for parcel shipping (#193). */
export type ShippingTransportista = 'correo_argentino' | 'andreani' | 'propio' | 'meli_full'

/** @en Carrier shipment lifecycle (#193), independent of OE `estado`. */
export type EstadoEnvio = 'pending' | 'in_transit' | 'delivered' | 'returned'

export type ShippingTrackingEvent = {
  at: string
  status: string
  description?: string
  location?: string
}

export type OrdenEntregaLineItem = {
  id: number
  cantidad: number
  articulo: { id: number; codigo: number; descripcion: string }
}

export type OrdenEntrega = {
  id: number
  tenantId: number
  facturaId: number | null
  clienteId: number
  zonaId: number | null
  driverId: number | null
  pickerUserId: number | null
  pickingIniciadoAt: string | null
  pickingListoAt: string | null
  fecha: string
  estado: OrdenEntregaEstado
  nota: string | null
  transportista: ShippingTransportista | null
  nroSeguimiento: string | null
  estadoEnvio: EstadoEnvio | null
  ultimoEventoAt: string | null
  trackingEventos: ShippingTrackingEvent[] | null
  items: OrdenEntregaLineItem[]
  cliente?: {
    id: number
    codigo: number
    rsocial: string
    domicilio?: string | null
    localidad?: string | null
    telef?: string | null
    latitud?: number | null
    longitud?: number | null
    balance?: string | null
    deuda?: RepartoClienteDeuda | null
  }
  zona?: { id: number; nombre: string; horario?: string | null } | null
  driver?: { id: number; username: string; role: string } | null
  picker?: { id: number; username: string; role: string } | null
  factura?: { id: number; tipo: string; prefijo: string; numero: number } | null
}

export type OrdenEntregaTrackingAssignInput = {
  transportista: ShippingTransportista
  nroSeguimiento: string
  estadoEnvio?: EstadoEnvio
}

export type OrdenEntregaTrackingView = {
  ordenEntregaId: number
  transportista: ShippingTransportista | null
  nroSeguimiento: string | null
  estadoEnvio: EstadoEnvio | null
  ultimoEventoAt: string | null
  trackingEventos: ShippingTrackingEvent[]
  portalUrl: string | null
  fromCache: boolean
  refreshed: boolean
}

export type ShippingCarrierConfigPublic = {
  carrier: 'andreani' | 'correo_argentino'
  usernameLast4: string
  sandboxMode: boolean
  activo: boolean
  updatedAt: string
}

export type ShippingCarrierConfigUpsertInput = {
  username: string
  password: string
  sandboxMode?: boolean
  activo?: boolean
}

export type OrdenEntregaListParams = {
  estado?: OrdenEntregaEstado
  zonaId?: number
  driverId?: number
  fecha?: string
  limit?: number
  offset?: number
}

/** Pending AR snapshot for a stop on the driver's day route (#160). */
export type RepartoFacturaPendiente = {
  facturaId: number
  facturaRef: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
}

export type RepartoClienteDeuda = {
  saldo: string
  facturasPendientes: RepartoFacturaPendiente[]
}

export type RepartoEstado = 'planned' | 'on_route' | 'completed' | 'cancelled'

export type RepartoItemEstado = 'pending' | 'delivered' | 'not_delivered' | 'returned'

export type MotivoNoEntrega =
  | 'ausente'
  | 'rechazo'
  | 'domicilio_incorrecto'
  | 'producto_dañado'
  | 'otro'

export type RepartoItemRow = {
  id: number
  ordenEntregaId: number
  secuencia: number
  estado: RepartoItemEstado
  entregadoAt: string | null
  motivoNoEntrega: MotivoNoEntrega | null
  receptorNombre: string | null
  receptorDni: string | null
  notasEntrega: string | null
  hasPod: boolean
  ordenEntrega: OrdenEntrega
}

export type RepartoItemPodDetail = RepartoItemRow & {
  podMedia: { firmaBase64?: string; fotoBase64?: string } | null
}

export type RepartoItemPodInput = {
  outcome: 'delivered' | 'not_delivered'
  receptorNombre?: string | null
  receptorDni?: string | null
  firmaBase64?: string | null
  fotoBase64?: string | null
  notasEntrega?: string | null
  motivoNoEntrega?: MotivoNoEntrega | null
}

export type Reparto = {
  id: number
  tenantId: number
  fecha: string
  choferId: number
  estado: RepartoEstado
  vehiculo: string | null
  observaciones: string | null
  closedAt: string | null
  chofer: { id: number; username: string; role: string }
  items: RepartoItemRow[]
  progress: { total: number; delivered: number; pending: number }
}

export type RepartoCloseSummary = {
  pendingClosed: number
  delivered: number
  notDelivered: number
  returned: number
}

export type RepartoUbicacionPoint = {
  lat: number
  lng: number
  recordedAt: string
}

export type RepartoActivo = {
  id: number
  tenantId: number
  fecha: string
  choferId: number
  estado: RepartoEstado
  vehiculo: string | null
  observaciones: string | null
  chofer: { id: number; username: string; role: string }
  progress: { total: number; delivered: number; pending: number }
  ultimaUbicacion: RepartoUbicacionPoint | null
  currentStop: {
    secuencia: number
    cliente: { id: number; codigo: number; rsocial: string; domicilio: string | null }
    zona: { id: number; nombre: string } | null
  } | null
}
