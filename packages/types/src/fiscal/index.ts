/**
 * @en Public surface of the per-country fiscal rule registry (#440).
 * @es Superficie publica del registro de reglas fiscales por pais (#440).
 * @pt-BR Superficie publica do registro de regras fiscais por pais (#440).
 */

export * from './types'
export * from './registry'
export { formatCUIT, validateCUIT } from './identifiers/cuit'
export { formatRUT, rutCheckDigit, validateRUT } from './identifiers/rutUy'
export { formatRUTCL, rutClCheckDigit, validateRUTCL } from './identifiers/rutCl'
export { formatRFC, rfcCheckDigit, validateRFC } from './identifiers/rfc'
export { formatCBU, validateCBU, CBU_DIGITS } from './identifiers/cbu'
