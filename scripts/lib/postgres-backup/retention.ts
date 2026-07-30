/**
 * @en Local GFS retention: 7 daily / 4 weekly / 3 monthly.
 * @es Retención GFS local: 7 diarios / 4 semanales / 3 mensuales.
 * @pt-BR Retenção GFS local: 7 diários / 4 semanais / 3 mensais.
 */
import type { ParsedBackupName } from './naming'

export type RetentionPolicy = {
  daily: number
  weekly: number
  monthly: number
}

export const DEFAULT_RETENTION: RetentionPolicy = {
  daily: 7,
  weekly: 4,
  monthly: 3,
}

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** ISO week key YYYY-Www (UTC). */
function utcWeekKey(d: Date): string {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

function utcMonthKey(d: Date): string {
  return d.toISOString().slice(0, 7)
}

function newestPerBucket(
  items: ParsedBackupName[],
  keyFn: (d: Date) => string,
): Map<string, ParsedBackupName> {
  const map = new Map<string, ParsedBackupName>()
  for (const item of items) {
    const key = keyFn(item.takenAt)
    const prev = map.get(key)
    if (!prev || item.takenAt > prev.takenAt) {
      map.set(key, item)
    }
  }
  return map
}

/**
 * @en Returns file names that must be kept under the GFS policy (union of buckets).
 * @es Devuelve nombres a conservar bajo la política GFS (unión de buckets).
 * @pt-BR Retorna nomes a manter sob a política GFS (união dos buckets).
 */
export function selectBackupsToKeep(
  items: ParsedBackupName[],
  policy: RetentionPolicy = DEFAULT_RETENTION,
  now: Date = new Date(),
): Set<string> {
  const sorted = [...items].sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())
  const keep = new Set<string>()

  const byDay = newestPerBucket(sorted, utcDayKey)
  const dayKeys = [...byDay.keys()].sort((a, b) => b.localeCompare(a)).slice(0, policy.daily)
  for (const k of dayKeys) {
    const item = byDay.get(k)
    if (item) keep.add(item.fileName)
  }

  const byWeek = newestPerBucket(sorted, utcWeekKey)
  const weekKeys = [...byWeek.keys()].sort((a, b) => b.localeCompare(a)).slice(0, policy.weekly)
  for (const k of weekKeys) {
    const item = byWeek.get(k)
    if (item) keep.add(item.fileName)
  }

  const byMonth = newestPerBucket(sorted, utcMonthKey)
  const monthKeys = [...byMonth.keys()].sort((a, b) => b.localeCompare(a)).slice(0, policy.monthly)
  for (const k of monthKeys) {
    const item = byMonth.get(k)
    if (item) keep.add(item.fileName)
  }

  // Always keep anything newer than 24h even if buckets overflow (edge: many dumps same day already handled).
  const dayMs = 24 * 60 * 60 * 1000
  for (const item of sorted) {
    if (now.getTime() - item.takenAt.getTime() < dayMs) {
      keep.add(item.fileName)
    }
  }

  return keep
}

/**
 * @en Files to delete = all parsed backups not in the keep set.
 * @es Archivos a borrar = backups parseados fuera del conjunto a conservar.
 * @pt-BR Arquivos a apagar = backups parseados fora do conjunto a manter.
 */
export function selectBackupsToPrune(
  items: ParsedBackupName[],
  policy: RetentionPolicy = DEFAULT_RETENTION,
  now: Date = new Date(),
): ParsedBackupName[] {
  const keep = selectBackupsToKeep(items, policy, now)
  return items.filter((i) => !keep.has(i.fileName))
}
