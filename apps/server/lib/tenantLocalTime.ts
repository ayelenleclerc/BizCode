/**
 * @en Tenant-local time helpers (Intl, no extra deps).
 * @es Utilidades de hora local por tenant (Intl, sin deps extra).
 * @pt-BR Utilitários de horário local por tenant (Intl, sem deps extras).
 */

export const DEFAULT_TENANT_TIMEZONE = 'America/Argentina/Buenos_Aires'

export function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

export function getLocalHour(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const hourPart = parts.find((p) => p.type === 'hour')
  return hourPart ? Number.parseInt(hourPart.value, 10) : 0
}

export function getLocalMinute(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    minute: 'numeric',
  }).formatToParts(date)
  const minutePart = parts.find((p) => p.type === 'minute')
  return minutePart ? Number.parseInt(minutePart.value, 10) : 0
}

/**
 * @en True when local hour is in [startHour, endHourExclusive).
 * @es Verdadero si la hora local está en [startHour, endHourExclusive).
 * @pt-BR Verdadeiro se a hora local está em [startHour, endHourExclusive).
 */
export function isWithinHourRange(
  date: Date,
  timeZone: string,
  startHour: number,
  endHourExclusive: number,
): boolean {
  const hour = getLocalHour(date, timeZone)
  if (startHour < endHourExclusive) {
    return hour >= startHour && hour < endHourExclusive
  }
  return hour >= startHour || hour < endHourExclusive
}
