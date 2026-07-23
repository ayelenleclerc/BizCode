/**
 * @en Types for multiple price lists with quantity-tiered pricing (#234).
 * @es Tipos para múltiples listas de precios con precios escalonados por cantidad (#234).
 * @pt-BR Tipos para múltiplas listas de preços com preços escalonados por quantidade (#234).
 */
import type { PaginatedResponse } from './api-contracts'

export type ListaPrecioTipoPrecio = 'fijo' | 'porcentaje_sobre_base'

/**
 * @en Source that determined the effective price in the resolution cascade.
 * @es Origen que determinó el precio efectivo en la cascada de resolución.
 * @pt-BR Origem que determinou o preço efetivo na cascata de resolução.
 */
export type PrecioEfectivoOrigen =
  | 'escalonado'
  | 'fijo'
  | 'porcentaje_sobre_base'
  | 'base'
  | 'oferta'
  | 'override_variante'
  | 'precio_subfamilia'
  | 'precio_familia'

export type PrecioEscalonadoRow = {
  id: number
  listaPrecioItemId: number
  cantidadDesde: number
  cantidadHasta: number | null
  precio: number
}

export type PrecioEscalonadoInput = {
  cantidadDesde: number
  cantidadHasta?: number | null
  precio: number
}

export type ListaPrecioItemRow = {
  id: number
  tenantId: number
  listaPrecioId: number
  articuloId: number
  tipoPrecio: ListaPrecioTipoPrecio
  precio: number | null
  porcentaje: number | null
  createdAt: string
  updatedAt: string
  escalonados?: PrecioEscalonadoRow[]
  articulo?: { id: number; codigo: number; descripcion: string } | null
}

export type ListaPrecioItemInput = {
  articuloId: number
  tipoPrecio: ListaPrecioTipoPrecio
  precio?: number | null
  porcentaje?: number | null
  escalonados?: PrecioEscalonadoInput[]
}

export type ListaPrecioRow = {
  id: number
  tenantId: number
  nombre: string
  moneda: string
  activa: boolean
  esDefault: boolean
  vigenciaHasta: string | null
  createdAt: string
  updatedAt: string
  items?: ListaPrecioItemRow[]
  _count?: { items: number; clientes: number }
}

export type ListaPrecioCreateInput = {
  nombre: string
  moneda?: string
  activa?: boolean
  esDefault?: boolean
  vigenciaHasta?: string | null
}

export type ListaPrecioPatchInput = Partial<ListaPrecioCreateInput>

export type ListaPrecioListResponse = PaginatedResponse<ListaPrecioRow>

/**
 * @en Bulk percentage update over an entire price list (preview then apply).
 * @es Actualización masiva por porcentaje sobre toda una lista (preview y aplicar).
 * @pt-BR Atualização em massa por percentual sobre toda uma lista (prévia e aplicar).
 */
export type ListaPrecioBulkUpdateInput = {
  porcentaje: number
  preview?: boolean
}

export type ListaPrecioBulkUpdatePreviewRow = {
  listaPrecioItemId: number
  articuloId: number
  descripcion: string
  precioActual: number | null
  precioNuevo: number | null
}

export type ListaPrecioBulkUpdateResult = {
  success: boolean
  preview: boolean
  afectados: number
  ejemplos: ListaPrecioBulkUpdatePreviewRow[]
}

export type PrecioEfectivoResponse = {
  success: boolean
  articuloId: number
  listaPrecioId: number | null
  cantidad: number
  precioBase: number
  precio: number
  origen: PrecioEfectivoOrigen
  moneda: string
}
