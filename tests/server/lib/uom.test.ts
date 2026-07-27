import { describe, expect, it } from 'vitest'
import {
  AFIP_UNIDAD_CODES,
  UNIDAD_BASE_VALUES,
  afipCodigoForUnidad,
  allowsDecimalQuantity,
  fromBaseQuantity,
  isUnidadBase,
  roundQty,
  toBaseQuantity,
  umedidaFromUnidadBase,
  validateQuantityForUom,
} from '../../../apps/server/lib/uom'

describe('uom (#203)', () => {
  describe('umedidaFromUnidadBase', () => {
    it('derives a legacy code (2-6 chars) for every unidadBase', () => {
      for (const unidadBase of UNIDAD_BASE_VALUES) {
        const umedida = umedidaFromUnidadBase(unidadBase)
        expect(umedida.length).toBeGreaterThanOrEqual(2)
        expect(umedida.length).toBeLessThanOrEqual(6)
      }
    })

    it('maps known units to expected legacy codes', () => {
      expect(umedidaFromUnidadBase('unidad')).toBe('UN')
      expect(umedidaFromUnidadBase('kg')).toBe('KG')
      expect(umedidaFromUnidadBase('litro')).toBe('LT')
      expect(umedidaFromUnidadBase('caja')).toBe('CAJA')
    })
  })

  describe('AFIP_UNIDAD_CODES / afipCodigoForUnidad', () => {
    it('defines a code for every unidadBase', () => {
      for (const unidadBase of UNIDAD_BASE_VALUES) {
        expect(AFIP_UNIDAD_CODES[unidadBase]).toEqual(expect.any(String))
      }
    })

    it('returns the AFIP code via the helper', () => {
      expect(afipCodigoForUnidad('kg')).toBe('01')
      expect(afipCodigoForUnidad('unidad')).toBe('07')
      expect(afipCodigoForUnidad('m3')).toBe('04')
    })
  })

  describe('isUnidadBase', () => {
    it('accepts known values', () => {
      expect(isUnidadBase('kg')).toBe(true)
      expect(isUnidadBase('rollo')).toBe(true)
    })

    it('rejects unknown values', () => {
      expect(isUnidadBase('lote')).toBe(false)
      expect(isUnidadBase('')).toBe(false)
    })
  })

  describe('allowsDecimalQuantity', () => {
    it('returns true for non-unidad base units', () => {
      expect(allowsDecimalQuantity('kg')).toBe(true)
      expect(allowsDecimalQuantity('metro')).toBe(true)
      expect(allowsDecimalQuantity('litro', null)).toBe(true)
    })

    it('returns false for unidad without multiploVenta', () => {
      expect(allowsDecimalQuantity('unidad')).toBe(false)
      expect(allowsDecimalQuantity('unidad', null)).toBe(false)
      expect(allowsDecimalQuantity('unidad', undefined)).toBe(false)
    })

    it('returns false for unidad with an integer multiploVenta', () => {
      expect(allowsDecimalQuantity('unidad', 6)).toBe(false)
    })

    it('returns true for unidad with a fractional multiploVenta', () => {
      expect(allowsDecimalQuantity('unidad', 0.5)).toBe(true)
    })
  })

  describe('validateQuantityForUom', () => {
    it('accepts a valid integer quantity for unidad', () => {
      expect(validateQuantityForUom({ cantidad: 5, unidadBase: 'unidad' })).toEqual({ ok: true })
    })

    it('rejects a non-integer quantity for unidad', () => {
      const result = validateQuantityForUom({ cantidad: 5.5, unidadBase: 'unidad' })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toMatch(/integer/)
    })

    it('accepts a decimal quantity for a fractional unit (corte a medida)', () => {
      expect(validateQuantityForUom({ cantidad: 2.75, unidadBase: 'metro' })).toEqual({ ok: true })
    })

    it('rejects zero, negative or non-finite quantities', () => {
      expect(validateQuantityForUom({ cantidad: 0, unidadBase: 'kg' }).ok).toBe(false)
      expect(validateQuantityForUom({ cantidad: -1, unidadBase: 'kg' }).ok).toBe(false)
      expect(validateQuantityForUom({ cantidad: Number.NaN, unidadBase: 'kg' }).ok).toBe(false)
      expect(validateQuantityForUom({ cantidad: Number.POSITIVE_INFINITY, unidadBase: 'kg' }).ok).toBe(false)
    })

    it('accepts a quantity that is an exact multiple of multiploVenta', () => {
      expect(validateQuantityForUom({ cantidad: 12, unidadBase: 'unidad', multiploVenta: 6 })).toEqual({ ok: true })
    })

    it('rejects a quantity that is not a multiple of multiploVenta', () => {
      const result = validateQuantityForUom({ cantidad: 10, unidadBase: 'unidad', multiploVenta: 6 })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toMatch(/multiple/)
    })

    it('tolerates floating point rounding within 1e-6 for multiploVenta', () => {
      expect(validateQuantityForUom({ cantidad: 0.30000001, unidadBase: 'kg', multiploVenta: 0.1 })).toEqual({
        ok: true,
      })
    })
  })

  describe('toBaseQuantity / fromBaseQuantity', () => {
    it('converts purchase qty to base qty and back', () => {
      expect(toBaseQuantity(2, 12)).toBe(24)
      expect(fromBaseQuantity(24, 12)).toBe(2)
    })

    it('guards against a non-positive factor when converting from base', () => {
      expect(fromBaseQuantity(24, 0)).toBe(0)
      expect(fromBaseQuantity(24, -1)).toBe(0)
    })
  })

  describe('roundQty', () => {
    it('rounds to 4 decimal places', () => {
      expect(roundQty(1.23456789)).toBe(1.2346)
      expect(roundQty(2)).toBe(2)
      expect(roundQty(0.00001)).toBe(0)
    })
  })
})
