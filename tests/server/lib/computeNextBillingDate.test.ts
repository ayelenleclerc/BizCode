import { describe, expect, it } from 'vitest'
import {
  clampUtcDayOfMonth,
  computeInitialBillingDate,
  computeNextBillingDate,
} from '../../../apps/server/lib/computeNextBillingDate'

describe('computeNextBillingDate', () => {
  it('advances monthly and clamps Feb 31 → 28 in non-leap year', () => {
    const from = new Date(Date.UTC(2025, 0, 31))
    const next = computeNextBillingDate(31, from, 'mensual')
    expect(next.toISOString()).toBe('2025-02-28T00:00:00.000Z')
  })

  it('clamps Feb 31 → 29 in leap year', () => {
    const from = new Date(Date.UTC(2024, 0, 31))
    const next = computeNextBillingDate(31, from, 'mensual')
    expect(next.toISOString()).toBe('2024-02-29T00:00:00.000Z')
  })

  it('supports annual frequency across Feb leap day', () => {
    const from = new Date(Date.UTC(2024, 1, 29))
    const next = computeNextBillingDate(29, from, 'anual')
    expect(next.toISOString()).toBe('2025-02-28T00:00:00.000Z')
  })

  it('supports bimestral / trimestral / semestral month steps', () => {
    const from = new Date(Date.UTC(2026, 0, 15))
    expect(computeNextBillingDate(15, from, 'bimestral').toISOString()).toBe(
      '2026-03-15T00:00:00.000Z',
    )
    expect(computeNextBillingDate(15, from, 'trimestral').toISOString()).toBe(
      '2026-04-15T00:00:00.000Z',
    )
    expect(computeNextBillingDate(15, from, 'semestral').toISOString()).toBe(
      '2026-07-15T00:00:00.000Z',
    )
  })

  it('produces 12 monthly dates without skipping months', () => {
    let cursor = new Date(Date.UTC(2026, 0, 10))
    const months: number[] = []
    for (let i = 0; i < 12; i += 1) {
      cursor = computeNextBillingDate(10, cursor, 'mensual')
      months.push(cursor.getUTCMonth())
    }
    expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0])
  })
})

describe('clampUtcDayOfMonth / computeInitialBillingDate', () => {
  it('clamps day to last day of month', () => {
    expect(clampUtcDayOfMonth(2025, 1, 31).toISOString()).toBe('2025-02-28T00:00:00.000Z')
  })

  it('uses start-month day when on or after fechaInicio', () => {
    const start = new Date(Date.UTC(2026, 6, 1))
    expect(computeInitialBillingDate(15, start, 'mensual').toISOString()).toBe(
      '2026-07-15T00:00:00.000Z',
    )
  })

  it('rolls to next cycle when diaDelMes is before fechaInicio day', () => {
    const start = new Date(Date.UTC(2026, 6, 20))
    expect(computeInitialBillingDate(10, start, 'mensual').toISOString()).toBe(
      '2026-08-10T00:00:00.000Z',
    )
  })
})
