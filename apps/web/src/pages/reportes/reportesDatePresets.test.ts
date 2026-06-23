import { describe, expect, it } from 'vitest'
import { resolvePresetRange } from './reportesDatePresets'

const fixedNow = new Date(2026, 4, 15, 12, 0, 0, 0)

describe('resolvePresetRange', () => {
  it('returns same day for today', () => {
    expect(resolvePresetRange('today', fixedNow)).toEqual({ from: '2026-05-15', to: '2026-05-15' })
  })

  it('returns Monday through today for week (Friday)', () => {
    expect(resolvePresetRange('week', fixedNow)).toEqual({ from: '2026-05-11', to: '2026-05-15' })
  })

  it('returns first of month for month', () => {
    expect(resolvePresetRange('month', fixedNow)).toEqual({ from: '2026-05-01', to: '2026-05-15' })
  })

  it('returns quarter start for quarter', () => {
    expect(resolvePresetRange('quarter', fixedNow)).toEqual({ from: '2026-04-01', to: '2026-05-15' })
  })

  it('week preset on Sunday uses previous Monday', () => {
    const sunday = new Date(2026, 4, 17, 10, 0, 0, 0)
    expect(resolvePresetRange('week', sunday)).toEqual({ from: '2026-05-11', to: '2026-05-17' })
  })
})
