/**
 * @en Mexican RFC validation (persona moral 12 chars / persona física 13 chars) with modulo-11
 *   check digit (#210). Shared by client and server via the fiscal rule registry.
 * @es Validación de RFC mexicano (persona moral 12 / física 13) con dígito verificador módulo 11
 *   (#210). Compartido cliente/servidor vía el registro de reglas fiscales.
 * @pt-BR Validação de RFC mexicano (pessoa moral 12 / física 13) com dígito verificador módulo 11
 *   (#210). Compartilhado cliente/servidor via o registro de regras fiscais.
 *
 * @en The SAT official sample catalog is not part of this repository: the algorithm below is the
 *   documented public check-digit rule and the test vectors are derived from it.
 * @es El catálogo oficial de muestras del SAT no forma parte de este repositorio: el algoritmo es
 *   la regla pública del dígito verificador y los vectores de prueba se derivan de él.
 * @pt-BR O catálogo oficial de amostras do SAT não faz parte deste repositório: o algoritmo é a
 *   regra pública do dígito verificador e os vetores de teste derivam dele.
 */

const RFC_CHAR_VALUES: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 18,
  J: 19,
  K: 20,
  L: 21,
  M: 22,
  N: 23,
  '&': 24,
  O: 25,
  P: 26,
  Q: 27,
  R: 28,
  S: 29,
  T: 30,
  U: 31,
  V: 32,
  W: 33,
  X: 34,
  Y: 35,
  Z: 36,
  ' ': 37,
  Ñ: 38,
}

const RFC_MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/
const RFC_FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/

/**
 * @en Computes the RFC check character from the body without the final digit, or null if malformed.
 * @es Calcula el carácter verificador del RFC a partir del cuerpo sin el dígito final, o null si es inválido.
 * @pt-BR Calcula o caractere verificador do RFC a partir do corpo sem o dígito final, ou null se for inválido.
 */
export function rfcCheckDigit(body: string): string | null {
  if (!/^[A-ZÑ&\d ]{11,12}$/.test(body)) return null
  const padded = body.length === 11 ? ` ${body}` : body
  if (padded.length !== 12) return null

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const value = RFC_CHAR_VALUES[padded[i]]
    if (value === undefined) return null
    sum += value * (13 - i)
  }

  const remainder = sum % 11
  const diff = 11 - remainder
  if (diff === 11) return '0'
  if (diff === 10) return 'A'
  return String(diff)
}

/**
 * @en Validates a Mexican RFC (moral 12 or física 13) including the modulo-11 check digit.
 * @es Valida un RFC mexicano (moral 12 o física 13) incluyendo el dígito verificador módulo 11.
 * @pt-BR Valida um RFC mexicano (moral 12 ou física 13) incluindo o dígito verificador módulo 11.
 */
export function validateRFC(rfc: string): boolean {
  if (!rfc) return false
  const cleaned = rfc.replace(/[-\s.]/g, '').toUpperCase()
  if (!RFC_MORAL.test(cleaned) && !RFC_FISICA.test(cleaned)) return false

  const body = cleaned.slice(0, -1)
  const expected = rfcCheckDigit(body)
  return expected !== null && expected === cleaned[cleaned.length - 1]
}

/**
 * @en Formats an RFC in uppercase without separators; returns the input when length is unexpected.
 * @es Formatea un RFC en mayúsculas sin separadores; devuelve la entrada si la longitud no es la esperada.
 * @pt-BR Formata um RFC em maiúsculas sem separadores; devolve a entrada se o comprimento for inesperado.
 */
export function formatRFC(rfc: string): string {
  const cleaned = rfc.replace(/[-\s.]/g, '').toUpperCase()
  if (cleaned.length !== 12 && cleaned.length !== 13) return rfc
  return cleaned
}
