import { describe, expect, it } from 'vitest'
import { allocateFefoFromLots } from '../../../apps/server/services/LoteService'

describe('allocateFefoFromLots (#202)', () => {
  const lots = [
    {
      id: 2,
      nroLote: 'B',
      fechaVencimiento: new Date('2026-08-01'),
      stockActual: 3,
    },
    {
      id: 1,
      nroLote: 'A',
      fechaVencimiento: new Date('2026-07-01'),
      stockActual: 5,
    },
  ]

  it('picks earliest expiry first when lots are pre-sorted', () => {
    const sorted = [...lots].sort(
      (a, b) =>
        a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime() || a.id - b.id,
    )
    const result = allocateFefoFromLots(sorted, 4)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toEqual([
      {
        loteId: 1,
        nroLote: 'A',
        fechaVencimiento: '2026-07-01',
        cantidad: 4,
      },
    ])
  })

  it('splits across multiple lots', () => {
    const sorted = [...lots].sort(
      (a, b) =>
        a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime() || a.id - b.id,
    )
    const result = allocateFefoFromLots(sorted, 7)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toEqual([
      {
        loteId: 1,
        nroLote: 'A',
        fechaVencimiento: '2026-07-01',
        cantidad: 5,
      },
      {
        loteId: 2,
        nroLote: 'B',
        fechaVencimiento: '2026-08-01',
        cantidad: 2,
      },
    ])
  })

  it('returns INSUFFICIENT_LOT_STOCK when not enough', () => {
    const result = allocateFefoFromLots(lots, 100)
    expect(result).toEqual({ ok: false, status: 422, error: 'INSUFFICIENT_LOT_STOCK' })
  })
})
