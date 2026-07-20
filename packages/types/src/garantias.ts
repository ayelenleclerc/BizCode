import type { PaginatedResponse } from './api-contracts'

export type GarantiaEstado = 'vigente' | 'vencida' | 'anulada'

export type GarantiaUsoRow = {
  id: number
  garantiaId: number
  otId: number | null
  descripcion: string
  fecha: string
  userId: number
  user?: { id: number; username: string } | null
}

export type GarantiaRow = {
  id: number
  articuloId: number
  facturaId: number | null
  facturaItemId: number | null
  nroSerie: string | null
  nroImei: string | null
  descripcionEquipo: string | null
  clienteId: number
  fechaVenta: string
  mesesGarantia: number
  fechaVencimiento: string
  estado: GarantiaEstado
  createdAt: string
  updatedAt: string
  cliente?: { id: number; codigo: number; rsocial: string }
  articulo?: { id: number; codigo: number; descripcion: string }
  factura?: { id: number; tipo: string; prefijo: string; numero: number } | null
  usos?: GarantiaUsoRow[]
}

export type GarantiaLookupResult =
  | { status: 'vigente'; garantia: GarantiaRow }
  | { status: 'vencida'; garantia: GarantiaRow }
  | { status: 'sin_registro' }

export type GarantiaListResponse = PaginatedResponse<GarantiaRow> & {
  success: boolean
  counts?: {
    vigente: number
    vencida: number
    anulada: number
    vencenEsteMes: number
    vencenProximos3Meses: number
  }
}

export type GarantiaRegisterInput = {
  articuloId: number
  clienteId: number
  facturaId?: number | null
  facturaItemId?: number | null
  nroSerie?: string | null
  nroImei?: string | null
  descripcionEquipo?: string | null
  fechaVenta?: string
  mesesGarantia?: number
}

export type GarantiaUsoInput = {
  otId?: number | null
  descripcion: string
}
