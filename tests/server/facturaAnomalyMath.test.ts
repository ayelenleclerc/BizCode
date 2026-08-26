import { describe, expect, it } from 'vitest'
import {
  ANOMALY_DISCOUNT_THRESHOLD_PCT,
  ANOMALY_MIN_HISTORY,
  evaluateFacturaAnomalies,
  populationStdDev,
  weightedAverageDiscountPct,
  zScore,
} from '../../apps/server/services/facturaAnomalyMath'

describe('facturaAnomalyMath (#200)', () => {
  it('populationStdDev and zScore detect outliers', () => {
    const values = Array.from({ length: 25 }, () => 100)
    values.push(1000)
    const { mean, stddev, n } = populationStdDev(values)
    expect(n).toBe(26)
    expect(mean).toBeGreaterThan(100)
    expect(stddev).toBeGreaterThan(0)
    const z = zScore(1000, mean, stddev)
    expect(z).not.toBeNull()
    expect(Math.abs(z!)).toBeGreaterThan(3)
  })

  it('weightedAverageDiscountPct respects line weights', () => {
    const pct = weightedAverageDiscountPct([
      { cantidad: 1, precio: 100, dscto: 10 },
      { cantidad: 1, precio: 900, dscto: 50 },
    ])
    expect(pct).toBeCloseTo(46, 0)
  })

  it('flags factura_duplicada without history', () => {
    const w = evaluateFacturaAnomalies({
      total: 500,
      priorInvoiceCount: 0,
      priorTotals: [],
      hasDuplicateSameDay: true,
      creditLimit: null,
      lines: [{ cantidad: 1, precio: 500, dscto: 0 }],
    })
    expect(w.some((x) => x.tipo === 'factura_duplicada' && x.severidad === 'critical')).toBe(true)
  })

  it('flags monto_inusual only when history > 20', () => {
    const priorTotals = Array.from({ length: ANOMALY_MIN_HISTORY + 1 }, (_, i) => 100 + (i % 7))
    const withHistory = evaluateFacturaAnomalies({
      total: 10000,
      priorInvoiceCount: priorTotals.length,
      priorTotals,
      hasDuplicateSameDay: false,
      creditLimit: null,
      lines: [{ cantidad: 1, precio: 10000, dscto: 0 }],
    })
    expect(withHistory.some((x) => x.tipo === 'monto_inusual')).toBe(true)

    const shortHistory = evaluateFacturaAnomalies({
      total: 10000,
      priorInvoiceCount: 5,
      priorTotals: [100, 100, 100, 100, 100],
      hasDuplicateSameDay: false,
      creditLimit: null,
      lines: [{ cantidad: 1, precio: 10000, dscto: 0 }],
    })
    expect(shortHistory.some((x) => x.tipo === 'monto_inusual')).toBe(false)
  })

  it('flags descuento_excesivo above threshold', () => {
    const w = evaluateFacturaAnomalies({
      total: 100,
      priorInvoiceCount: 0,
      priorTotals: [],
      hasDuplicateSameDay: false,
      creditLimit: null,
      lines: [{ cantidad: 1, precio: 100, dscto: ANOMALY_DISCOUNT_THRESHOLD_PCT + 5 }],
    })
    expect(w.some((x) => x.tipo === 'descuento_excesivo')).toBe(true)
  })

  it('flags cliente_nuevo_compra_grande against credit limit', () => {
    const w = evaluateFacturaAnomalies({
      total: 6000,
      priorInvoiceCount: 0,
      priorTotals: [],
      hasDuplicateSameDay: false,
      creditLimit: 10000,
      lines: [{ cantidad: 1, precio: 6000, dscto: 0 }],
    })
    expect(w.some((x) => x.tipo === 'cliente_nuevo_compra_grande')).toBe(true)
  })

  it('synthetic fixture: normal history has no monto_inusual (FP control)', () => {
    const priorTotals = Array.from({ length: 30 }, (_, i) => 90 + (i % 5))
    const w = evaluateFacturaAnomalies({
      total: 92,
      priorInvoiceCount: 30,
      priorTotals,
      hasDuplicateSameDay: false,
      creditLimit: 100000,
      lines: [{ cantidad: 1, precio: 92, dscto: 0 }],
    })
    expect(w.some((x) => x.tipo === 'monto_inusual')).toBe(false)
  })
})
