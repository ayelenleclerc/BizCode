import { describe, expect, it } from 'vitest'
import { normalizeUnit, parseSpokenOrder } from './parseSpokenOrder'

describe('parseSpokenOrder (#266)', () => {
  it('parses Spanish quantities, units and clauses', () => {
    const lines = parseSpokenOrder(
      'Tres cajas de aceite de oliva 500ml, cinco kilos de harina 000',
      'es',
    )
    expect(lines).toEqual([
      { phrase: 'aceite oliva 500ml', qty: 3, unitHint: 'caja' },
      { phrase: 'harina 000', qty: 5, unitHint: 'kg' },
    ])
  })

  it('parses media docena and un kilo y medio', () => {
    expect(parseSpokenOrder('media docena de huevos', 'es')).toEqual([
      { phrase: 'huevos', qty: 6, unitHint: null },
    ])
    expect(parseSpokenOrder('un kilo y medio de azucar', 'es')).toEqual([
      { phrase: 'azucar', qty: 1.5, unitHint: 'kg' },
    ])
  })

  it('parses English and Portuguese number words', () => {
    expect(parseSpokenOrder('three boxes of olive oil', 'en')[0]).toMatchObject({
      phrase: 'olive oil',
      qty: 3,
      unitHint: 'caja',
    })
    expect(parseSpokenOrder('cinco quilos de farinha', 'pt-BR')[0]).toMatchObject({
      phrase: 'farinha',
      qty: 5,
      unitHint: 'kg',
    })
  })

  it('returns empty when nothing is understood', () => {
    expect(parseSpokenOrder('', 'es')).toEqual([])
    expect(parseSpokenOrder('mmm', 'es')).toEqual([])
    expect(parseSpokenOrder('tres', 'es')).toEqual([])
  })
})

describe('normalizeUnit (#266)', () => {
  it('maps spoken aliases to unidadBase', () => {
    expect(normalizeUnit('cajas')).toBe('caja')
    expect(normalizeUnit('cajón')).toBe('caja')
    expect(normalizeUnit('kilograms')).toBe('kg')
    expect(normalizeUnit('litros')).toBe('litro')
    expect(normalizeUnit('unknown')).toBeNull()
  })
})
