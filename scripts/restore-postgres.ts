/**
 * @en Restore encrypted PostgreSQL backup (decrypt → gunzip → psql). Requires --yes.
 * @es Restaura backup PostgreSQL cifrado (decrypt → gunzip → psql). Exige --yes.
 * @pt-BR Restaura backup PostgreSQL cifrado (decrypt → gunzip → psql). Exige --yes.
 *
 * Usage:
 *   npx tsx scripts/restore-postgres.ts --file <path> --yes [--db <name>]
 *   npx tsx scripts/restore-postgres.ts --list
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { loadPostgresBackupConfig } from './lib/postgres-backup/config'
import { decryptBackupBlob } from './lib/postgres-backup/crypto'
import { parseBackupFileName } from './lib/postgres-backup/naming'
import {
  parseRestorePostgresArgs,
  RESTORE_REQUIRES_YES,
} from './lib/postgres-backup/restoreArgs'
import { runPsqlRestore } from './lib/postgres-backup/runtime'

export { parseRestorePostgresArgs, RESTORE_REQUIRES_YES } from './lib/postgres-backup/restoreArgs'

async function main(): Promise<void> {
  const args = parseRestorePostgresArgs(process.argv.slice(2))
  let cfg
  try {
    cfg = loadPostgresBackupConfig()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ok: false, stage: 'config', error: msg }))
    process.exitCode = 1
    return
  }

  if (args.list) {
    let names: string[]
    try {
      names = readdirSync(cfg.backupDir)
    } catch {
      names = []
    }
    const parsed = names
      .map((n) => parseBackupFileName(n))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())
    console.log(
      JSON.stringify({
        ok: true,
        dir: cfg.backupDir,
        count: parsed.length,
        backups: parsed.map((p) => ({
          fileName: p.fileName,
          dbName: p.dbName,
          takenAt: p.takenAt.toISOString(),
        })),
      }),
    )
    return
  }

  if (!args.file) {
    console.error(
      JSON.stringify({
        ok: false,
        error: 'Pass --file <path> --yes to restore, or --list to list local backups',
      }),
    )
    process.exitCode = 1
    return
  }

  if (!args.yes) {
    console.error(
      JSON.stringify({
        ok: false,
        error: RESTORE_REQUIRES_YES,
      }),
    )
    process.exitCode = 1
    return
  }

  const targetDb = args.db?.trim() || cfg.postgresDb
  const abs = path.resolve(args.file)

  try {
    const payload = readFileSync(abs)
    const gz = decryptBackupBlob(payload, cfg.encryptionKey)
    const sql = gunzipSync(gz)
    await runPsqlRestore(cfg, sql, targetDb)
    console.log(
      JSON.stringify({
        ok: true,
        file: abs,
        db: targetDb,
        sqlBytes: sql.length,
      }),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ok: false, stage: 'restore', error: msg }))
    process.exitCode = 1
  }
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false
if (isDirectRun) {
  void main()
}
