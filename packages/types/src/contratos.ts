import type { PaginatedResponse } from './api-contracts'
import type { UnidadServicio } from './server-inputs'

export type ContratoEstado = 'activo' | 'pausado' | 'finalizado' | 'cancelado'

export type ContratoFrecuencia = 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'

export type ContratoModoEmision = 'auto' | 'revision'

export type ContratoAjusteTipo = 'porcentaje_fijo' | 'manual'

export type ContratoItemInput = {
  articuloId?: number | null
  descripcion: string
  condIva?: '1' | '2' | '3'
  unidadServicio?: UnidadServicio | null
  cantidad: number
  precioUnit: number
  dscto?: number
}

export type ContratoAjusteInput = {
  tipo: ContratoAjusteTipo
  porcentaje?: number | null
  frecuenciaAjuste: ContratoFrecuencia
  proximoAjuste: string
}

export type ContratoInput = {
  clienteId: number
  nombre: string
  descripcion?: string | null
  frecuencia: ContratoFrecuencia
  diaDelMes: number
  fechaInicio: string
  fechaFin?: string | null
  proximaFact?: string
  moneda?: string
  incluyeIVA?: boolean
  ivaAlicuota?: number
  modoEmision?: ContratoModoEmision
  tipoFactura?: 'A' | 'B'
  prefijo?: string
  items: ContratoItemInput[]
  ajuste?: ContratoAjusteInput | null
}

export type ContratoUpdateInput = ContratoInput & {
  estado?: ContratoEstado
}

export type ContratoAjusteManualInput = {
  porcentaje: number
}

export type ContratoRow = {
  id: number
  numero: number
  clienteId: number
  nombre: string
  descripcion: string | null
  estado: ContratoEstado
  frecuencia: ContratoFrecuencia
  diaDelMes: number
  fechaInicio: string
  fechaFin: string | null
  proximaFact: string
  montoBase: number | string
  moneda: string
  incluyeIVA: boolean
  ivaAlicuota: number | string
  modoEmision: ContratoModoEmision
  tipoFactura: string
  prefijo: string
  createdAt: string
  updatedAt: string
  cliente?: { id: number; codigo: number; rsocial: string }
  items?: unknown[]
  ajuste?: unknown | null
}

export type ContratoListResponse = PaginatedResponse<ContratoRow> & { success: boolean }
