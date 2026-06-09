/**
 * @en Pure validation helpers for invoicing (CUIT, codes, prices, VAT).
 * @es Funciones puras de validación para facturación (CUIT, códigos, precios, IVA).
 * @pt-BR Funções puras de validação para faturamento (CUIT, códigos, preços, IVA).
 */

/**
 * @en Validates an Argentine CUIT check digit (modulo 11). Accepts digits with or without hyphens/spaces.
 * @es Valida el dígito verificador de un CUIT argentino (módulo 11). Acepta dígitos con o sin guiones.
 * @pt-BR Valida o dígito verificador de um CUIT argentino (módulo 11). Aceita dígitos com ou sem hífens.
 */
export function validateCUIT(cuit: string): boolean {
  if (!cuit) return false

  const cleaned = cuit.replace(/[-\s]/g, '')

  if (!/^\d{11}$/.test(cleaned)) return false

  const digits = cleaned.split('').map(Number)
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0

  for (let i = 0; i < 10; i++) {
    sum += digits[i] * mult[i]
  }

  const remainder = sum % 11
  const check = remainder === 0 ? 0 : 11 - remainder

  return check === digits[10]
}

/**
 * Formatea un CUIT con guiones
 * Entrada: "20123456789" → Salida: "20-12345678-9"
 */
export function formatCUIT(cuit: string): string {
  const cleaned = cuit.replace(/[-\s]/g, '')
  if (cleaned.length !== 11) return cuit
  return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`
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
 * Calcula IVA sobre un monto según alícuota
 */
export function calculateIVA(amount: number, rate: '21' | '10.5' | '0'): number {
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
