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
