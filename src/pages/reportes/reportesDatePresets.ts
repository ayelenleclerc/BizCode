export type ReportesPreset = 'today' | 'week' | 'month' | 'quarter'

function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @en Resolves preset date range as ISO YYYY-MM-DD (local calendar).
 * @es Resuelve rango de fechas del preset como ISO YYYY-MM-DD (calendario local).
 * @pt-BR Resolve intervalo do preset como ISO YYYY-MM-DD (calendário local).
 */
export function resolvePresetRange(preset: ReportesPreset, now = new Date()): { from: string; to: string } {
  const to = formatYmd(now)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  if (preset === 'today') {
    return { from: to, to }
  }

  if (preset === 'week') {
    const day = start.getDay()
    const diff = day === 0 ? -6 : 1 - day
    start.setDate(start.getDate() + diff)
    return { from: formatYmd(start), to }
  }

  if (preset === 'month') {
    start.setDate(1)
    return { from: formatYmd(start), to }
  }

  const month = start.getMonth()
  const quarterStartMonth = month - (month % 3)
  start.setMonth(quarterStartMonth, 1)
  return { from: formatYmd(start), to }
}
