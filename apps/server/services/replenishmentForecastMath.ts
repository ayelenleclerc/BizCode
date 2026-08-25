/**
 * @en Pure moving-average replenishment math for demand forecast (#198 Fase 1).
 * @es Matemática pura de reposición (media móvil) para predicción de demanda (#198 Fase 1).
 * @pt-BR Matemática pura de reposição (média móvel) para previsão de demanda (#198 Fase 1).
 */

export const REPLENISHMENT_MIN_UNITS_90D = 30
export const REPLENISHMENT_WINDOWS_DAYS = [90, 60, 30] as const
export type ReplenishmentWindowDays = (typeof REPLENISHMENT_WINDOWS_DAYS)[number]

export type ReplenishmentForecastStatus = 'ok' | 'insufficient_data'

export type ReplenishmentForecastInput = {
  /** Units sold in the chosen window (FacturaItem sum). */
  unitsSoldInWindow: number
  windowDays: ReplenishmentWindowDays
  /** Current on-hand stock (`Articulo.stock`). */
  stock: number
  /** Safety stock (`Articulo.minimo`). */
  minimo: number
  /** Supplier habitual lead time in days; null/undefined → 0. */
  leadTimeDays: number | null | undefined
  /** Horizon for "needs replenishment" list (default 30). */
  horizonDays?: number
}

export type ReplenishmentForecastResult = {
  status: ReplenishmentForecastStatus
  windowDays: ReplenishmentWindowDays
  unitsSoldInWindow: number
  velocityPerDay: number | null
  daysRemaining: number | null
  suggestedOrderQty: number | null
  needsReplenishment: boolean
}

/**
 * @en Pick sales window: prefer 90d, else 60d, else 30d (caller still applies min-units gate).
 * @es Elige ventana de ventas: prioriza 90d, luego 60d, luego 30d (el umbral mínimo lo aplica el caller).
 * @pt-BR Escolhe janela de vendas: prioriza 90d, depois 60d, depois 30d (o limiar mínimo é do caller).
 */
export function selectReplenishmentWindow(
  unitsByWindow: Record<ReplenishmentWindowDays, number>,
): { windowDays: ReplenishmentWindowDays; unitsSoldInWindow: number } {
  for (const d of REPLENISHMENT_WINDOWS_DAYS) {
    const u = unitsByWindow[d] ?? 0
    if (u > 0) {
      return { windowDays: d, unitsSoldInWindow: u }
    }
  }
  return { windowDays: 90, unitsSoldInWindow: 0 }
}

/**
 * @en Compute forecast from aggregated sales units (no ML). Requires ≥30 units in window.
 * @es Calcula forecast a partir de unidades agregadas (sin ML). Requiere ≥30 unidades en la ventana.
 * @pt-BR Calcula forecast a partir de unidades agregadas (sem ML). Exige ≥30 unidades na janela.
 */
export function computeReplenishmentForecast(input: ReplenishmentForecastInput): ReplenishmentForecastResult {
  const horizonDays = input.horizonDays ?? 30
  const lead = Math.max(0, Math.floor(input.leadTimeDays ?? 0))
  const stock = Math.max(0, input.stock)
  const minimo = Math.max(0, input.minimo)

  if (input.unitsSoldInWindow < REPLENISHMENT_MIN_UNITS_90D || input.windowDays <= 0) {
    return {
      status: 'insufficient_data',
      windowDays: input.windowDays,
      unitsSoldInWindow: input.unitsSoldInWindow,
      velocityPerDay: null,
      daysRemaining: null,
      suggestedOrderQty: null,
      needsReplenishment: stock <= minimo,
    }
  }

  const velocityPerDay = input.unitsSoldInWindow / input.windowDays
  const daysRemaining = velocityPerDay > 0 ? Math.floor(stock / velocityPerDay) : null
  const suggestedOrderQty = Math.max(0, Math.ceil(velocityPerDay * lead + minimo))
  const needsReplenishment =
    stock <= minimo || (daysRemaining != null && daysRemaining <= horizonDays)

  return {
    status: 'ok',
    windowDays: input.windowDays,
    unitsSoldInWindow: input.unitsSoldInWindow,
    velocityPerDay,
    daysRemaining,
    suggestedOrderQty,
    needsReplenishment,
  }
}

/**
 * @en MAPE on holdout: mean |actual-pred|/actual for positive actuals. Returns null if empty.
 * @es MAPE en holdout; null si no hay puntos válidos.
 * @pt-BR MAPE no holdout; null se não houver pontos válidos.
 */
export function meanAbsolutePercentageError(
  actuals: number[],
  predictions: number[],
): number | null {
  if (actuals.length === 0 || actuals.length !== predictions.length) {
    return null
  }
  let sum = 0
  let n = 0
  for (let i = 0; i < actuals.length; i++) {
    const a = actuals[i]
    if (!(a > 0)) continue
    sum += Math.abs(a - predictions[i]) / a
    n += 1
  }
  if (n === 0) return null
  return sum / n
}

/**
 * @en Predict next-period units as velocity × periodDays from a trailing window sum.
 * @es Predice unidades del siguiente período como velocidad × días.
 * @pt-BR Prevê unidades do próximo período como velocidade × dias.
 */
export function predictUnitsFromTrailingAverage(
  trailingUnits: number,
  trailingDays: number,
  periodDays: number,
): number {
  if (trailingDays <= 0) return 0
  return (trailingUnits / trailingDays) * periodDays
}
