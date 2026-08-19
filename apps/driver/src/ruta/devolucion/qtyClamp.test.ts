import { describe, expect, it } from 'vitest'
import { clampReturnQty } from './qtyClamp'

describe('clampReturnQty', () => {
  it('rejects zero, over-max, and non-finite', () => {
    expect(clampReturnQty(0, 2)).toBeNull()
    expect(clampReturnQty(3, 2)).toBeNull()
    expect(clampReturnQty(Number.NaN, 2)).toBeNull()
  })

  it('accepts qty within (0, max]', () => {
    expect(clampReturnQty(1, 2)).toBe(1)
    expect(clampReturnQty(2, 2)).toBe(2)
  })
})
