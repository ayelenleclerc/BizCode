import { describe, expect, it } from 'vitest'
import { filterSellableArticulos, offerPctByArticuloId } from './filterSellable'

describe('filterSellableArticulos (#257)', () => {
  it('drops inactive and parent SKUs', () => {
    expect(
      filterSellableArticulos([
        { id: 1, activo: true, esPadre: false },
        { id: 2, activo: false, esPadre: false },
        { id: 3, activo: true, esPadre: true },
        { id: 4 },
      ]).map((a) => a.id),
    ).toEqual([1, 4])
  })
})

describe('offerPctByArticuloId (#257)', () => {
  it('indexes discount percent by articuloId', () => {
    const map = offerPctByArticuloId([
      { articuloId: 10, descuentoPct: 15 },
      { articuloId: 11, descuentoPct: 5 },
    ])
    expect(map.get(10)).toBe(15)
    expect(map.get(99)).toBeUndefined()
    expect(offerPctByArticuloId(null).size).toBe(0)
  })
})
