/**
 * @en Mexican RFC check digit and validation (#210).
 * @es Dígito verificador y validación del RFC mexicano (#210).
 * @pt-BR Dígito verificador e validação do RFC mexicano (#210).
 */

import { describe, expect, it } from 'vitest'
import {
  formatRFC,
  rfcCheckDigit,
  validateRFC,
} from '../../../packages/types/src/fiscal/identifiers/rfc'

describe('Mexican RFC (#210)', () => {
  it('computes the modulo-11 check digit for known public vectors', () => {
    expect(rfcCheckDigit('XEXX01010100')).toBe('0')
    expect(rfcCheckDigit('EME910115G7')).toBe('8')
    expect(rfcCheckDigit('GODE561231GR')).toBe('8')
  })

  it('accepts persona moral (12) and persona física (13)', () => {
    expect(validateRFC('EME910115G78')).toBe(true)
    expect(validateRFC('XEXX010101000')).toBe(true)
    expect(validateRFC('GODE561231GR8')).toBe(true)
  })

  it('rejects wrong check digits and malformed input', () => {
    expect(validateRFC('EME910115G79')).toBe(false)
    expect(validateRFC('XEXX010101001')).toBe(false)
    expect(validateRFC('SHORT')).toBe(false)
    expect(validateRFC('')).toBe(false)
  })

  it('formats by stripping separators and uppercasing', () => {
    expect(formatRFC('xexx010101000')).toBe('XEXX010101000')
    expect(formatRFC('eme-910115-g78')).toBe('EME910115G78')
    expect(formatRFC('too-short')).toBe('too-short')
  })
})
