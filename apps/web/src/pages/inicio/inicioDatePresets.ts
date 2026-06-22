export type InicioAnalyticsPreset = 'days30' | 'days90' | 'days365'

function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @en Resolves analytics preset range as ISO YYYY-MM-DD (local calendar).
 * @es Resuelve rango del preset de analítica como ISO YYYY-MM-DD (calendario local).
 * @pt-BR Resolve intervalo do preset de análise como ISO YYYY-MM-DD (calendário local).
 */
export function resolveInicioAnalyticsPreset(
  preset: InicioAnalyticsPreset,
  now = new Date(),
): { from: string; to: string } {
  const to = formatYmd(now)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const days = preset === 'days30' ? 29 : preset === 'days90' ? 89 : 364
  start.setDate(start.getDate() - days)
  return { from: formatYmd(start), to }
}
