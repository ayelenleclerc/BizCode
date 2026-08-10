import { describe, expect, it } from 'vitest'
import { isCacheStale, nextLocalId } from './types'
import { localYmd } from './localYmd'

describe('offline types helpers', () => {
  it('allocates decreasing negative local ids', () => {
    expect(nextLocalId(0)).toBe(-1)
    expect(nextLocalId(-1)).toBe(-2)
    expect(nextLocalId(-10)).toBe(-11)
  })

  it('detects stale cache day', () => {
    expect(isCacheStale(null, '2026-08-10')).toBe(true)
    expect(isCacheStale('', '2026-08-10')).toBe(true)
    expect(isCacheStale('2026-08-09', '2026-08-10')).toBe(true)
    expect(isCacheStale('2026-08-10', '2026-08-10')).toBe(false)
  })

  it('formats localYmd as YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 10)
    expect(localYmd(d)).toBe('2026-08-10')
  })
})
