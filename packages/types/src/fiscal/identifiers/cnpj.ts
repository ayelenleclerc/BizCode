/**
 * @en Brazilian CNPJ validation (14 digits, two modulo-11 check digits) (#211).
 *   Shared by client and server via the fiscal rule registry.
 * @es Validación de CNPJ brasileño (14 dígitos, dos dígitos verificadores módulo 11) (#211).
 *   Compartido cliente/servidor vía el registro de reglas fiscales.
 * @pt-BR Validação de CNPJ brasileiro (14 dígitos, dois dígitos verificadores módulo 11) (#211).
 *   Compartilhado cliente/servidor via o registro de regras fiscais.
 *
 * @en Official Receita Federal sample catalogs are not part of this repository: the algorithm is the
 *   public check-digit rule; repeated-digit sequences are rejected.
 * @es Los catálogos oficiales de la Receita Federal no forman parte de este repositorio: el algoritmo
 *   es la regla pública del dígito verificador; se rechazan secuencias de dígitos repetidos.
 * @pt-BR Os catálogos oficiais da Receita Federal não fazem parte deste repositório: o algoritmo é a
 *   regra pública do dígito verificador; sequências de dígitos repetidos são rejeitadas.
 */

const WEIGHTS_D1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const
const WEIGHTS_D2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function checkDigit(digits: number[], weights: readonly number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += digits[i] * weights[i]
  }
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

/**
 * @en Computes both CNPJ check digits from the first 12 digits, or null if the body is invalid.
 * @es Calcula ambos dígitos verificadores del CNPJ a partir de los 12 primeros, o null si el cuerpo es inválido.
 * @pt-BR Calcula ambos dígitos verificadores do CNPJ a partir dos 12 primeiros, ou null se o corpo for inválido.
 */
export function cnpjCheckDigits(body12: string): [number, number] | null {
  if (!/^\d{12}$/.test(body12)) return null
  if (/^(\d)\1{11}$/.test(body12)) return null
  const nums = body12.split('').map((c) => Number(c))
  const d1 = checkDigit(nums, WEIGHTS_D1)
  const d2 = checkDigit([...nums, d1], WEIGHTS_D2)
  return [d1, d2]
}

/**
 * @en Validates a Brazilian CNPJ (14 digits) including both modulo-11 check digits.
 * @es Valida un CNPJ brasileño (14 dígitos) incluyendo ambos dígitos verificadores módulo 11.
 * @pt-BR Valida um CNPJ brasileiro (14 dígitos) incluindo ambos os dígitos verificadores módulo 11.
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false
  const cleaned = onlyDigits(cnpj)
  if (cleaned.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleaned)) return false
  const expected = cnpjCheckDigits(cleaned.slice(0, 12))
  if (!expected) return false
  return cleaned[12] === String(expected[0]) && cleaned[13] === String(expected[1])
}

/**
 * @en Formats a CNPJ as `XX.XXX.XXX/XXXX-XX`; returns the input unchanged when not 14 digits.
 * @es Formatea un CNPJ como `XX.XXX.XXX/XXXX-XX`; devuelve la entrada intacta si no tiene 14 dígitos.
 * @pt-BR Formata um CNPJ como `XX.XXX.XXX/XXXX-XX`; devolve a entrada intacta se não tiver 14 dígitos.
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = onlyDigits(cnpj)
  if (cleaned.length !== 14) return cnpj
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
}
