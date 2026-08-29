/**
 * @en Pure validation helpers for invoicing (tax ids, codes, prices, VAT).
 * @es Funciones puras de validación para facturación (identificadores fiscales, códigos, precios, IVA).
 * @pt-BR Funções puras de validação para faturamento (identificadores fiscais, códigos, preços, IVA).
 */

import { FISCAL_JURISDICTIONS, resolveJurisdiction } from '@bizcode/types'
import { formatCUIT, validateCUIT } from './validators/cuit'
import { formatRUT, validateRUT } from './validators/rut'

export { formatCUIT, validateCUIT } from './validators/cuit'
export { formatRUT, rutCheckDigit, validateRUT } from './validators/rut'

/**
 * @en Validates a tax identifier with the algorithm of the given jurisdiction (#207).
 * @es Valida un identificador fiscal con el algoritmo de la jurisdicción indicada (#207).
 * @pt-BR Valida um identificador fiscal com o algoritmo da jurisdição informada (#207).
 */
export function validateTaxId(taxId: string, jurisdiction: unknown): boolean {
  return FISCAL_JURISDICTIONS[resolveJurisdiction(jurisdiction)].taxIdKind === 'rut'
    ? validateRUT(taxId)
    : validateCUIT(taxId)
}

/**
 * @en Formats a tax identifier following the convention of the given jurisdiction (#207).
 * @es Formatea un identificador fiscal según la convención de la jurisdicción indicada (#207).
 * @pt-BR Formata um identificador fiscal conforme a convenção da jurisdição informada (#207).
 */
export function formatTaxId(taxId: string, jurisdiction: unknown): string {
  return FISCAL_JURISDICTIONS[resolveJurisdiction(jurisdiction)].taxIdKind === 'rut'
    ? formatRUT(taxId)
    : formatCUIT(taxId)
}

const CBU_BLOCK1_WEIGHTS = [7, 1, 3, 9, 7, 1, 3] as const
const CBU_BLOCK2_WEIGHTS = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3] as const

/**
 * @en Validates Argentine CBU check digits (22 numeric digits).
 * @es Valida dígitos verificadores de CBU argentino (22 dígitos numéricos).
 * @pt-BR Valida dígitos verificadores de CBU argentino (22 dígitos numéricos).
 */
export function validateCBU(cbu: string): boolean {
  if (!cbu) return false
  const cleaned = cbu.replace(/\D/g, '')
  if (!/^\d{22}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += Number(cleaned[i]) * CBU_BLOCK1_WEIGHTS[i]
  }
  let check = (10 - (sum % 10)) % 10
  if (check !== Number(cleaned[7])) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += Number(cleaned[8 + i]) * CBU_BLOCK2_WEIGHTS[i]
  }
  check = (10 - (sum % 10)) % 10
  return check === Number(cleaned[21])
}

/**
 * @en VAT rates accepted by `calculateIVA`: the two rates of each supported jurisdiction plus exempt (#207).
 * @es Alícuotas admitidas por `calculateIVA`: las dos de cada jurisdicción soportada más exento (#207).
 * @pt-BR Alíquotas aceitas por `calculateIVA`: as duas de cada jurisdição suportada mais isento (#207).
 */
export type VatRateLiteral = '21' | '10.5' | '22' | '10' | '0'

/**
 * Calcula IVA sobre un monto según alícuota
 */
export function calculateIVA(amount: number, rate: VatRateLiteral): number {
  const rateNum = parseFloat(rate)
  return parseFloat(((amount * rateNum) / 100).toFixed(2))
}

/**
 * Valida un código de artículo o cliente (debe ser positivo)
 */
export function validateCode(code: string | number): boolean {
  const num = typeof code === 'string' ? parseInt(code) : code
  return num > 0 && num <= 999999
}

/**
 * Valida precio (debe ser positivo, máximo 2 decimales)
 */
export function validatePrice(price: string | number): boolean {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num) || num < 0) return false
  const str = String(num)
  const parts = str.split('.')
  return !parts[1] || parts[1].length <= 2
}
