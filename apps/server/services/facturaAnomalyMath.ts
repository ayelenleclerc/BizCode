/**
 * @en Pure statistical / heuristic invoice anomaly rules for #200 Fase 1 (no ML).
 * @es Reglas estadísticas / heurísticas puras de anomalías de factura (#200 Fase 1, sin ML).
 * @pt-BR Regras estatísticas / heurísticas puras de anomalias de fatura (#200 Fase 1, sem ML).
 */

export const ANOMALY_MIN_HISTORY = 20
export const ANOMALY_ZSCORE_THRESHOLD = 3
/** @en Weighted average line discount % above this → excessive_discount. */
export const ANOMALY_DISCOUNT_THRESHOLD_PCT = 30
/** @en New customer large purchase: total > this fraction of creditLimit. */
export const ANOMALY_NEW_CUSTOMER_CREDIT_FRACTION = 0.5

export type FacturaAnomalyTipo =
  | 'factura_duplicada'
  | 'monto_inusual'
  | 'descuento_excesivo'
  | 'cliente_nuevo_compra_grande'

export type FacturaAnomalySeveridad = 'warning' | 'critical'

export type FacturaAnomalyWarning = {
  tipo: FacturaAnomalyTipo
  severidad: FacturaAnomalySeveridad
  descripcion: string
  detalle?: Record<string, number | string | boolean | null>
}

export type FacturaAnomalyThresholds = {
  minHistory: number
  zScoreThreshold: number
  discountThresholdPct: number
  newCustomerCreditFraction: number
}

export const DEFAULT_FACTURA_ANOMALY_THRESHOLDS: FacturaAnomalyThresholds = {
  minHistory: ANOMALY_MIN_HISTORY,
  zScoreThreshold: ANOMALY_ZSCORE_THRESHOLD,
  discountThresholdPct: ANOMALY_DISCOUNT_THRESHOLD_PCT,
  newCustomerCreditFraction: ANOMALY_NEW_CUSTOMER_CREDIT_FRACTION,
}

export type LineDiscountInput = {
  cantidad: number
  precio: number
  dscto: number
}

/**
 * @en Merge partial thresholds over MVP defaults.
 * @es Fusiona umbrales parciales sobre defaults MVP.
 * @pt-BR Mescla limiares parciais sobre defaults MVP.
 */
export function resolveFacturaAnomalyThresholds(
  partial?: Partial<FacturaAnomalyThresholds> | null,
): FacturaAnomalyThresholds {
  return {
    minHistory: partial?.minHistory ?? DEFAULT_FACTURA_ANOMALY_THRESHOLDS.minHistory,
    zScoreThreshold: partial?.zScoreThreshold ?? DEFAULT_FACTURA_ANOMALY_THRESHOLDS.zScoreThreshold,
    discountThresholdPct:
      partial?.discountThresholdPct ?? DEFAULT_FACTURA_ANOMALY_THRESHOLDS.discountThresholdPct,
    newCustomerCreditFraction:
      partial?.newCustomerCreditFraction ??
      DEFAULT_FACTURA_ANOMALY_THRESHOLDS.newCustomerCreditFraction,
  }
}

/**
 * @en Population stddev (divide by n); returns 0 when n &lt; 2 or variance is 0.
 * @es Desvío estándar poblacional (divide por n); 0 si n &lt; 2 o varianza 0.
 * @pt-BR Desvio padrão populacional (divide por n); 0 se n &lt; 2 ou variância 0.
 */
export function populationStdDev(values: number[]): { mean: number; stddev: number; n: number } {
  const n = values.length
  if (n === 0) return { mean: 0, stddev: 0, n: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / n
  if (n < 2) return { mean, stddev: 0, n }
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n
  return { mean, stddev: Math.sqrt(variance), n }
}

/**
 * @en Z-score of value vs mean/stddev; null when stddev is 0.
 * @es Z-score del valor vs media/desvío; null si desvío es 0.
 * @pt-BR Z-score do valor vs média/desvio; null se desvio é 0.
 */
export function zScore(value: number, mean: number, stddev: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(mean) || !Number.isFinite(stddev) || stddev <= 0) {
    return null
  }
  return (value - mean) / stddev
}

