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
import { gunzipSync } from 'node:zlib'
import { loadPostgresBackupConfig } from './lib/postgres-backup/config'
import { decryptBackupBlob } from './lib/postgres-backup/crypto'
import { parseBackupFileName } from './lib/postgres-backup/naming'
import { runPsqlRestore } from './lib/postgres-backup/runtime'

function parseArgs(argv: string[]): {
  list: boolean
  yes: boolean
  file: string | null
  db: string | null
} {
  let list = false
  let yes = false
  let file: string | null = null
  let db: string | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--list') list = true
    else if (a === '--yes' || a === '-y') yes = true
    else if (a === '--file' || a === '-f') {
      file = argv[++i] ?? null
    } else if (a === '--db') {
      db = argv[++i] ?? null
    }
  }
  return { list, yes, file, db }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
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
        error: 'Refusing destructive restore without --yes',
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

void main()
