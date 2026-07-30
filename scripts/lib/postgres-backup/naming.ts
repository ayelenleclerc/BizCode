/**
 * @en Backup filename parsing and generation for local retention.
 * @es Generación y parseo de nombres de archivo de backup para retención local.
 * @pt-BR Geração e parse de nomes de arquivo de backup para retenção local.
 */

/** Example: bizcode-pg-bizcode_dev-20260730T020000Z.sql.gz.enc */
export const BACKUP_FILENAME_RE =
  /^bizcode-pg-([a-zA-Z0-9_]+)-(\d{8}T\d{6}Z)\.sql\.gz\.enc$/

export type ParsedBackupName = {
  fileName: string
  dbName: string
  takenAt: Date
}

/**
 * @en Builds a UTC timestamp stamp YYYYMMDDTHHMMSSZ.
 * @es Construye sello UTC YYYYMMDDTHHMMSSZ.
 * @pt-BR Constrói carimbo UTC YYYYMMDDTHHMMSSZ.
 */
export function formatBackupStamp(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0')
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const d = date.getUTCDate().toString().padStart(2, '0')
  const hh = date.getUTCHours().toString().padStart(2, '0')
  const mm = date.getUTCMinutes().toString().padStart(2, '0')
  const ss = date.getUTCSeconds().toString().padStart(2, '0')
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}

/**
 * @en Builds encrypted backup file name for db + instant.
 * @es Construye nombre de archivo cifrado para db + instante.
 * @pt-BR Constrói nome de arquivo cifrado para db + instante.
 */
export function buildBackupFileName(dbName: string, takenAt: Date = new Date()): string {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '_')
  return `bizcode-pg-${safeDb}-${formatBackupStamp(takenAt)}.sql.gz.enc`
}

/**
 * @en Parses stamp from filename; returns null if pattern does not match.
 * @es Parsea el sello del nombre; null si no coincide el patrón.
 * @pt-BR Faz parse do carimbo no nome; null se o padrão não coincidir.
 */
export function parseBackupFileName(fileName: string): ParsedBackupName | null {
  const m = BACKUP_FILENAME_RE.exec(fileName)
  if (!m) return null
  const stamp = m[2]
  const y = Number(stamp.slice(0, 4))
  const mo = Number(stamp.slice(4, 6))
  const d = Number(stamp.slice(6, 8))
  const hh = Number(stamp.slice(9, 11))
  const mm = Number(stamp.slice(11, 13))
  const ss = Number(stamp.slice(13, 15))
  const takenAt = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss))
  if (Number.isNaN(takenAt.getTime())) return null
  return { fileName, dbName: m[1], takenAt }
}
