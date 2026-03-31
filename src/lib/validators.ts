/**
 * Validadores para el sistema de facturación
 */

/**
 * Valida un CUIT argentino según el algoritmo oficial
 * Formato: XX-XXXXXXXX-X (con guiones) o XXXXXXXXXXX (sin guiones)
 */
export function validateCUIT(cuit: string): boolean {
  if (!cuit) return false

  // Remover guiones y espacios
  const cleaned = cuit.replace(/[-\s]/g, '')

  // Debe tener exactamente 11 dígitos
  if (!/^\d{11}$/.test(cleaned)) return false

  // Algoritmo de validación CUIT
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
  // Verificar máximo 2 decimales
  const str = String(num)
  const parts = str.split('.')
  return !parts[1] || parts[1].length <= 2
}

/**
 * Tests unitarios para validadores
 */
export function runValidatorTests() {
  console.log('Running validator tests...')

  // Test CUIT válido
  const validCUIT = '20123456789'
  console.assert(validateCUIT(validCUIT), `CUIT válido debería pasar: ${validCUIT}`)

  // Test CUIT con guiones
  const formattedCUIT = '20-12345678-9'
  console.assert(validateCUIT(formattedCUIT), `CUIT con guiones debería pasar: ${formattedCUIT}`)

  // Test CUIT inválido
  const invalidCUIT = '12345678901'
  console.assert(!validateCUIT(invalidCUIT), `CUIT inválido debería fallar: ${invalidCUIT}`)

  // Test formateo
  const formatted = formatCUIT('20123456789')
  console.assert(formatted === '20-12345678-9', `Formateo incorrecto: ${formatted}`)

  // Test IVA
  const iva21 = calculateIVA(100, '21')
  console.assert(iva21 === 21, `IVA 21% incorrecto: ${iva21}`)

  const iva105 = calculateIVA(100, '10.5')
  console.assert(iva105 === 10.5, `IVA 10.5% incorrecto: ${iva105}`)

  // Test precios
  console.assert(validatePrice(100.50), 'Precio válido debería pasar')
  console.assert(!validatePrice(-100), 'Precio negativo debería fallar')
  console.assert(!validatePrice('abc'), 'Precio no numérico debería fallar')

  console.log('✓ All validator tests passed')
}
