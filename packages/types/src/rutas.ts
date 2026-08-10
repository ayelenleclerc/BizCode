/** @en Seller route holiday type (#267). @es Tipo de feriado de ruta (#267). @pt-BR Tipo de feriado de rota (#267). */
export type FeriadoTipo = 'nacional' | 'provincial' | 'local'

/** @en Route stop state (#267). @es Estado de parada de ruta (#267). @pt-BR Estado da parada de rota (#267). */
export type RutaParadaEstado = 'pendiente' | 'visitado' | 'postergado' | 'no_visitado'

export type VendedorZonaRow = {
  id: number
  tenantId: number
  vendedorId: number
  deliveryZoneId: number
  createdAt: string
  deliveryZone?: { id: number; nombre: string; activo: boolean }
  vendedor?: { id: number; username: string; role: string }
}

export type FeriadoRow = {
  id: number
  tenantId: number
  fecha: string
  nombre: string
  tipo: FeriadoTipo
  provincia: string | null
  createdAt: string
  updatedAt: string
}

export type RutaParadaClienteSnapshot = {
  id: number
  codigo: number
  rsocial: string
  domicilio: string | null
  localidad: string | null
  deliveryZoneId: number | null
  latitud: number | null
  longitud: number | null
}

export type RutaParadaRow = {
  id: number
  rutaId: number
  clienteId: number
  orden: number
  estado: RutaParadaEstado
  motivo: string | null
  visitaId: number | null
  createdAt: string
  updatedAt: string
  cliente?: RutaParadaClienteSnapshot
}

export type RutaVendedorRow = {
  id: number
  tenantId: number
  vendedorId: number
  fecha: string
  createdAt: string
  updatedAt: string
  paradas: RutaParadaRow[]
  vendedor?: { id: number; username: string; role: string }
}

export type RutaDiaStats = {
  total: number
  pendientes: number
  visitados: number
  postergados: number
  noVisitados: number
  pedidos: number
  conversionPct: number
}

export type RutaVendedorCreateInput = {
  vendedorId: number
  fecha: string
  clienteIds?: number[]
}

export type RutaParadasReplaceInput = {
  paradas: Array<{
    clienteId: number
    orden: number
    estado?: RutaParadaEstado
    motivo?: string | null
  }>
}

export type RutaParadaPatchInput = {
  estado: RutaParadaEstado
  motivo?: string | null
  visitaId?: number | null
}

export type FeriadoCreateInput = {
  fecha: string
  nombre: string
  tipo?: FeriadoTipo
  provincia?: string | null
}

export type VendedorZonaCreateInput = {
  vendedorId: number
  deliveryZoneId: number
}
