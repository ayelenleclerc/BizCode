/**
 * @en Types for billing anomaly threshold config and detected rows (#200).
 * @es Tipos de umbrales de anomalía y filas detectadas (#200).
 * @pt-BR Tipos de limiares de anomalia e linhas detectadas (#200).
 */

export type ConfigAnomaliaFacturaRow = {
  id: number
  tenantId: number
  minHistory: number
  zScoreThreshold: number
  discountThresholdPct: number
  newCustomerCreditFraction: number
  createdAt: string
  updatedAt: string
}

export type ConfigAnomaliaFacturaUpsertInput = {
  minHistory: number
  zScoreThreshold: number
  discountThresholdPct: number
  newCustomerCreditFraction: number
}

export type AnomaliaDetectadaTipo =
  | 'factura_duplicada'
  | 'monto_inusual'
  | 'descuento_excesivo'
  | 'cliente_nuevo_compra_grande'

export type AnomaliaDetectadaRow = {
  id: number
  tenantId: number
  tipo: AnomaliaDetectadaTipo | string
  severidad: string
  facturaId: number | null
  clienteId: number | null
  descripcion: string
  detalle: Record<string, unknown> | null
  confirmada: boolean
  createdAt: string
}

export type AnomaliaDetectadaListFilters = {
  tipo?: string
  confirmada?: boolean
  clienteId?: number
  facturaId?: number
  limit?: number
  offset?: number
}
