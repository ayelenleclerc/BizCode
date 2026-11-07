/**
 * @en Isolated backup→restore integrity drill for the pilot (#449). Never targets production.
 *   Creates side DB `bizcode_restore_drill_449`, restores encrypted dump, compares critical table counts.
 * @es Drill aislado backup→restore con integridad para el piloto (#449). Nunca apunta a producción.
 * @pt-BR Drill isolado backup→restore com integridade para o piloto (#449). Nunca aponta para produção.
 *
 * Usage: `pnpm run backup:postgres:drill`
 * Requires: BACKUP_ENCRYPTION_KEY, reachable test Postgres (Docker by default).
 */
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { loadPostgresBackupConfig } from './lib/postgres-backup/config'
import { decryptBackupBlob, encryptBackupBlob } from './lib/postgres-backup/crypto'
import { buildBackupFileName } from './lib/postgres-backup/naming'
import { DRILL_CRITICAL_TABLES, DRILL_SIDE_DB } from './lib/postgres-backup/drill'
import {
  countTableRows,
  dropDatabaseIfExists,
  ensureDatabaseExists,
  runPgDump,
  runPsqlRestore,
} from './lib/postgres-backup/runtime'

export type DrillTableResult = {
  table: string
  source: number | null
  restored: number | null
  ok: boolean
  skipped?: string
}

async function tryCount(
  cfg: ReturnType<typeof loadPostgresBackupConfig>,
  dbName: string,
  table: string,
): Promise<{ count: number } | { error: string }> {
  try {
    return { count: await countTableRows(cfg, dbName, table) }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

async function main(): Promise<void> {
  const started = new Date()
  let cfg
  try {
    cfg = loadPostgresBackupConfig()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ok: false, stage: 'config', error: msg }))
    process.exitCode = 1
    return
  }

  if (cfg.postgresDb === DRILL_SIDE_DB) {
    console.error(
      JSON.stringify({
        ok: false,
        stage: 'config',
        error: `Source DB must not be ${DRILL_SIDE_DB}; set BIZCODE_POSTGRES_DB to the test source`,
      }),
    )
    process.exitCode = 1
    return
  }

  const drillDir = path.join(cfg.backupDir, 'drill-449')
  let backupPath: string | null = null
  const tableResults: DrillTableResult[] = []

  try {
    mkdirSync(drillDir, { recursive: true })

    for (const table of DRILL_CRITICAL_TABLES) {
      const src = await tryCount(cfg, cfg.postgresDb, table)
      if ('error' in src) {
        tableResults.push({
          table,
          source: null,
          restored: null,
          ok: true,
          skipped:
            src.error.includes('does not exist') || src.error.includes('relation')
              ? 'table_missing_on_source'
              : src.error,
        })
        continue
      }
      tableResults.push({
        table,
        source: src.count,
        restored: null,
        ok: false,
      })
    }

    const sql = await runPgDump(cfg)
    const gz = gzipSync(sql)
    const enc = encryptBackupBlob(gz, cfg.encryptionKey)
    const fileName = buildBackupFileName(cfg.postgresDb, started)
    backupPath = path.join(drillDir, fileName)
    writeFileSync(backupPath, enc)

    await dropDatabaseIfExists(cfg, DRILL_SIDE_DB)
    await ensureDatabaseExists(cfg, DRILL_SIDE_DB)

    const payload = decryptBackupBlob(enc, cfg.encryptionKey)
    const plain = gunzipSync(payload)
    await runPsqlRestore(cfg, plain, DRILL_SIDE_DB)

    let mismatches = 0
    for (const row of tableResults) {
      if (row.skipped) continue
      const restored = await tryCount(cfg, DRILL_SIDE_DB, row.table)
      if ('error' in restored) {
        row.restored = null
        row.ok = false
        row.skipped = restored.error
        mismatches += 1
        continue
      }
      row.restored = restored.count
      row.ok = row.source === restored.count
      if (!row.ok) mismatches += 1
    }

    await dropDatabaseIfExists(cfg, DRILL_SIDE_DB)

    const ok = mismatches === 0
    console.log(
      JSON.stringify({
        ok,
        stage: 'drill',
        issue: 449,
        sourceDb: cfg.postgresDb,
        sideDb: DRILL_SIDE_DB,
        backupFile: backupPath,
        backupBytes: enc.length,
        container: cfg.useDocker ? cfg.dockerContainer : null,
        tables: tableResults,
        mismatches,
        takenAt: started.toISOString(),
        note: 'Isolated drill only; not a staging/production AC for #197',
      }),
    )
    if (!ok) process.exitCode = 1
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    try {
      await dropDatabaseIfExists(cfg, DRILL_SIDE_DB)
    } catch {
      // best-effort cleanup
    }
    console.error(
      JSON.stringify({
        ok: false,
        stage: 'drill',
        issue: 449,
        error: msg,
        backupFile: backupPath,
        tables: tableResults,
      }),
    )
    process.exitCode = 1
  } finally {
    if (backupPath) {
      try {
        unlinkSync(backupPath)
      } catch {
        // keep artifact on cleanup failure for local diagnosis
      }
    }
  }
}

void main()
