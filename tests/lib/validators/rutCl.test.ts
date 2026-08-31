import { describe, expect, it } from 'vitest'
import {
  formatRUTCL,
  rutClCheckDigit,
  validateRUTCL,
} from '../../../apps/web/src/lib/validators/rutCl'

/**
 * @en Vectors are derived from the documented modulo 11 rule, not from SII sample data (#208).
 * @es Los vectores derivan de la regla publica de modulo 11, no de datos de muestra del SII (#208).
 * @pt-BR Os vetores derivam da regra publica de modulo 11, nao de dados de amostra do SII (#208).
 */
describe('rutClCheckDigit', () => {
  it('computes the check digit for a body of 8 digits', () => {
    expect(rutClCheckDigit('12345678')).toBe('5')
  })

  it('computes the check digit for a body of 7 digits', () => {
    expect(rutClCheckDigit('1234567')).toBe('4')
  })

  it('rejects a body outside 7-8 digits', () => {
    expect(rutClCheckDigit('123456')).toBeNull()
    expect(rutClCheckDigit('123456789')).toBeNull()
    expect(rutClCheckDigit('')).toBeNull()
    expect(rutClCheckDigit('1234567a')).toBeNull()
  })

  it('is consistent with its own validation for every body in a sample range', () => {
    for (let body = 10000000; body < 10000200; body++) {
      const digits = String(body)
      const checkDigit = rutClCheckDigit(digits)
      expect(checkDigit).not.toBeNull()
      expect(validateRUTCL(`${digits}${checkDigit}`)).toBe(true)
    }
  })

  it('produces K for the remainder 10 case', () => {
    const withK = Array.from({ length: 500 }, (_, i) => String(10000000 + i)).find(
      (body) => rutClCheckDigit(body) === 'K',
    )
    expect(withK).toBeDefined()
    expect(validateRUTCL(`${withK}K`)).toBe(true)
  })
})

describe('validateRUTCL', () => {
  it('accepts a valid RUT with and without separators', () => {
    expect(validateRUTCL('123456785')).toBe(true)
    expect(validateRUTCL('12.345.678-5')).toBe(true)
    expect(validateRUTCL('12345678-5')).toBe(true)
  })

  it('accepts a lowercase k as check digit', () => {
    const body = Array.from({ length: 500 }, (_, i) => String(10000000 + i)).find(
      (candidate) => rutClCheckDigit(candidate) === 'K',
    )
    expect(validateRUTCL(`${body}k`)).toBe(true)
  })

  it('rejects a wrong check digit', () => {
    expect(validateRUTCL('123456784')).toBe(false)
  })

  it('rejects malformed input', () => {
    expect(validateRUTCL('')).toBe(false)
    expect(validateRUTCL('abc')).toBe(false)
    expect(validateRUTCL('1234565')).toBe(false)
    expect(validateRUTCL('1234567890')).toBe(false)
  })

  it('does not accept a Uruguayan RUT, which has 12 digits', () => {
    expect(validateRUTCL('210001730016')).toBe(false)
  })
})

describe('formatRUTCL', () => {
  it('groups thousands and separates the check digit', () => {
    expect(formatRUTCL('123456785')).toBe('12.345.678-5')
    expect(formatRUTCL('12345674')).toBe('1.234.567-4')
  })

  it('normalizes an already formatted value', () => {
    expect(formatRUTCL('12.345.678-5')).toBe('12.345.678-5')
  })

  it('returns malformed input untouched', () => {
    expect(formatRUTCL('abc')).toBe('abc')
    expect(formatRUTCL('')).toBe('')
  })
})
