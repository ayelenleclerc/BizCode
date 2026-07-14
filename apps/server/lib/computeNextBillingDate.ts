/**
 * @en Next recurring billing date from `from`, clamping `diaDelMes` to the target month length (incl. Feb 28/29).
 * @es Próxima fecha de facturación recurrente desde `from`, ajustando `diaDelMes` al largo del mes (feb 28/29).
 * @pt-BR Próxima data de faturamento recorrente a partir de `from`, ajustando `diaDelMes` ao mês (fev 28/29).
 */

export type BillingFrecuencia = 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'

const MONTHS_BY_FRECUENCIA: Record<BillingFrecuencia, number> = {
  mensual: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
}

/**
 * @en UTC calendar date with day clamped to the last day of the month.
 * @es Fecha UTC con día limitado al último día del mes.
 * @pt-BR Data UTC com dia limitado ao último dia do mês.
 */
export function clampUtcDayOfMonth(year: number, monthIndex: number, day: number): Date {
  const safeDay = Math.min(Math.max(1, Math.trunc(day)), 31)
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, monthIndex, Math.min(safeDay, lastDay)))
}

/**
 * @en Adds `months` to a UTC date and clamps to `diaDelMes`.
 * @es Suma `months` a una fecha UTC y aplica `diaDelMes` con clamp.
 * @pt-BR Soma `months` a uma data UTC e aplica `diaDelMes` com clamp.
 */
export function addMonthsClamped(from: Date, months: number, diaDelMes: number): Date {
  const year = from.getUTCFullYear()
  const monthIndex = from.getUTCMonth() + months
  const target = new Date(Date.UTC(year, monthIndex, 1))
  return clampUtcDayOfMonth(target.getUTCFullYear(), target.getUTCMonth(), diaDelMes)
}

/**
 * @en Computes the next bill date after `from` for the given billing frequency.
 * @es Calcula la próxima fecha de facturación después de `from` según la frecuencia.
 * @pt-BR Calcula a próxima data de faturamento após `from` conforme a frequência.
 */
export function computeNextBillingDate(
  diaDelMes: number,
  from: Date,
  frecuencia: BillingFrecuencia,
): Date {
  const months = MONTHS_BY_FRECUENCIA[frecuencia]
  return addMonthsClamped(from, months, diaDelMes)
}

/**
 * @en Initial `proximaFact` from contract start: day-of-month in start month, or next cycle if before start day.
 * @es `proximaFact` inicial desde el alta: día del mes de inicio, o ciclo siguiente si es anterior al inicio.
 * @pt-BR `proximaFact` inicial a partir do início: dia do mês de início, ou ciclo seguinte se anterior.
 */
export function computeInitialBillingDate(
  diaDelMes: number,
  fechaInicio: Date,
  frecuencia: BillingFrecuencia,
): Date {
  const candidate = clampUtcDayOfMonth(
    fechaInicio.getUTCFullYear(),
    fechaInicio.getUTCMonth(),
    diaDelMes,
  )
  const startDay = Date.UTC(
    fechaInicio.getUTCFullYear(),
    fechaInicio.getUTCMonth(),
    fechaInicio.getUTCDate(),
  )
  if (candidate.getTime() >= startDay) {
    return candidate
  }
  return computeNextBillingDate(diaDelMes, candidate, frecuencia)
}
