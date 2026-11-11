/**
 * @en Brazilian CNPJ check digits and validation (#211).
 * @es Dígitos verificadores y validación del CNPJ brasileño (#211).
 * @pt-BR Dígitos verificadores e validação do CNPJ brasileiro (#211).
 */

import { describe, expect, it } from 'vitest'
import {
  cnpjCheckDigits,
  formatCNPJ,
  validateCNPJ,
} from '../../../packages/types/src/fiscal/identifiers/cnpj'

describe('Brazilian CNPJ (#211)', () => {
  it('computes both modulo-11 check digits for known vectors', () => {
    expect(cnpjCheckDigits('112223330001')).toEqual([8, 1])
    expect(cnpjCheckDigits('042520110001')).toEqual([1, 0])
  })

  it('accepts valid CNPJs with or without separators', () => {
    expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
    expect(validateCNPJ('11222333000181')).toBe(true)
    expect(validateCNPJ('04.252.011/0001-10')).toBe(true)
  })

  it('rejects wrong check digits, repeated digits and malformed input', () => {
    expect(validateCNPJ('11.222.333/0001-82')).toBe(false)
    expect(validateCNPJ('00.000.000/0000-00')).toBe(false)
    expect(validateCNPJ('11111111111111')).toBe(false)
    expect(validateCNPJ('123')).toBe(false)
    expect(validateCNPJ('')).toBe(false)
  })

  it('formats as XX.XXX.XXX/XXXX-XX', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    expect(formatCNPJ('too-short')).toBe('too-short')
  })
})
