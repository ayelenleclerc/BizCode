import { describe, expect, it } from 'vitest'
import {
  REPLENISHMENT_MIN_UNITS_90D,
  computeReplenishmentForecast,
  meanAbsolutePercentageError,
  predictUnitsFromTrailingAverage,
  selectReplenishmentWindow,
} from '../../apps/server/services/replenishmentForecastMath'

describe('replenishmentForecastMath (#198)', () => {
  it('marks insufficient_data when 90d units below threshold', () => {
    const r = computeReplenishmentForecast({
      unitsSoldInWindow: REPLENISHMENT_MIN_UNITS_90D - 1,
      windowDays: 90,
      stock: 100,
      minimo: 10,
      leadTimeDays: 7,
    })
    expect(r.status).toBe('insufficient_data')
    expect(r.velocityPerDay).toBeNull()
    expect(r.suggestedOrderQty).toBeNull()
  })

  it('computes velocity, days remaining and suggested qty', () => {
    // 90 units / 90 days = 1 u/day; stock 15 → 15 days; lead 10 + minimo 5 → ceil(10+5)=15
    const r = computeReplenishmentForecast({
      unitsSoldInWindow: 90,
      windowDays: 90,
      stock: 15,
      minimo: 5,
      leadTimeDays: 10,
      horizonDays: 30,
    })
    expect(r.status).toBe('ok')
    expect(r.velocityPerDay).toBeCloseTo(1)
    expect(r.daysRemaining).toBe(15)
    expect(r.suggestedOrderQty).toBe(15)
    expect(r.needsReplenishment).toBe(true)
  })

  it('selects 90d window when threshold met', () => {
    const sel = selectReplenishmentWindow({ 90: 40, 60: 30, 30: 20 })
    expect(sel).toEqual({ windowDays: 90, unitsSoldInWindow: 40 })
  })

  it('falls back to shorter window when 90d has zero sales', () => {
    const sel = selectReplenishmentWindow({ 90: 0, 60: 40, 30: 8 })
    expect(sel.windowDays).toBe(60)
    expect(sel.unitsSoldInWindow).toBe(40)
  })

  it('MAPE under 20% on synthetic steady demand holdout', () => {
    // Steady 2 units/day. Trailing 60d = 120 units → pred next 30d = 60. Actual 30d = 60.
    const trailing = 120
    const pred = predictUnitsFromTrailingAverage(trailing, 60, 30)
    const actuals = [60, 58, 62, 59, 61]
    const predictions = actuals.map(() => pred)
    const mape = meanAbsolutePercentageError(actuals, predictions)
    expect(mape).not.toBeNull()
    expect(mape!).toBeLessThan(0.2)
  })
})
