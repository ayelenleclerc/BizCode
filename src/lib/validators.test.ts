import { describe, it, expect } from 'vitest'
import {
  validateCUIT,
  formatCUIT,
  calculateIVA,
  validateCode,
  validatePrice,
} from './validators'

// CUIT válido calculado con el algoritmo oficial:
// Prefix [2,0,1,2,3,4,5,6,7,8]: sum=148, rem=5, check=6 → "20123456786"
const VALID_CUIT = '20123456786'
const VALID_CUIT_WITH_DASHES = '20-12345678-6'

describe('validateCUIT', () => {
  it('retorna false para string vacío', () => {
    expect(validateCUIT('')).toBe(false)
  })

  it('retorna false para CUIT demasiado corto', () => {
    expect(validateCUIT('1234567890')).toBe(false) // 10 dígitos
  })

  it('retorna false para CUIT con caracteres no numéricos (excepto guiones)', () => {
    expect(validateCUIT('20-ABCDE678-6')).toBe(false)
  })

  it('retorna false para CUIT con dígito verificador incorrecto', () => {
    expect(validateCUIT('20123456787')).toBe(false) // último dígito debería ser 6
  })

  it('retorna true para CUIT válido sin guiones', () => {
    expect(validateCUIT(VALID_CUIT)).toBe(true)
  })

  it('retorna true para CUIT válido con guiones', () => {
    expect(validateCUIT(VALID_CUIT_WITH_DASHES)).toBe(true)
  })

  it('retorna true cuando remainder=0 y el último dígito es 0 (rama check=0)', () => {
    // Prefijo [1,1,0,0,0,0,0,0,0,1]: sum=1*5+1*4+0+0+0+0+0+0+0+1*2=11 → rem=0 → check=0
    // CUIT: "11000000010"
    expect(validateCUIT('11000000010')).toBe(true)
  })

  it('retorna false cuando remainder=0 pero el último dígito no es 0', () => {
    // Mismo prefijo pero último dígito incorrecto
    expect(validateCUIT('11000000011')).toBe(false)
  })
})

describe('formatCUIT', () => {
  it('retorna el input sin cambios si no tiene 11 dígitos', () => {
    expect(formatCUIT('1234567890')).toBe('1234567890')
  })

  it('formatea correctamente un CUIT de 11 dígitos', () => {
    expect(formatCUIT('20123456786')).toBe('20-12345678-6')
  })

  it('elimina guiones antes de reformatear', () => {
    expect(formatCUIT('20-12345678-6')).toBe('20-12345678-6')
  })
})

describe('calculateIVA', () => {
  it('calcula IVA al 21%', () => {
    expect(calculateIVA(100, '21')).toBe(21)
  })

  it('calcula IVA al 10.5%', () => {
    expect(calculateIVA(100, '10.5')).toBe(10.5)
  })

  it('calcula IVA al 0%', () => {
    expect(calculateIVA(100, '0')).toBe(0)
  })

  it('devuelve el resultado con 2 decimales', () => {
    // 50.5 * 21 / 100 = 10.605 → 10.61
    expect(calculateIVA(50.5, '21')).toBe(10.61)
  })
})

describe('validateCode', () => {
  it('retorna true para código positivo como string', () => {
    expect(validateCode('100')).toBe(true)
  })

  it('retorna true para código positivo como number', () => {
    expect(validateCode(500)).toBe(true)
  })

  it('retorna false para cero', () => {
    expect(validateCode('0')).toBe(false)
  })

  it('retorna false para negativo', () => {
    expect(validateCode(-1)).toBe(false)
  })

  it('retorna false para código mayor a 999999', () => {
    expect(validateCode(1000000)).toBe(false)
  })

  it('retorna false para string no numérico (parseInt devuelve NaN)', () => {
    expect(validateCode('abc')).toBe(false)
  })
})

describe('validatePrice', () => {
  it('retorna true para entero positivo', () => {
    expect(validatePrice(100)).toBe(true)
  })

  it('retorna true para decimal con 2 decimales', () => {
    expect(validatePrice(100.5)).toBe(true)
  })

  it('retorna true para decimal con 1 decimal', () => {
    expect(validatePrice(99.9)).toBe(true)
  })

  it('retorna false para precio negativo', () => {
    expect(validatePrice(-1)).toBe(false)
  })

  it('retorna false para NaN (string no numérico)', () => {
    expect(validatePrice('abc')).toBe(false)
  })

  it('retorna false para más de 2 decimales', () => {
    expect(validatePrice(1.555)).toBe(false)
  })

  it('retorna true para cero', () => {
    expect(validatePrice(0)).toBe(true)
  })

  it('maneja string numérico válido', () => {
    expect(validatePrice('99.50')).toBe(true)
  })
})

