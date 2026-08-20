import { describe, expect, it } from 'vitest'
import { localYmd } from './localYmd'
import { collectPendingItemIds, isCacheStale, isSyncConflictError, mapProgressFromItems } from './types'

describe('driver offline helpers (#164)', () => {
  it('detects stale cache day', () => {
    expect(isCacheStale(null, '2026-08-19')).toBe(true)
    expect(isCacheStale('', '2026-08-19')).toBe(true)
    expect(isCacheStale('2026-08-18', '2026-08-19')).toBe(true)
    expect(isCacheStale('2026-08-19', '2026-08-19')).toBe(false)
  })

  it('formats localYmd as YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 19)
    expect(localYmd(d)).toBe('2026-08-19')
  })

  it('maps stop progress from item states', () => {
    expect(
      mapProgressFromItems([{ estado: 'delivered' }, { estado: 'pending' }, { estado: 'returned' }]),
    ).toEqual({ total: 3, delivered: 1, pending: 1 })
  })

  it('recognizes sync conflict error codes', () => {
    expect(isSyncConflictError('REPARTO_ITEM_INVALID_STATE')).toBe(true)
    expect(isSyncConflictError('DEVOLUCION_ALREADY_EXISTS')).toBe(true)
    expect(isSyncConflictError('DEVOLUCION_INVALID_QTY')).toBe(false)
  })

  it('keeps outbox item ids in FIFO payload order', () => {
    expect(
      collectPendingItemIds([
        JSON.stringify({ itemId: 10 }),
        JSON.stringify({ body: {} }),
        JSON.stringify({ itemId: 4 }),
        'not-json',
      ]),
    ).toEqual([10, 4])
  })
})
