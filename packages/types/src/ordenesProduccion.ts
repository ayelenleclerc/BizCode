/**
 * @en Types for production orders that consume BOM inputs (#249).
 * @es Tipos para órdenes de producción que consumen insumos BOM (#249).
 * @pt-BR Tipos para ordens de produção que consomem insumos BOM (#249).
 */
import type { PaginatedResponse } from './api-contracts'
import type { FormulaInsumoUnidad } from './formulasProduccion'

export const ORDEN_PRODUCCION_ESTADOS = [
  'planificada',
  'en_proceso',
  'completada',
  'cancelada',
] as const
export type OrdenProduccionEstado = (typeof ORDEN_PRODUCCION_ESTADOS)[number]

export type OrdenProduccionInsumoRow = {
  id: number
  ordenId: number
  articuloId: number
  cantidadPlan: number
  cantidadReal: number | null
  unidad: FormulaInsumoUnidad
  costo: number | null
  esOpcional: boolean
  linea: number
  articulo: {
    id: number
    codigo: number
    descripcion: string
    costo: number
    umedida: string
    tipo: string
  } | null
}

export type OrdenProduccionRow = {
  id: number
  tenantId: number
  numero: number
  articuloId: number
  formulaId: number
  depositoId: number
  cantidadPlanif: number
  cantidadReal: number | null
  estado: OrdenProduccionEstado
  fechaPlanif: string
  fechaInicio: string | null
  fechaFin: string | null
  costoTotal: number | null
  operadorId: number | null
  observaciones: string | null
  createdAt: string
  updatedAt: string
  articulo: {
    id: number
    codigo: number
    descripcion: string
    costo: number
    precioLista1: number
  } | null
  deposito: { id: number; codigo: string; nombre: string } | null
  formula: { id: number; version: number; rendimiento: number } | null
  insumos: OrdenProduccionInsumoRow[]
}

export type OrdenProduccionListResponse = PaginatedResponse<OrdenProduccionRow>

export type OrdenProduccionCreateInput = {
  articuloId: number
  cantidadPlanif: number
  depositoId?: number
  fechaPlanif?: string
  operadorId?: number | null
  observaciones?: string | null
}

export type OrdenProduccionConsumoInput = {
  articuloId: number
  cantidadReal: number
}

export type OrdenProduccionCompletarInput = {
  cantidadReal: number
  insumos?: OrdenProduccionConsumoInput[]
}

/**
 * @en Availability line: BOM need vs deposit stock minus active reservations.
 * @es Línea de disponibilidad: necesidad BOM vs stock del depósito menos reservas activas.
 * @pt-BR Linha de disponibilidade: necessidade BOM vs estoque do depósito menos reservas ativas.
 */
export type OrdenProduccionDisponibilidadLinea = {
  articuloId: number
  codigo: number
  descripcion: string
  unidad: FormulaInsumoUnidad
  necesario: number
  disponible: number
  faltante: number
  esOpcional: boolean
  mueveStock: boolean
}

export type OrdenProduccionDisponibilidad = {
  ordenId: number
  depositoId: number
  suficiente: boolean
  lineas: OrdenProduccionDisponibilidadLinea[]
}

export type OrdenProduccionSugerirCompraInput = {
  proveedorId: number
}

export type OrdenProduccionSugerirCompraResult = {
  ordenCompraId: number
  items: Array<{
    articuloId: number
    cantidad: number
    costoUnitario: number
  }>
}
