/**
 * @en PostgreSQL backup job: pg_dump → gzip → AES-256-GCM → local dir (+ optional S3 CLI).
 * @es Job de backup PostgreSQL: pg_dump → gzip → AES-256-GCM → dir local (+ S3 CLI opcional).
 * @pt-BR Job de backup PostgreSQL: pg_dump → gzip → AES-256-GCM → dir local (+ S3 CLI opcional).
 *
 * Schedule (ops): `0 2 * * *` UTC → `npm run backup:postgres`
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import path from 'node:path'
import { loadPostgresBackupConfig } from './lib/postgres-backup/config'
import { encryptBackupBlob } from './lib/postgres-backup/crypto'
import { buildBackupFileName } from './lib/postgres-backup/naming'
import { runPgDump, tryAlertBackupFailure, tryUploadToS3 } from './lib/postgres-backup/runtime'

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

  try {
    mkdirSync(cfg.backupDir, { recursive: true })
    const sql = await runPgDump(cfg)
    const gz = gzipSync(sql)
    const enc = encryptBackupBlob(gz, cfg.encryptionKey)
    const fileName = buildBackupFileName(cfg.postgresDb, started)
    const outPath = path.join(cfg.backupDir, fileName)
    writeFileSync(outPath, enc)

    let s3: { ok: boolean; detail: string } | null = null
    if (cfg.s3Uri) {
      s3 = await tryUploadToS3(outPath, cfg.s3Uri)
    }

    console.log(
      JSON.stringify({
        ok: true,
        path: outPath,
        bytes: enc.length,
        db: cfg.postgresDb,
        container: cfg.useDocker ? cfg.dockerContainer : null,
        s3,
        takenAt: started.toISOString(),
      }),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ok: false, stage: 'backup', error: msg }))
    await tryAlertBackupFailure(
      '[BizCode] PostgreSQL backup failed',
      `Backup failed at ${started.toISOString()}\n\n${msg}\n`,
    )
    process.exitCode = 1
  }
}

void main()
