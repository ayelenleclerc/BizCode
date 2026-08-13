import { describe, expect, it } from 'vitest'
import {
  appendNumpadDigit,
  backspaceNumpad,
  decimalSeparatorForLocale,
  formatInitialBuffer,
  parseNumpadBuffer,
  roundQtyToMultiplo,
  validateDscto,
} from './numpadParse'

describe('numpadParse (#264)', () => {
  it('picks decimal separator from seller i18n locale', () => {
    expect(decimalSeparatorForLocale('en')).toBe('.')
    expect(decimalSeparatorForLocale('en-US')).toBe('.')
    expect(decimalSeparatorForLocale('es')).toBe(',')
    expect(decimalSeparatorForLocale('es-AR')).toBe(',')
    expect(decimalSeparatorForLocale('pt-BR')).toBe(',')
  })

  it('parses comma and dot buffers', () => {
    expect(parseNumpadBuffer('1,5', ',')).toBe(1.5)
    expect(parseNumpadBuffer('1.5', '.')).toBe(1.5)
    expect(parseNumpadBuffer('10', ',')).toBe(10)
    expect(parseNumpadBuffer('', ',')).toBeNull()
    expect(parseNumpadBuffer(',', ',')).toBeNull()
    expect(parseNumpadBuffer('1,2,3', ',')).toBeNull()
  })

  it('edits buffer digits and separator', () => {
    expect(appendNumpadDigit('', '1', ',')).toBe('1')
    expect(appendNumpadDigit('0', '5', ',')).toBe('5')
    expect(appendNumpadDigit('12', ',', ',')).toBe('12,')
    expect(appendNumpadDigit('12,5', ',', ',')).toBe('12,5')
    expect(appendNumpadDigit('', ',', ',')).toBe('0,')
    expect(backspaceNumpad('12,5')).toBe('12,')
    expect(formatInitialBuffer(1.5, ',')).toBe('1,5')
    expect(formatInitialBuffer(2, '.')).toBe('2')
  })

  it('validates dscto 0–100', () => {
    expect(validateDscto(0)).toEqual({ ok: true, value: 0 })
    expect(validateDscto(100)).toEqual({ ok: true, value: 100 })
    expect(validateDscto(10.5)).toEqual({ ok: true, value: 10.5 })
    expect(validateDscto(-1)).toEqual({ ok: false, reason: 'out_of_range' })
    expect(validateDscto(101)).toEqual({ ok: false, reason: 'out_of_range' })
    expect(validateDscto(Number.NaN)).toEqual({ ok: false, reason: 'out_of_range' })
  })

  it('rounds qty to multiploVenta', () => {
    expect(roundQtyToMultiplo(10, 6)).toBe(12)
    expect(roundQtyToMultiplo(1.5, 0.5)).toBe(1.5)
    expect(roundQtyToMultiplo(1.4, null)).toBe(1.4)
    expect(roundQtyToMultiplo(0, 6)).toBe(0)
  })
})
