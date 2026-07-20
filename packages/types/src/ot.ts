import type { PaginatedResponse } from './api-contracts'

export type OrdenTrabajoEstado =
  | 'recibido'
  | 'diagnosticado'
  | 'presupuestado'
  | 'aprobado'
  | 'en_reparacion'
  | 'listo'
  | 'entregado'
  | 'facturado'
  | 'cancelado'
  | 'sin_reparacion'

export type OrdenTrabajoPrioridad = 'baja' | 'normal' | 'alta' | 'urgente'

export type OrdenTrabajoItemTipo = 'mano_de_obra' | 'repuesto' | 'servicio'

export type OrdenTrabajoItemInput = {
  tipo: OrdenTrabajoItemTipo
  descripcion: string
  articuloId?: number | null
  cantidad: number
  precioUnit: number
  condIva?: '1' | '2' | '3'
}

export type OrdenTrabajoInput = {
  clienteId: number
  tecnicoId?: number | null
  prioridad?: OrdenTrabajoPrioridad
  equipoMarca?: string | null
  equipoModelo?: string | null
  equipoNroSerie?: string | null
  equipoDescripcion: string
  sintomaReportado: string
  diagnostico?: string | null
  trabajoRealizado?: string | null
  fechaPromesa?: string | null
  observaciones?: string | null
  /** Optional override; otherwise inferred from prior OT by serial. */
  enGarantia?: boolean
  garantiaVence?: string | null
  otGarantiaId?: number | null
  items?: OrdenTrabajoItemInput[]
}

export type OrdenTrabajoUpdateInput = OrdenTrabajoInput & {
  estado?: OrdenTrabajoEstado
  fechaEntrega?: string | null
  presupuesto?: number | null
}

export type OrdenTrabajoTransitionInput = {
  estado: OrdenTrabajoEstado
  diagnostico?: string | null
  trabajoRealizado?: string | null
  fechaPromesa?: string | null
  fechaEntrega?: string | null
  tecnicoId?: number | null
  observaciones?: string | null
  items?: OrdenTrabajoItemInput[]
}

export type OrdenTrabajoFacturarInput = {
  tipo?: 'A' | 'B'
  prefijo?: string
  /** When true, create invoice without ARCA CAE request. Default true for workshop MVP. */
  skipArcaCae?: boolean
}

export type OrdenTrabajoItemRow = {
  id: number
  tipo: OrdenTrabajoItemTipo
  descripcion: string
  articuloId: number | null
  cantidad: number | string
  precioUnit: number | string
  subtotal: number | string
  condIva: string
}

export type OrdenTrabajoRow = {
  id: number
  numero: number
  clienteId: number
  tecnicoId: number | null
  estado: OrdenTrabajoEstado
  prioridad: OrdenTrabajoPrioridad
  equipoMarca: string | null
  equipoModelo: string | null
  equipoNroSerie: string | null
  equipoDescripcion: string
  sintomaReportado: string
  diagnostico: string | null
  trabajoRealizado: string | null
  enGarantia: boolean
  garantiaVence: string | null
  otGarantiaId: number | null
  presupuesto: number | string | null
  fechaIngreso: string
  fechaPromesa: string | null
  fechaEntrega: string | null
  facturaId: number | null
  observaciones: string | null
  createdAt: string
  updatedAt: string
  cliente?: { id: number; codigo: number; rsocial: string }
  tecnico?: { id: number; username: string } | null
  items?: OrdenTrabajoItemRow[]
}

export type OrdenTrabajoDashboardCounts = {
  recibido: number
  diagnosticado: number
  presupuestado: number
  aprobado: number
  en_reparacion: number
  listo: number
  entregado: number
  facturado: number
  cancelado: number
  sin_reparacion: number
}

export type OrdenTrabajoListResponse = PaginatedResponse<OrdenTrabajoRow> & {
  success: boolean
  counts?: Partial<OrdenTrabajoDashboardCounts>
}
