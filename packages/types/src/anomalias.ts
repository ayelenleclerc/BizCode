/**
 * @en Types for billing anomaly threshold config (#200 residual).
 * @es Tipos de configuración de umbrales de anomalía de facturación (#200 residual).
 * @pt-BR Tipos de configuração de limiares de anomalia de faturamento (#200 residual).
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
