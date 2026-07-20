import type { PaginatedResponse } from './api-contracts'

export type TurnoCajaEstado = 'abierto' | 'cerrado'

export type MovimientoCajaTipo = 'venta' | 'cobro' | 'egreso' | 'ingreso_extra'

export type MovimientoCajaFormaPago =
  | 'efectivo'
  | 'tarjeta'
  | 'mp'
  | 'transferencia'
  | 'otro'

export type ConteoEfectivoInput = {
  b1000?: number
  b500?: number
  b200?: number
  b100?: number
  b50?: number
  b20?: number
  b10?: number
  m10?: number
  m5?: number
  m2?: number
  m1?: number
}

export type ConteoEfectivoRow = ConteoEfectivoInput & {
  id: number
  turnoId: number
  total: number
}

export type MovimientoCajaRow = {
  id: number
  turnoId: number
  tipo: MovimientoCajaTipo
  formaPago: MovimientoCajaFormaPago
  importe: number
  concepto: string | null
  referenciaTipo: string | null
  referenciaId: number | null
  userId: number
  fecha: string
  user?: { id: number; username: string } | null
}

export type CajaRow = {
  id: number
  nombre: string
  activa: boolean
  createdAt: string
  updatedAt: string
}

export type TurnoCajaRow = {
  id: number
  cajaId: number
  cajeroId: number
  estado: TurnoCajaEstado
  montoApertura: number
  fechaApertura: string
  fechaCierre: string | null
  totalVentasEfectivo: number | null
  totalVentasTarjeta: number | null
  totalVentasMP: number | null
  totalVentasTransf: number | null
  totalEgresos: number | null
  totalIngresosExtra: number | null
  efectivoEsperado: number | null
  efectivoContado: number | null
  diferencia: number | null
  observaciones: string | null
  createdAt: string
  updatedAt: string
  caja?: CajaRow | null
  cajero?: { id: number; username: string } | null
  conteo?: ConteoEfectivoRow | null
  movimientos?: MovimientoCajaRow[]
}

export type TurnoCajaListResponse = PaginatedResponse<TurnoCajaRow> & {
  success: boolean
  counts?: {
    abiertos: number
    cerradosHoy: number
    diferenciaHoy: number
  }
}

export type CajaListResponse = {
  success: boolean
  data: CajaRow[]
}

export type TurnoCajaOpenInput = {
  cajaId: number
  montoApertura: number
}

export type TurnoCajaCloseInput = {
  conteo: ConteoEfectivoInput
  observaciones?: string | null
}

export type MovimientoCajaManualInput = {
  tipo: 'egreso' | 'ingreso_extra'
  importe: number
  concepto?: string | null
  formaPago?: MovimientoCajaFormaPago
}
