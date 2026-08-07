import { describe, expect, it } from 'vitest'
import { computeDaysPastDue, creditUsagePercent } from './daysPastDue'

describe('computeDaysPastDue (seller #168)', () => {
  it('matches server formula for mid-period overdue', () => {
    const invoiceDate = new Date(2026, 0, 1)
    const asOf = new Date(2026, 1, 15)
    expect(computeDaysPastDue(invoiceDate, 30, asOf)).toBe(15)
  })

  it('returns 0 when still within credit days', () => {
    const invoiceDate = new Date(2026, 0, 1)
    const asOf = new Date(2026, 0, 20)
    expect(computeDaysPastDue(invoiceDate, 30, asOf)).toBe(0)
  })
})

describe('creditUsagePercent', () => {
  it('returns null without limit', () => {
    expect(creditUsagePercent(100, null)).toBeNull()
  })

  it('caps at 100', () => {
    expect(creditUsagePercent(200, 100)).toBe(100)
  })
})
