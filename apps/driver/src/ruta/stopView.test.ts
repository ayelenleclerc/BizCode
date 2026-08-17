import { describe, expect, it } from 'vitest'
import { countBultos, digitsOnly, hasDebt, mapsUrl } from './stopView'

describe('stopView (#160)', () => {
  it('sums line quantities', () => {
    expect(
      countBultos({
        ordenEntrega: {
          items: [
            { cantidad: 2 },
            { cantidad: 3 },
          ],
        },
      }),
    ).toBe(5)
  })

  it('keeps phone digits only', () => {
    expect(digitsOnly('+54 (11) 4444-5555')).toBe('541144445555')
  })

  it('builds maps url from coords', () => {
    expect(mapsUrl({ latitud: -34.6, longitud: -58.4 })).toContain('-34.6,-58.4')
  })

  it('treats positive balance as debt', () => {
    expect(hasDebt('10.50')).toBe(true)
    expect(hasDebt('0.00')).toBe(false)
  })
})
