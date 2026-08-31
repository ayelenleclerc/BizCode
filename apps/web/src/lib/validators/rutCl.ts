/**
 * @en Chilean RUT validation (modulo 11). Shared by client and server (#208).
 * @es Validacion RUT chileno (modulo 11). Compartido cliente/servidor (#208).
 * @pt-BR Validacao RUT chileno (modulo 11). Compartilhado cliente/servidor (#208).
 *
 * @en Same name as the Uruguayan RUT but a different algorithm: 7-8 body digits, cyclic weights
 *   2..7 applied right to left, and a check digit that can be `K` (remainder 10) or `0`
 *   (remainder 11). The SII specification is not part of this repository: the rule below is the
 *   documented public one and the test vectors are derived from it, not from SII sample data.
 * @es Mismo nombre que el RUT uruguayo pero otro algoritmo: 7-8 digitos de cuerpo, pesos ciclicos
 *   2..7 aplicados de derecha a izquierda, y un verificador que puede ser `K` (resto 10) o `0`
 *   (resto 11). La especificacion del SII no forma parte de este repositorio: la regla es la
 *   publica documentada y los vectores de prueba se derivan de ella, no de datos del SII.
 * @pt-BR Mesmo nome do RUT uruguaio, mas outro algoritmo: 7-8 digitos de corpo, pesos ciclicos
 *   2..7 aplicados da direita para a esquerda, e um verificador que pode ser `K` (resto 10) ou `0`
 *   (resto 11). A especificacao do SII nao faz parte deste repositorio: a regra e a publica
 *   documentada e os vetores de teste derivam dela, nao de dados do SII.
 */

const RUT_CL_BODY_PATTERN = /^\d{7,8}$/
const RUT_CL_MIN_WEIGHT = 2
const RUT_CL_MAX_WEIGHT = 7

/**
 * @en Computes the Chilean RUT check digit from its body, or null when the body is malformed.
 *   Returns `'K'` for remainder 10 and `'0'` for remainder 11, as the SII convention requires.
 * @es Calcula el verificador del RUT chileno a partir del cuerpo, o null si el cuerpo es invalido.
 *   Devuelve `'K'` para resto 10 y `'0'` para resto 11, segun la convencion del SII.
 * @pt-BR Calcula o verificador do RUT chileno a partir do corpo, ou null se o corpo for invalido.
 *   Retorna `'K'` para resto 10 e `'0'` para resto 11, conforme a convencao do SII.
 */
export function rutClCheckDigit(body: string): string | null {
  if (!RUT_CL_BODY_PATTERN.test(body)) return null

  let sum = 0
  let weight = RUT_CL_MIN_WEIGHT
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * weight
    weight = weight === RUT_CL_MAX_WEIGHT ? RUT_CL_MIN_WEIGHT : weight + 1
  }

  const remainder = 11 - (sum % 11)
  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'
  return String(remainder)
}

/**
 * @en Validates a Chilean RUT: 7-8 body digits plus the modulo 11 check digit, which may be `K`.
 * @es Valida un RUT chileno: 7-8 digitos de cuerpo mas el verificador de modulo 11, que puede ser `K`.
 * @pt-BR Valida um RUT chileno: 7-8 digitos de corpo mais o verificador de modulo 11, que pode ser `K`.
 */
export function validateRUTCL(rut: string): boolean {
  if (!rut) return false

  const cleaned = rut.replace(/[-.\s]/g, '').toUpperCase()
  if (!/^\d{7,8}[\dK]$/.test(cleaned)) return false

  const body = cleaned.slice(0, -1)
  const expected = rutClCheckDigit(body)
  return expected !== null && expected === cleaned.slice(-1)
}

/**
 * @en Formats a Chilean RUT as `XX.XXX.XXX-D`; returns the input untouched when it is malformed.
 * @es Formatea un RUT chileno como `XX.XXX.XXX-D`; devuelve la entrada intacta si es invalida.
 * @pt-BR Formata um RUT chileno como `XX.XXX.XXX-D`; devolve a entrada intacta se for invalida.
 */
export function formatRUTCL(rut: string): string {
  const cleaned = rut.replace(/[-.\s]/g, '').toUpperCase()
  if (!/^\d{7,8}[\dK]$/.test(cleaned)) return rut

  const body = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped}-${checkDigit}`
}
