/**
 * @en Types for multi-warehouse deposits, per-deposit stock and transfers (#236).
 * @es Tipos para depósitos multi-almacén, stock por depósito y transferencias (#236).
 * @pt-BR Tipos para depósitos multi-armazém, estoque por depósito e transferências (#236).
 */
import type { PaginatedResponse } from './api-contracts'

export const DEPOSITO_TIPOS = ['central', 'sucursal', 'externo', 'picking', 'transito'] as const
export type DepositoTipo = (typeof DEPOSITO_TIPOS)[number]

export const TRANSFERENCIA_ESTADOS = ['pendiente', 'en_transito', 'recibida', 'anulada'] as const
export type TransferenciaDepositoEstado = (typeof TRANSFERENCIA_ESTADOS)[number]

export type DepositoRow = {
  id: number
  tenantId: number
  nombre: string
  codigo: string
  tipo: DepositoTipo
  direccion: string | null
  responsableId: number | null
  activo: boolean
  esDefault: boolean
  createdAt: string
  updatedAt: string
}

export type DepositoCreateInput = {
  nombre: string
  codigo: string
  tipo: DepositoTipo
  direccion?: string | null
  responsableId?: number | null
  activo?: boolean
  esDefault?: boolean
}

export type DepositoPatchInput = Partial<DepositoCreateInput>

export type DepositoListResponse = PaginatedResponse<DepositoRow>

export type StockDepositoRow = {
  id: number
  tenantId: number
  articuloId: number
  depositoId: number
  depositoCodigo?: string
  depositoNombre?: string
  cantidad: number
  stockMin: number
  stockMax: number | null
  createdAt: string
  updatedAt: string
}

export type ArticuloStockPorDepositoResponse = {
  success: true
  articuloId: number
  stockTotal: number
  enTransito: number
  depositos: StockDepositoRow[]
}

export type TransferenciaDepositoItemInput = {
  articuloId: number
  cantidadEnviada: number
}

export type TransferenciaDepositoItemRow = {
  id: number
  transferenciaId: number
  articuloId: number
  cantidadEnviada: number
  cantidadRecibida: number | null
  articuloCodigo?: number
  articuloDescripcion?: string
}

export type TransferenciaDepositoRow = {
  id: number
  tenantId: number
  numero: number
  origenId: number
  destinoId: number
  estado: TransferenciaDepositoEstado
  solicitadoPorId: number
  aprobadoPorId: number | null
  fechaEnvio: string | null
  fechaRecepcion: string | null
  nota: string | null
  createdAt: string
  updatedAt: string
  origenCodigo?: string
  destinoCodigo?: string
  items?: TransferenciaDepositoItemRow[]
}

export type TransferenciaDepositoCreateInput = {
  origenId: number
  destinoId: number
  nota?: string | null
  items: TransferenciaDepositoItemInput[]
}

export type TransferenciaDepositoRecibirInput = {
  items: Array<{ articuloId: number; cantidadRecibida: number }>
}

export type TransferenciaDepositoListResponse = PaginatedResponse<TransferenciaDepositoRow>
