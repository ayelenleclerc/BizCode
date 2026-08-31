/**
 * @en Pure validation helpers for invoicing. Tax and bank identifier algorithms live in the
 *   per-country rule registry (`@bizcode/types`, #440); this module keeps the historical surface.
 * @es Funciones puras de validacion para facturacion. Los algoritmos de identificador fiscal y
 *   bancario viven en el registro de reglas por pais (`@bizcode/types`, #440); este modulo conserva
 *   la superficie historica.
 * @pt-BR Funcoes puras de validacao para faturamento. Os algoritmos de identificador fiscal e
 *   bancario vivem no registro de regras por pais (`@bizcode/types`, #440); este modulo mantem a
 *   superficie historica.
 */

import { getFiscalRules } from '@bizcode/types'

export {
  formatCUIT,
  validateCUIT,
  formatRUT,
  rutCheckDigit,
  validateRUT,
  formatRUTCL,
  rutClCheckDigit,
  validateRUTCL,
  validateCBU,
  formatCBU,
} from '@bizcode/types'

/**
 * @en Validates a tax identifier with the algorithm of the given jurisdiction (#207).
 * @es Valida un identificador fiscal con el algoritmo de la jurisdicción indicada (#207).
 * @pt-BR Valida um identificador fiscal com o algoritmo da jurisdição informada (#207).
 */
export function validateTaxId(taxId: string, jurisdiction: unknown): boolean {
  return getFiscalRules(jurisdiction).taxId.validate(taxId)
}

/**
 * @en Formats a tax identifier following the convention of the given jurisdiction (#207).
 * @es Formatea un identificador fiscal según la convención de la jurisdicción indicada (#207).
 * @pt-BR Formata um identificador fiscal conforme a convenção da jurisdição informada (#207).
 */
export function formatTaxId(taxId: string, jurisdiction: unknown): string {
  return getFiscalRules(jurisdiction).taxId.format(taxId)
}

/**
 * @en Validates a bank account identifier with the rules of the given jurisdiction (#440). Countries
 *   without an evidenced bank identifier accept any non-empty value rather than rejecting it.
 * @es Valida un identificador bancario con las reglas de la jurisdicción indicada (#440). Los países
 *   sin identificador bancario evidenciado aceptan cualquier valor no vacío en vez de rechazarlo.
 * @pt-BR Valida um identificador bancário com as regras da jurisdição informada (#440). Os países
 *   sem identificador bancário evidenciado aceitam qualquer valor não vazio em vez de rejeitá-lo.
 */
export function validateBankAccount(value: string, jurisdiction: unknown): boolean {
  const rules = getFiscalRules(jurisdiction).bankAccount
  return rules ? rules.validate(value) : value.trim().length > 0
}

/**
 * @en VAT rates accepted by `calculateIVA`: the rates of every supported jurisdiction plus exempt (#207).
 * @es Alícuotas admitidas por `calculateIVA`: las de cada jurisdicción soportada más exento (#207).
 * @pt-BR Alíquotas aceitas por `calculateIVA`: as de cada jurisdição suportada mais isento (#207).
 */
export type VatRateLiteral = '21' | '10.5' | '22' | '19' | '10' | '0'

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
