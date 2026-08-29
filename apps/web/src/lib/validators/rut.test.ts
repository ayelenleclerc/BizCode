import { describe, expect, it } from 'vitest'
import { formatRUT, rutCheckDigit, validateRUT } from './rut'

// RUT válido derivado del algoritmo (pesos 4,3,6,7,8,9,2,3,4,5,6):
// cuerpo "01234567890" → suma 223, resto 3, verificador 8 → "012345678908"
const VALID_RUT = '012345678908'
const VALID_RUT_WITH_DASHES = '01-234567-8908'

describe('rutCheckDigit', () => {
  it('calcula el verificador de un cuerpo de 11 dígitos', () => {
    expect(rutCheckDigit('01234567890')).toBe(8)
  })

  it('devuelve 0 cuando la suma es múltiplo de 11', () => {
    expect(rutCheckDigit('00000000000')).toBe(0)
  })

  it('devuelve null cuando el resto es 1 y el verificador no existe', () => {
    // 2 * 6 = 12 → 12 % 11 = 1
    expect(rutCheckDigit('00200000000')).toBeNull()
  })

  it('devuelve null para cuerpos de longitud incorrecta o no numéricos', () => {
    expect(rutCheckDigit('0123456789')).toBeNull()
    expect(rutCheckDigit('012345678901')).toBeNull()
    expect(rutCheckDigit('0123456789A')).toBeNull()
    expect(rutCheckDigit('')).toBeNull()
  })
})

describe('validateRUT', () => {
  it('retorna false para string vacío', () => {
    expect(validateRUT('')).toBe(false)
  })

  it('acepta un RUT válido', () => {
    expect(validateRUT(VALID_RUT)).toBe(true)
  })

  it('acepta un RUT válido con separadores', () => {
    expect(validateRUT(VALID_RUT_WITH_DASHES)).toBe(true)
    expect(validateRUT('01.234567.8908')).toBe(true)
    expect(validateRUT(' 012345678908 ')).toBe(true)
  })

  it('rechaza un verificador incorrecto', () => {
    expect(validateRUT('012345678907')).toBe(false)
  })

  it('rechaza longitudes distintas de 12 dígitos', () => {
    expect(validateRUT('01234567890')).toBe(false)
    expect(validateRUT('0123456789012')).toBe(false)
  })

  it('rechaza caracteres no numéricos', () => {
    expect(validateRUT('01234A678908')).toBe(false)
  })

  it('rechaza un cuerpo sin verificador posible (resto 1)', () => {
    expect(validateRUT('002000000000')).toBe(false)
    expect(validateRUT('002000000001')).toBe(false)
  })

  it('acepta el caso borde de verificador 0', () => {
    expect(validateRUT('000000000000')).toBe(true)
  })
})

describe('formatRUT', () => {
  it('formatea un RUT de 12 dígitos', () => {
    expect(formatRUT(VALID_RUT)).toBe('01-234567-8908')
  })

  it('normaliza un RUT que ya trae separadores', () => {
    expect(formatRUT(VALID_RUT_WITH_DASHES)).toBe('01-234567-8908')
  })

  it('devuelve la entrada intacta si no tiene 12 dígitos', () => {
    expect(formatRUT('12345')).toBe('12345')
  })
})
