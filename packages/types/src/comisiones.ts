/**
 * @en Types for seller commissions configuration and monthly settlements (#237).
 * @es Tipos para configuración de comisiones de vendedores y liquidaciones mensuales (#237).
 * @pt-BR Tipos para configuração de comissões de vendedores e liquidações mensais (#237).
 */
import type { PaginatedResponse } from './api-contracts'

export const COMISION_TIPOS = [
  'porcentaje_cobrado',
  'porcentaje_facturado',
  'importe_fijo_por_venta',
] as const
export type ComisionTipo = (typeof COMISION_TIPOS)[number]

export const LIQUIDACION_ESTADOS = ['borrador', 'aprobada', 'pagada'] as const
export type LiquidacionComisionEstado = (typeof LIQUIDACION_ESTADOS)[number]

export type ConfigComisionRow = {
  id: number
  tenantId: number
  vendedorId: number
  tipo: ComisionTipo
  alicuota: number
  vigenciaDesde: string
  vigenciaHasta: string | null
  articuloCategoriaId: number | null
  clienteId: number | null
  createdAt: string
  updatedAt: string
  vendedorUsername?: string
}

export type ConfigComisionCreateInput = {
  vendedorId: number
  tipo: ComisionTipo
  alicuota: number
  vigenciaDesde: string
  vigenciaHasta?: string | null
  articuloCategoriaId?: number | null
  clienteId?: number | null
}

export type ConfigComisionPatchInput = Partial<Omit<ConfigComisionCreateInput, 'vendedorId'>> & {
  vendedorId?: number
}

export type ConfigComisionListResponse = PaginatedResponse<ConfigComisionRow>

export type LiquidacionComisionDetalleRow = {
  id: number
  liquidacionId: number
  facturaId: number | null
  reciboCobroId: number | null
  imputacionId: number | null
  montoBase: number
  alicuota: number
  comision: number
  concepto: string
}

export type LiquidacionComisionRow = {
  id: number
  tenantId: number
  vendedorId: number
  periodo: string
  totalVentas: number
  totalComision: number
  estado: LiquidacionComisionEstado
  aprobadoPorId: number | null
  pagadoEn: string | null
  createdAt: string
  updatedAt: string
  vendedorUsername?: string
  detalle?: LiquidacionComisionDetalleRow[]
}

export type LiquidacionComisionListResponse = PaginatedResponse<LiquidacionComisionRow>

export type LiquidacionGenerarInput = {
  periodo: string
  vendedorId?: number
}

export type ComisionRankingRow = {
  vendedorId: number
  vendedorUsername: string
  totalVentas: number
  totalComision: number
  liquidacionId: number | null
  estado: LiquidacionComisionEstado | null
}

export type MisComisionesResponse = {
  success: true
  periodo: string
  estimacion: {
    totalVentas: number
    totalComision: number
    lineas: Array<{
      concepto: string
      montoBase: number
      alicuota: number
      comision: number
      facturaId: number | null
    }>
  }
  liquidaciones: LiquidacionComisionRow[]
}

export type ComisionesSettingsRow = {
  modoDevengo: ComisionTipo
}
