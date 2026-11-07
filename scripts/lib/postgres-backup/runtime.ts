/**
 * @en Runs pg_dump / psql via docker exec or local CLI.
 * @es Ejecuta pg_dump / psql vía docker exec o CLI local.
 * @pt-BR Executa pg_dump / psql via docker exec ou CLI local.
 */
import { spawn } from 'node:child_process'
import type { PostgresBackupConfig } from './config'

export type RunResult = { code: number | null; stdout: Buffer; stderr: string }

function runCommand(
  command: string,
  args: string[],
  opts?: { input?: Buffer; env?: NodeJS.ProcessEnv },
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...opts?.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })
    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => chunks.push(c))
    child.stderr.on('data', (c: Buffer) => errChunks.push(c))
    child.on('error', reject)
    child.on('close', (code) => {
      resolve({
        code,
        stdout: Buffer.concat(chunks),
        stderr: Buffer.concat(errChunks).toString('utf8'),
      })
    })
    if (opts?.input) {
      child.stdin.write(opts.input)
    }
    child.stdin.end()
  })
}

/**
 * @en Captures a logical SQL dump (custom not used; plain SQL for gzip+encrypt).
 * @es Captura dump SQL lógico (plain SQL para gzip+encrypt).
 * @pt-BR Captura dump SQL lógico (SQL plain para gzip+encrypt).
 */
export async function runPgDump(cfg: PostgresBackupConfig): Promise<Buffer> {
  if (cfg.useDocker) {
    const result = await runCommand('docker', [
      'exec',
      '-i',
      cfg.dockerContainer,
      'pg_dump',
      '-U',
      cfg.postgresUser,
      '-d',
      cfg.postgresDb,
      '--no-owner',
      '--no-acl',
    ])
    if (result.code !== 0) {
      throw new Error(
        `docker exec pg_dump failed (exit ${result.code}): ${result.stderr.trim() || 'no stderr'}`,
      )
    }
    if (result.stdout.length === 0) {
      throw new Error('pg_dump produced empty output')
    }
    return result.stdout
  }

  const result = await runCommand('pg_dump', [
    '-U',
    cfg.postgresUser,
    '-d',
    cfg.postgresDb,
    '--no-owner',
    '--no-acl',
  ])
  if (result.code !== 0) {
    throw new Error(`pg_dump failed (exit ${result.code}): ${result.stderr.trim() || 'no stderr'}`)
  }
  if (result.stdout.length === 0) {
    throw new Error('pg_dump produced empty output')
  }
  return result.stdout
}

/**
 * @en Restores plain SQL into the configured database (destructive).
 * @es Restaura SQL plano en la base configurada (destructivo).
 * @pt-BR Restaura SQL plain na base configurada (destrutivo).
 */
export async function runPsqlRestore(
  cfg: PostgresBackupConfig,
  sql: Buffer,
  targetDb: string,
): Promise<void> {
  if (cfg.useDocker) {
    const result = await runCommand(
      'docker',
      ['exec', '-i', cfg.dockerContainer, 'psql', '-U', cfg.postgresUser, '-d', targetDb, '-v', 'ON_ERROR_STOP=1'],
      { input: sql },
    )
    if (result.code !== 0) {
      throw new Error(
        `docker exec psql restore failed (exit ${result.code}): ${result.stderr.trim() || 'no stderr'}`,
      )
    }
    return
  }

  const result = await runCommand(
    'psql',
    ['-U', cfg.postgresUser, '-d', targetDb, '-v', 'ON_ERROR_STOP=1'],
    { input: sql },
  )
  if (result.code !== 0) {
    throw new Error(`psql restore failed (exit ${result.code}): ${result.stderr.trim() || 'no stderr'}`)
  }
}

const SAFE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

/**
 * @en Validates and double-quotes a PostgreSQL identifier (db/table name).
 * @es Valida y entrecomilla un identificador PostgreSQL (nombre de BD/tabla).
 * @pt-BR Valida e coloca aspas em um identificador PostgreSQL (nome de BD/tabela).
 */
export function quotePgIdent(name: string): string {
  if (!SAFE_IDENT.test(name)) {
    throw new Error(`Unsafe PostgreSQL identifier: ${name}`)
  }
  return `"${name}"`
}

async function runPsqlAdmin(
  cfg: PostgresBackupConfig,
  sql: string,
  adminDb = 'postgres',
): Promise<RunResult> {
  if (cfg.useDocker) {
    return runCommand(
      'docker',
      [
        'exec',
        '-i',
        cfg.dockerContainer,
        'psql',
        '-U',
        cfg.postgresUser,
        '-d',
        adminDb,
        '-v',
        'ON_ERROR_STOP=1',
        '-t',
        '-A',
      ],
      { input: Buffer.from(sql, 'utf8') },
    )
  }
  return runCommand(
    'psql',
    ['-U', cfg.postgresUser, '-d', adminDb, '-v', 'ON_ERROR_STOP=1', '-t', '-A'],
    { input: Buffer.from(sql, 'utf8') },
  )
}

/**
 * @en Ensures a database exists (CREATE DATABASE IF NOT EXISTS via catalog check).
 * @es Asegura que exista una base (CREATE DATABASE tras chequear el catálogo).
 * @pt-BR Garante que o banco exista (CREATE DATABASE após checar o catálogo).
 */