/**
 * @en Weighted average discount % from invoice lines (dscto is percent per line).
 * @es Promedio ponderado de descuento % de líneas (dscto es porcentaje por línea).
 * @pt-BR Média ponderada de desconto % das linhas (dscto é percentual por linha).
 */
export function weightedAverageDiscountPct(lines: LineDiscountInput[]): number {
  let weightSum = 0
  let discountSum = 0
  for (const line of lines) {
    const base = Math.max(0, line.cantidad) * Math.max(0, line.precio)
    if (base <= 0) continue
    const pct = Math.max(0, Math.min(100, line.dscto))
    weightSum += base
    discountSum += base * pct
  }
  if (weightSum <= 0) return 0
  return discountSum / weightSum
}

/**
 * @en Soft/critical anomaly checks from aggregates (caller loads DB stats).
 * @es Chequeos soft/critical a partir de agregados (el caller carga stats de DB).
 * @pt-BR Checagens soft/critical a partir de agregados (o caller carrega stats do DB).
 */
export function evaluateFacturaAnomalies(input: {
  total: number
  priorInvoiceCount: number
  priorTotals: number[]
  hasDuplicateSameDay: boolean
  creditLimit: number | null
  lines: LineDiscountInput[]
  thresholds?: Partial<FacturaAnomalyThresholds> | null
}): FacturaAnomalyWarning[] {
  const t = resolveFacturaAnomalyThresholds(input.thresholds)
  const warnings: FacturaAnomalyWarning[] = []

  if (input.hasDuplicateSameDay) {
    warnings.push({
      tipo: 'factura_duplicada',
      severidad: 'critical',
      descripcion: 'Possible duplicate invoice: same customer, total and calendar date',
      detalle: { total: input.total },
    })
  }

  if (input.priorInvoiceCount > t.minHistory && input.priorTotals.length > t.minHistory) {
    const { mean, stddev } = populationStdDev(input.priorTotals)
    const z = zScore(input.total, mean, stddev)
    if (z != null && Math.abs(z) > t.zScoreThreshold) {
      warnings.push({
        tipo: 'monto_inusual',
        severidad: 'warning',
        descripcion: `Invoice total is unusual versus customer history (Z-score > ${t.zScoreThreshold})`,
        detalle: {
          total: input.total,
          mean: Math.round(mean * 100) / 100,
          stddev: Math.round(stddev * 100) / 100,
          zScore: Math.round(z * 100) / 100,
          historyCount: input.priorInvoiceCount,
          zScoreThreshold: t.zScoreThreshold,
        },
      })
    }
  }

  const avgDiscount = weightedAverageDiscountPct(input.lines)
  if (avgDiscount > t.discountThresholdPct) {
    warnings.push({
      tipo: 'descuento_excesivo',
      severidad: 'warning',
      descripcion: `Weighted average line discount ${avgDiscount.toFixed(1)}% exceeds ${t.discountThresholdPct}%`,
      detalle: {
        averageDiscountPct: Math.round(avgDiscount * 100) / 100,
        thresholdPct: t.discountThresholdPct,
      },
    })
  }

  if (
    input.priorInvoiceCount <= 1 &&
    input.creditLimit != null &&
    input.creditLimit > 0 &&
    input.total > input.creditLimit * t.newCustomerCreditFraction
  ) {
    warnings.push({
      tipo: 'cliente_nuevo_compra_grande',
      severidad: 'warning',
      descripcion: 'Large purchase for a new / low-history customer relative to credit limit',
      detalle: {
        total: input.total,
        creditLimit: input.creditLimit,
        priorInvoiceCount: input.priorInvoiceCount,
        fraction: t.newCustomerCreditFraction,
      },
    })
  }

  return warnings
}
