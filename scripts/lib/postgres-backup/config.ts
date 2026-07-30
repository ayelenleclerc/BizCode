/**
 * @en Shared env resolution for PostgreSQL backup / restore / prune scripts.
 * @es Resolución de env compartida para scripts de backup / restore / prune.
 * @pt-BR Resolução de env compartilhada para scripts de backup / restore / prune.
 */
import path from 'node:path'

export type PostgresBackupConfig = {
  encryptionKey: string
  backupDir: string
  s3Uri: string | null
  dockerContainer: string
  postgresUser: string
  postgresDb: string
  useDocker: boolean
}

/**
 * @en Reads backup-related env; throws if BACKUP_ENCRYPTION_KEY is missing.
 * @es Lee env de backup; lanza si falta BACKUP_ENCRYPTION_KEY.
 * @pt-BR Lê env de backup; lança se faltar BACKUP_ENCRYPTION_KEY.
 */
export function loadPostgresBackupConfig(
  env: NodeJS.ProcessEnv = process.env,
): PostgresBackupConfig {
  const encryptionKey = env.BACKUP_ENCRYPTION_KEY?.trim() ?? ''
  if (!encryptionKey) {
    throw new Error('BACKUP_ENCRYPTION_KEY is required')
  }
  const backupDir = path.resolve(
    env.BIZCODE_BACKUP_DIR?.trim() || path.join(process.cwd(), '.bizcode-backups'),
  )
  const s3Raw = env.BIZCODE_BACKUP_S3_URI?.trim()
  const dockerContainer = env.BIZCODE_POSTGRES_CONTAINER?.trim() || 'bizcode_db'
  const postgresUser = env.BIZCODE_POSTGRES_USER?.trim() || 'postgres'
  const postgresDb =
    env.BIZCODE_POSTGRES_DB?.trim() ||
    env.POSTGRES_DB?.trim() ||
    'bizcode_dev'
  const useDocker = (env.BIZCODE_BACKUP_USE_DOCKER ?? 'true').toLowerCase() !== 'false'

  return {
    encryptionKey,
    backupDir,
    s3Uri: s3Raw && s3Raw.length > 0 ? s3Raw : null,
    dockerContainer,
    postgresUser,
    postgresDb,
    useDocker,
  }
}