export async function ensureDatabaseExists(
  cfg: PostgresBackupConfig,
  dbName: string,
): Promise<void> {
  const q = quotePgIdent(dbName)
  const check = await runPsqlAdmin(
    cfg,
    `SELECT 1 FROM pg_database WHERE datname = '${dbName.replace(/'/g, "''")}';`,
  )
  if (check.code !== 0) {
    throw new Error(
      `ensureDatabaseExists check failed (exit ${check.code}): ${check.stderr.trim() || 'no stderr'}`,
    )
  }
  if (check.stdout.toString('utf8').trim() === '1') return

  const created = await runPsqlAdmin(cfg, `CREATE DATABASE ${q};`)
  if (created.code !== 0) {
    throw new Error(
      `CREATE DATABASE failed (exit ${created.code}): ${created.stderr.trim() || 'no stderr'}`,
    )
  }
}

/**
 * @en Drops a database if it exists (terminates sessions first). Never drops the configured source DB.
 * @es Elimina una base si existe (termina sesiones antes). Nunca elimina la BD origen configurada.
 * @pt-BR Remove um banco se existir (encerra sessões antes). Nunca remove a BD origem configurada.
 */
export async function dropDatabaseIfExists(
  cfg: PostgresBackupConfig,
  dbName: string,
): Promise<void> {
  if (dbName === cfg.postgresDb) {
    throw new Error(`Refusing to drop configured source database: ${dbName}`)
  }
  quotePgIdent(dbName)
  const lit = dbName.replace(/'/g, "''")
  const terminate = await runPsqlAdmin(
    cfg,
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${lit}' AND pid <> pg_backend_pid();`,
  )
  if (terminate.code !== 0) {
    throw new Error(
      `terminate backends failed (exit ${terminate.code}): ${terminate.stderr.trim() || 'no stderr'}`,
    )
  }
  const dropped = await runPsqlAdmin(cfg, `DROP DATABASE IF EXISTS ${quotePgIdent(dbName)};`)
  if (dropped.code !== 0) {
    throw new Error(
      `DROP DATABASE failed (exit ${dropped.code}): ${dropped.stderr.trim() || 'no stderr'}`,
    )
  }
}

/**
 * @en Returns COUNT(*) for a public table in the given database.
 * @es Devuelve COUNT(*) de una tabla public en la base indicada.
 * @pt-BR Retorna COUNT(*) de uma tabela public no banco indicado.
 */
export async function countTableRows(
  cfg: PostgresBackupConfig,
  dbName: string,
  tableName: string,
): Promise<number> {
  quotePgIdent(dbName)
  const table = quotePgIdent(tableName)
  let result: RunResult
  if (cfg.useDocker) {
    result = await runCommand(
      'docker',
      [
        'exec',
        '-i',
        cfg.dockerContainer,
        'psql',
        '-U',
        cfg.postgresUser,
        '-d',
        dbName,
        '-v',
        'ON_ERROR_STOP=1',
        '-t',
        '-A',
        '-c',
        `SELECT COUNT(*)::text FROM ${table};`,
      ],
    )
  } else {
    result = await runCommand('psql', [
      '-U',
      cfg.postgresUser,
      '-d',
      dbName,
      '-v',
      'ON_ERROR_STOP=1',
      '-t',
      '-A',
      '-c',
      `SELECT COUNT(*)::text FROM ${table};`,
    ])
  }
  if (result.code !== 0) {
    throw new Error(
      `countTableRows ${dbName}.${tableName} failed (exit ${result.code}): ${result.stderr.trim() || 'no stderr'}`,
    )
  }
  const raw = result.stdout.toString('utf8').trim()
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) {
    throw new Error(`countTableRows ${dbName}.${tableName}: unexpected output ${JSON.stringify(raw)}`)
  }
  return n
}

/**
 * @en Soft-fail optional S3/R2 upload via AWS CLI (no SDK in repo).
 * @es Upload S3/R2 opcional vía AWS CLI (soft-fail; sin SDK en el repo).
 * @pt-BR Upload S3/R2 opcional via AWS CLI (soft-fail; sem SDK no repo).
 */
export async function tryUploadToS3(localPath: string, s3Uri: string): Promise<{ ok: boolean; detail: string }> {
  const dest = s3Uri.endsWith('/')
    ? `${s3Uri}${localPath.split(/[/\\]/).pop()}`
    : `${s3Uri}/${localPath.split(/[/\\]/).pop()}`
  try {
    const result = await runCommand('aws', ['s3', 'cp', localPath, dest])
    if (result.code !== 0) {
      return {
        ok: false,
        detail: `aws s3 cp soft-fail (exit ${result.code}): ${result.stderr.trim() || result.stdout.toString('utf8').trim()}`,
      }
    }
    return { ok: true, detail: dest }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, detail: `aws CLI unavailable or failed: ${msg}` }
  }
}

/**
 * @en Soft-fail email alert using SECURITY_ALERT_EMAILS + SMTP when configured.
 * @es Alerta email soft-fail con SECURITY_ALERT_EMAILS + SMTP si hay config.
 * @pt-BR Alerta email soft-fail com SECURITY_ALERT_EMAILS + SMTP se houver config.
 */
export async function tryAlertBackupFailure(subject: string, text: string): Promise<void> {
  const raw = process.env.SECURITY_ALERT_EMAILS?.trim()
  if (!raw) return
  try {
    const { resolveSmtpTransportConfig } = await import('../../../apps/server/config/smtpTransport')
    const nodemailer = await import('nodemailer')
    const smtp = resolveSmtpTransportConfig()
    if (!smtp) return
    const emails = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (emails.length === 0) return
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transport.sendMail({
      from: smtp.from,
      to: emails.join(','),
      subject,
      text,
    })
  } catch {
    // Soft-fail: never block backup exit path on alert delivery.
  }
}
