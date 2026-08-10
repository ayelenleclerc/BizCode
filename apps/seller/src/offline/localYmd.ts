/**
 * @en Local calendar date as YYYY-MM-DD.
 * @es Fecha de calendario local como YYYY-MM-DD.
 * @pt-BR Data local do calendário como YYYY-MM-DD.
 */
export function localYmd(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
