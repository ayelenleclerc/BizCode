/**
 * @en Types for the export vertical MVP (#206): operation currency, Incoterms and customs broker contact.
 * @es Tipos del MVP del vertical exportación (#206): moneda de la operación, Incoterms y despachante.
 * @pt-BR Tipos do MVP do vertical exportação (#206): moeda da operação, Incoterms e despachante aduaneiro.
 *
 * @en Local record only: no AFIP type E voucher, no MonId/MonCotiz, no MULC settlement.
 * @es Registro local únicamente: sin comprobante AFIP tipo E, sin MonId/MonCotiz, sin liquidación MULC.
 * @pt-BR Somente registro local: sem comprovante AFIP tipo E, sem MonId/MonCotiz, sem liquidação MULC.
 */

/**
 * @en Incoterms 2020 rules published by the ICC; informational field on invoices and orders.
 * @es Reglas Incoterms 2020 de la ICC; campo informativo en facturas y pedidos.
 * @pt-BR Regras Incoterms 2020 da ICC; campo informativo em faturas e pedidos.
 */
export const INCOTERMS_2020 = [
  'EXW',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
] as const

export type Incoterm = (typeof INCOTERMS_2020)[number]

/**
 * @en Currency used as the tenant local currency for balances and totals.
 * @es Moneda considerada local para saldos y totales.
 * @pt-BR Moeda considerada local para saldos e totais.
 */
export const LOCAL_CURRENCY = 'ARS'

/**
 * @en Currencies an operation can be denominated in; mirrors the FX catalog of #243 plus the local one.
 * @es Monedas en que puede denominarse una operación; refleja el catálogo FX de #243 más la local.
 * @pt-BR Moedas em que uma operação pode ser denominada; reflete o catálogo FX de #243 mais a local.
 */
export const OPERATION_CURRENCIES = ['ARS', 'USD', 'EUR'] as const

export type OperationCurrency = (typeof OPERATION_CURRENCIES)[number]

export type ExportOperationInput = {
  monedaOperacion?: string | null
  totalMonedaOperacion?: number | null
  tipoCambioValor?: number | null
  incoterm?: string | null
  paisDestino?: string | null
}

export type ExportOperationFields = {
  monedaOperacion: OperationCurrency | null
  totalMonedaOperacion: number | null
  tipoCambioValor: number | null
  incoterm: Incoterm | null
  paisDestino: string | null
}

export type DespachanteInput = {
  despachanteNombre?: string | null
  despachanteEmail?: string | null
}

export type DespachanteFields = {
  despachanteNombre: string | null
  despachanteEmail: string | null
}

/**
 * @en Customer running balance for a single currency; money is serialized as a 2-decimal string.
 * @es Saldo corrido del cliente por moneda; el dinero se serializa como string de 2 decimales.
 * @pt-BR Saldo corrente do cliente por moeda; o dinheiro é serializado como string de 2 decimais.
 */
export type SaldoPorMoneda = {
  moneda: string
  saldo: string
}

export type DespachanteNotificationResult = {
  pedidoId: number
  despachanteEmail: string
  /**
   * @en False when SMTP is not configured; the attempt is still audited.
   * @es Falso cuando SMTP no está configurado; el intento igual se audita.
   * @pt-BR Falso quando o SMTP não está configurado; a tentativa é auditada de qualquer forma.
   */
  enviado: boolean
}
