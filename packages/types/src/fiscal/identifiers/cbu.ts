/**
 * @en Argentine CBU validation (two check digits over 22 numeric digits). Declared by the Argentine
 *   rule set, not by the core, because other jurisdictions use different bank identifiers (#440).
 * @es Validacion del CBU argentino (dos digitos verificadores sobre 22 digitos). La declara el
 *   conjunto de reglas argentino, no el nucleo, porque otras jurisdicciones usan otros
 *   identificadores bancarios (#440).
 * @pt-BR Validacao do CBU argentino (dois digitos verificadores sobre 22 digitos). E declarada pelo
 *   conjunto de regras argentino, nao pelo nucleo, porque outras jurisdicoes usam outros
 *   identificadores bancarios (#440).
 */

const CBU_BLOCK1_WEIGHTS = [7, 1, 3, 9, 7, 1, 3] as const
const CBU_BLOCK2_WEIGHTS = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3] as const

export const CBU_DIGITS = 22

/**
 * @en Validates Argentine CBU check digits (22 numeric digits).
 * @es Valida digitos verificadores de CBU argentino (22 digitos numericos).
 * @pt-BR Valida digitos verificadores de CBU argentino (22 digitos numericos).
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
 * @en Strips separators from a CBU; returns the input untouched when it has no 22 digits.
 * @es Quita separadores de un CBU; devuelve la entrada intacta si no tiene 22 digitos.
 * @pt-BR Remove separadores de um CBU; devolve a entrada intacta se nao tiver 22 digitos.
 */
export function formatCBU(cbu: string): string {
  const cleaned = cbu.replace(/\D/g, '')
  return cleaned.length === CBU_DIGITS ? cleaned : cbu
}
