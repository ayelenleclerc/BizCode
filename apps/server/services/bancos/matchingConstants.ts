/**
 * @en Tunable thresholds and enums for the bank reconciliation matching engine (#191).
 * @es Umbrales configurables y enums del motor de conciliación bancaria (#191).
 * @pt-BR Limiares configuráveis e enums do motor de conciliação bancária (#191).
 */

/** @en Max amount deviation (percent) allowed between a movement and a candidate. @es Desvío máximo de importe (porcentaje) entre movimiento y candidato. @pt-BR Desvio máximo de valor (porcentagem) entre movimento e candidato. */
export const AMOUNT_TOLERANCE_PCT = 0.5

/** @en Max days between movement and candidate dates for non-cheque forms. @es Días máximos entre fechas de movimiento y candidato para formas no-cheque. @pt-BR Dias máximos entre datas de movimento e candidato para formas não-cheque. */
export const DATE_TOLERANCE_DAYS = 3

/** @en Max days between movement date and cheque due date (fechaVencimiento). @es Días máximos entre fecha de movimiento y vencimiento de cheque. @pt-BR Dias máximos entre data de movimento e vencimento do cheque. */
export const CHEQUE_DATE_TOLERANCE_DAYS = 2

/** @en Minimum expected Mercado Pago fee percent (bank net = gross * (1 - fee)). @es Porcentaje mínimo esperado de comisión Mercado Pago. @pt-BR Percentual mínimo esperado de taxa Mercado Pago. */
export const MP_FEE_MIN_PCT = 3.99

/** @en Maximum expected Mercado Pago fee percent. @es Porcentaje máximo esperado de comisión Mercado Pago. @pt-BR Percentual máximo esperado de taxa Mercado Pago. */
export const MP_FEE_MAX_PCT = 6.99

/**
 * @en Lifecycle states of a bank movement's reconciliation match (#191).
 * @es Estados del ciclo de vida de la conciliación de un movimiento bancario (#191).
 * @pt-BR Estados do ciclo de vida da conciliação de um movimento bancário (#191).
 */
export const MATCH_ESTADOS = [
  'unmatched',
  'suggested',
  'matched_auto',
  'matched_manual',
  'ignored',
  'bank_fee',
] as const

export type MatchEstado = (typeof MATCH_ESTADOS)[number]

/**
 * @en Kind of internal record a movement was reconciled against (#191).
 * @es Tipo de registro interno contra el que se concilió un movimiento (#191).
 * @pt-BR Tipo de registro interno contra o qual um movimento foi conciliado (#191).
 */
export const CONCILIADO_TIPOS = ['recibo_forma', 'cobro'] as const

export type ConciliadoTipo = (typeof CONCILIADO_TIPOS)[number]
