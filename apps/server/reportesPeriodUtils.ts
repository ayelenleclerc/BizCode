import { startOfDay } from './services/ReportesFinancierosService'

export type ReportesAgrupar = 'dia' | 'semana' | 'mes'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * @en Parses YYYY-MM-DD query param to local start-of-day Date.
 * @es Parsea parámetro YYYY-MM-DD a inicio del día local.
 * @pt-BR Analisa parâmetro YYYY-MM-DD para início do dia local.
 */
export function parseIsoDateParam(value: string): Date | null {
  if (!ISO_DATE_RE.test(value)) return null
  const [y, m, d] = value.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(y, m - 1, d, 0, 0, 0, 0)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null
  }
  return date
}

/**
 * @en End of calendar day for inclusive `to` date filters.
 * @es Fin del día calendario para filtros `to` inclusivos.
 * @pt-BR Fim do dia civil para filtros `to` inclusivos.
 */
export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

/**
 * @en Bucket key for sales grouping (server local calendar).
 * @es Clave de bucket para agrupación de ventas (calendario local del servidor).
 * @pt-BR Chave de bucket para agrupamento de vendas (calendário local do servidor).
 */
export function periodKeyForDate(date: Date, agrupar: ReportesAgrupar): string {
  const day = startOfDay(date)
  if (agrupar === 'dia') {
    return formatYmd(day)
  }
  if (agrupar === 'mes') {
    const y = day.getFullYear()
    const m = String(day.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  const monday = startOfWeekMonday(day)
  return formatYmd(monday)
}

function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @en Monday 00:00 of the week containing `date` (local).
 * @es Lunes 00:00 de la semana que contiene `date` (local).
 * @pt-BR Segunda 00:00 da semana que contém `date` (local).
 */
export function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}
