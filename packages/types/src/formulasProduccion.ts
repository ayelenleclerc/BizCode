/**
 * @en Types for production BOM formulas (#248).
 * @es Tipos para fórmulas BOM de producción (#248).
 * @pt-BR Tipos para fórmulas BOM de produção (#248).
 */
import type { PaginatedResponse } from './api-contracts'

export const FORMULA_INSUMO_UNIDADES = ['kg', 'g', 'l', 'ml', 'unidad', 'hora'] as const
export type FormulaInsumoUnidad = (typeof FORMULA_INSUMO_UNIDADES)[number]

export type FormulaInsumoRow = {
  id: number
  formulaId: number
  articuloId: number
  cantidad: number
  unidad: FormulaInsumoUnidad
  esOpcional: boolean
  orden: number
  articulo: {
    id: number
    codigo: number
    descripcion: string
    costo: number
    umedida: string
    tipo: string
  } | null
}

export type FormulaProduccionRow = {
  id: number
  tenantId: number
  articuloId: number
  rendimiento: number
  unidadRendimiento: string
  version: number
  activa: boolean
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
  insumos: FormulaInsumoRow[]
}

export type FormulaProduccionListResponse = PaginatedResponse<FormulaProduccionRow>

export type FormulaInsumoInput = {
  articuloId: number
  cantidad: number
  unidad: FormulaInsumoUnidad
  esOpcional?: boolean
  orden?: number
}

export type FormulaProduccionCreateInput = {
  articuloId: number
  rendimiento: number
  unidadRendimiento?: string
  observaciones?: string | null
  insumos: FormulaInsumoInput[]
}

export type FormulaProduccionUpdateInput = {
  rendimiento: number
  unidadRendimiento?: string
  observaciones?: string | null
  insumos: FormulaInsumoInput[]
}

export type FormulaCostoLinea = {
  articuloId: number
  descripcion: string
  cantidad: number
  unidad: FormulaInsumoUnidad
  costoUnitario: number
  costoLinea: number
  esOpcional: boolean
}

export type FormulaCostoResult = {
  formulaId: number
  articuloId: number
  rendimiento: number
  costoInsumos: number
  costoUnitario: number
  precioVenta: number
  margenAbsoluto: number
  margenPorcentaje: number
  lineas: FormulaCostoLinea[]
}

export type FormulaProyeccionLinea = {
  articuloId: number
  codigo: number
  descripcion: string
  cantidad: number
  unidad: FormulaInsumoUnidad
  esOpcional: boolean
}

export type FormulaProyeccionResult = {
  formulaId: number
  articuloId: number
  unidadesObjetivo: number
  corridas: number
  lineas: FormulaProyeccionLinea[]
}
