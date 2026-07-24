/**
 * @en Types for foreign-currency catalog prices and exchange rates (#243).
 * @es Tipos para precios de catálogo en moneda extranjera y tipos de cambio (#243).
 * @pt-BR Tipos para preços de catálogo em moeda estrangeira e taxas de câmbio (#243).
 */
import type { PaginatedResponse } from './api-contracts'

export const MONEDAS_PRECIO = ['ARS', 'USD', 'EUR'] as const
export type MonedaPrecio = (typeof MONEDAS_PRECIO)[number]

export const TIPOS_CAMBIO = ['oficial', 'mep', 'ccl', 'blue', 'manual'] as const
export type TipoCambioTipo = (typeof TIPOS_CAMBIO)[number]

export const TIPOS_CAMBIO_FUENTES = ['bcra_api', 'manual'] as const
export type TipoCambioFuente = (typeof TIPOS_CAMBIO_FUENTES)[number]

export const MONEDAS_FX = ['USD', 'EUR'] as const
export type MonedaFx = (typeof MONEDAS_FX)[number]

export type TipoCambioRow = {
  id: number
  tenantId: number
  moneda: MonedaFx
  tipo: TipoCambioTipo
  valor: number
  fecha: string
  fuente: TipoCambioFuente
  createdById: number | null
  createdAt: string
}

export type TipoCambioListResponse = PaginatedResponse<TipoCambioRow>

export type TipoCambioManualInput = {
  moneda: MonedaFx
  tipo: TipoCambioTipo
  valor: number
  fecha?: string
}

export type TipoCambioVigenteQuery = {
  moneda: MonedaFx
  tipo?: TipoCambioTipo
}

export type TipoCambioPreferidoPatch = {
  tipoCambioPreferido: TipoCambioTipo
}

export type RecalcFxResult = {
  updatedCount: number
  moneda: MonedaFx
  tipo: TipoCambioTipo
  valor: number
}
