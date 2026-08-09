import type { PaginatedResponse } from './api-contracts'

/** @en Visit plan state (#170). @es Estado de planificación de visita (#170). @pt-BR Estado do plano de visita (#170). */
export type VisitaEstadoPlan = 'pendiente' | 'completada' | 'no_visitada'

/** @en Visit outcome (#170). @es Resultado de visita (#170). @pt-BR Resultado da visita (#170). */
export type VisitaResultado = 'venta' | 'sin_pedido' | 'cliente_ausente' | 'otro'

export type VisitaVendedorClienteSnapshot = {
  id: number
  codigo: number
  rsocial: string
  domicilio: string | null
  localidad: string | null
  deliveryZoneId: number | null
}

export type VisitaVendedorRow = {
  id: number
  tenantId: number
  vendedorId: number
  clienteId: number
  fechaPlanificada: string
  estadoPlan: VisitaEstadoPlan
  resultado: VisitaResultado | null
  notasVisita: string | null
  pedidoId: number | null
  orden: number
  duracionMinutos: number | null
  createdAt: string
  updatedAt: string
  cliente?: VisitaVendedorClienteSnapshot
  /** ISO timestamp of last Pedido for this client, when computed. */
  ultimaCompraAt?: string | null
  vendedor?: { id: number; username: string; role: string }
}

export type VisitaVendedorListResponse = PaginatedResponse<VisitaVendedorRow> & {
  success: boolean
  kpi?: VisitaDiaKpi
}

/** @en Daily agenda KPIs (#170). @es KPIs de agenda del día (#170). @pt-BR KPIs da agenda do dia (#170). */
export type VisitaDiaKpi = {
  planificadas: number
  visitados: number
  pedidos: number
  conversionPct: number
}

export type VisitaVendedorCreateInput = {
  vendedorId: number
  clienteId: number
  fechaPlanificada: string
  orden?: number
  notasVisita?: string | null
}

export type VisitaVendedorUpdateInput = {
  estadoPlan?: VisitaEstadoPlan
  resultado?: VisitaResultado | null
  notasVisita?: string | null
  pedidoId?: number | null
  orden?: number
  duracionMinutos?: number | null
}
