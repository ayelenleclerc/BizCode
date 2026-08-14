import { describe, expect, it } from 'vitest'
import { rankArticuloMatches } from './rankArticuloMatches'
import { applySpokenUnitConversion } from './applySpokenUnitConversion'

describe('rankArticuloMatches (#266)', () => {
  const catalog = [
    { id: 1, descripcion: 'Aceite de oliva 500ml', codigo: 101, esPadre: false },
    { id: 2, descripcion: 'Aceite de oliva 1L', codigo: 102, esPadre: false },
    { id: 3, descripcion: 'Harina 000', codigo: 200, esPadre: false },
    { id: 4, descripcion: 'Padre aceite', codigo: 1, esPadre: true },
  ]

  it('returns top 3 sellable matches and skips parents', () => {
    const ranked = rankArticuloMatches('aceite oliva', catalog)
    expect(ranked.map((r) => r.item.id)).toEqual([2, 1])
    expect(ranked.every((r) => r.item.esPadre !== true)).toBe(true)
  })

  it('returns empty when no overlap', () => {
    expect(rankArticuloMatches('xyzzy', catalog)).toEqual([])
  })
})

describe('applySpokenUnitConversion (#266)', () => {
  it('multiplies caja qty by factorConversion when SKU is not caja', () => {
    expect(
      applySpokenUnitConversion(3, 'caja', { unidadBase: 'unidad', factorConversion: 12 }),
    ).toBe(36)
  })

  it('leaves qty unchanged without caja hint or factor', () => {
    expect(applySpokenUnitConversion(5, 'kg', { unidadBase: 'kg', factorConversion: 1 })).toBe(5)
    expect(applySpokenUnitConversion(2, 'caja', { unidadBase: 'caja', factorConversion: 10 })).toBe(2)
    expect(applySpokenUnitConversion(2, 'caja', { unidadBase: 'unidad', factorConversion: 0 })).toBe(2)
  })
})
