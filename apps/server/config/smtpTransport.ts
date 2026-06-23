export type SmtpTransportConfig = {
  host: string
  port: number
  secure: boolean
  auth?: { user: string; pass: string }
  from: string
}

/**
 * @en Resolves SMTP transport from SMTP_URL or legacy SMTP_* env vars.
 * @es Resuelve transporte SMTP desde SMTP_URL o variables SMTP_* heredadas.
 * @pt-BR Resolve transporte SMTP a partir de SMTP_URL ou variáveis SMTP_* legadas.
 */
export function resolveSmtpTransportConfig(
  env: Record<string, string | undefined> = process.env,
): SmtpTransportConfig | null {
  const smtpUrl = env.SMTP_URL?.trim()
  if (smtpUrl) {
    const parsed = new URL(smtpUrl)
    const secure = parsed.protocol === 'smtps:'
    const port = parsed.port
      ? Number.parseInt(parsed.port, 10)
      : secure
        ? 465
        : 587
    const user = decodeURIComponent(parsed.username)
    const pass = decodeURIComponent(parsed.password)
    const auth = user.length > 0 ? { user, pass } : undefined
    const from = env.SMTP_FROM?.trim() || user
    if (!from) {
      return null
    }
    return { host: parsed.hostname, port, secure, auth, from }
  }

  if (
    env.SMTP_HOST?.trim() &&
    env.SMTP_PORT?.trim() &&
    env.SMTP_USER?.trim() &&
    env.SMTP_PASS?.trim() &&
    env.SMTP_FROM?.trim()
  ) {
    const port = Number.parseInt(env.SMTP_PORT, 10)
    return {
      host: env.SMTP_HOST.trim(),
      port,
      secure: port === 465,
      auth: { user: env.SMTP_USER.trim(), pass: env.SMTP_PASS.trim() },
      from: env.SMTP_FROM.trim(),
    }
  }

  return null
}
