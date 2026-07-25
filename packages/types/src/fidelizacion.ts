/**
 * @en Types for the customer loyalty points program (#250).
 * @es Tipos del programa de puntos de fidelización (#250).
 * @pt-BR Tipos do programa de pontos de fidelização (#250).
 */

export const MOVIMIENTO_PUNTOS_TIPOS = [
  'acumulacion',
  'canje',
  'ajuste',
  'vencimiento',
  'reverso',
] as const
export type MovimientoPuntosTipo = (typeof MOVIMIENTO_PUNTOS_TIPOS)[number]

export type ConfigFidelizacionRow = {
  id: number
  tenantId: number
  activo: boolean
  nombre: string
  pesosPorPunto: number
  puntosPorPeso: number
  mesesVencimiento: number | null
  montoMinCompra: number
  aplicaEnDescuento: boolean
  createdAt: string
  updatedAt: string
}

export type ConfigFidelizacionUpsertInput = {
  activo: boolean
  nombre?: string
  pesosPorPunto: number
  puntosPorPeso: number
  mesesVencimiento?: number | null
  montoMinCompra?: number
  aplicaEnDescuento?: boolean
}

export type MovimientoPuntosRow = {
  id: number
  tenantId: number
  clienteId: number
  tipo: MovimientoPuntosTipo
  puntos: number
  saldoPost: number
  puntosRestantes: number | null
  referenciaFacturaId: number | null
  venceEn: string | null
  concepto: string | null
  userId: number | null
  createdAt: string
}

export type ClientePuntosDetail = {
  clienteId: number
  puntos: number
  equivalenteDinero: number
  movimientos: MovimientoPuntosRow[]
  totalMovimientos: number
}

export type FidelizacionAjusteInput = {
  clienteId: number
  puntos: number
  concepto?: string | null
}

export type FidelizacionDashboard = {
  puntosEmitidos: number
  puntosCanjeados: number
  puntosVencidos: number
  puntosAjustados: number
  pasivoPuntos: number
  pasivoDinero: number
  ranking: Array<{
    clienteId: number
    codigo: number
    rsocial: string
    puntos: number
    equivalenteDinero: number
  }>
}

export type PortalFidelizacionSummary = {
  puntos: number
  equivalenteDinero: number
  programaActivo: boolean
  nombrePrograma: string | null
}
