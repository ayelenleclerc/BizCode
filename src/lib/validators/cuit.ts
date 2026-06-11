/**
 * @en Argentine CUIT validation (modulo 11). Shared by client and server (#242).
 * @es Validación CUIT argentino (módulo 11). Compartido cliente/servidor (#242).
 * @pt-BR Validação CUIT argentino (módulo 11). Compartilhado cliente/servidor (#242).
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

export function formatCUIT(cuit: string): string {
  const cleaned = cuit.replace(/[-\s]/g, '')
  if (cleaned.length !== 11) return cuit
  return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`
}
