/**
 * @en Seller credit / stock alert shared types (#256).
 * @es Tipos compartidos de alertas de crédito / stock Seller (#256).
 * @pt-BR Tipos compartilhados de alertas de crédito / estoque Seller (#256).
 */

/** @en Policy action when a threshold is hit. @es Acción de política al umbral. @pt-BR Ação de política no limiar. */
export type SellerAlertAction = 'warn' | 'block'

/** @en Credit alert severity for the seller client card (#256). @es Severidad de alerta de crédito en ficha Seller (#256). @pt-BR Severidade do alerta de crédito na ficha Seller (#256). */
export type SellerCreditNivel = 'ok' | 'amarillo' | 'naranja' | 'rojo'

/** @en Stock line status for multi-id lookup (#256). @es Estado de stock por línea (#256). @pt-BR Status de estoque por linha (#256). */
export type SellerStockEstado = 'ok' | 'bajo' | 'cero'

export type SellerPolicies = {
  sellerCreditOverLimitAction: SellerAlertAction
  sellerCreditOverdueAction: SellerAlertAction
  sellerStockZeroAction: SellerAlertAction
  sellerStockCapQtyToAvailable: boolean
}

export type SellerPoliciesPatchInput = Partial<SellerPolicies>

export type EstadoCreditoFacturaPendiente = {
  id: number
  saldo: string
  vencimiento: string
  diasMora: number
}

export type EstadoCredito = {
  deudaTotal: string
  deudaVencida: string
  limiteCredito: string | null
  disponible: string | null
  diasMoraMax: number
  nivel: SellerCreditNivel
  facturasPendientes: EstadoCreditoFacturaPendiente[]
  asOf: string
}

export type StockMultipleItem = {
  articuloId: number
  stock: number
  stockMin: number
  estado: SellerStockEstado
}

export type StockMultipleResult = {
  asOf: string
  items: StockMultipleItem[]
}
