/**
 * @en Uruguayan RUT validation (modulo 11). Shared by client and server (#207).
 * @es Validacion RUT uruguayo (modulo 11). Compartido cliente/servidor (#207).
 * @pt-BR Validacao RUT uruguaio (modulo 11). Compartilhado cliente/servidor (#207).
 *
 * @en The DGI specification is not part of this repository: the algorithm below (12 digits, check
 *   digit over the first 11 with weights 4,3,6,7,8,9,2,3,4,5,6) is the documented public rule and the
 *   test vectors are derived from it, not from DGI sample data.
 * @es La especificacion de DGI no forma parte de este repositorio: el algoritmo (12 digitos, verificador
 *   sobre los 11 primeros con pesos 4,3,6,7,8,9,2,3,4,5,6) es la regla publica documentada y los vectores
 *   de prueba se derivan de el, no de datos de muestra de DGI.
 * @pt-BR A especificacao da DGI nao faz parte deste repositorio: o algoritmo (12 digitos, verificador
 *   sobre os 11 primeiros com pesos 4,3,6,7,8,9,2,3,4,5,6) e a regra publica documentada e os vetores
 *   de teste derivam dele, nao de dados de amostra da DGI.
 */

const RUT_LENGTH = 12
const RUT_WEIGHTS = [4, 3, 6, 7, 8, 9, 2, 3, 4, 5, 6] as const

/**
 * @en Computes the RUT check digit from its first 11 digits, or null when the input is malformed.
 * @es Calcula el digito verificador del RUT a partir de sus 11 primeros digitos, o null si el dato es invalido.
 * @pt-BR Calcula o digito verificador do RUT a partir dos 11 primeiros digitos, ou null se o dado for invalido.
 */
export function rutCheckDigit(body: string): number | null {
  if (!/^\d{11}$/.test(body)) return null

  let sum = 0
  for (let i = 0; i < RUT_WEIGHTS.length; i++) {
    sum += Number(body[i]) * RUT_WEIGHTS[i]
  }

  const remainder = sum % 11
  if (remainder === 1) return null
  return remainder === 0 ? 0 : 11 - remainder
}

/**
 * @en Validates a Uruguayan RUT: 12 digits where the last one is the modulo 11 check digit.
 * @es Valida un RUT uruguayo: 12 digitos donde el ultimo es el verificador de modulo 11.
 * @pt-BR Valida um RUT uruguaio: 12 digitos em que o ultimo e o verificador de modulo 11.
 */
export function validateRUT(rut: string): boolean {
  if (!rut) return false

  const cleaned = rut.replace(/[-.\s]/g, '')
  if (!new RegExp(`^\\d{${RUT_LENGTH}}$`).test(cleaned)) return false

  const expected = rutCheckDigit(cleaned.slice(0, 11))
  return expected !== null && expected === Number(cleaned[11])
}

/**
 * @en Formats a RUT as `XX-XXXXXX-XXXX`; returns the input untouched when it has no 12 digits.
 * @es Formatea un RUT como `XX-XXXXXX-XXXX`; devuelve la entrada intacta si no tiene 12 digitos.
 * @pt-BR Formata um RUT como `XX-XXXXXX-XXXX`; devolve a entrada intacta se nao tiver 12 digitos.
 */
export function formatRUT(rut: string): string {
  const cleaned = rut.replace(/[-.\s]/g, '')
  if (cleaned.length !== RUT_LENGTH) return rut
  return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 8)}-${cleaned.substring(8)}`
}
