/**
 * @en Guardrails so staging seed never targets production database URLs (#152).
 * @es Guardrails para que el seed de staging no apunte a URLs de base de producción (#152).
 * @pt-BR Guardrails para o seed de staging nunca apontar URLs de banco de produção (#152).
 */

export type StagingDbGuardInput = {
  targetUrl: string
  stagingUrl?: string
  prodUrl?: string
  /** Comma-separated hostname denylist treated as production. */
  prodHostsDenylist?: string
}

export type StagingDbGuardResult =
  | { ok: true; targetUrl: string }
  | { ok: false; reason: string }

/**
 * @en Normalize a Postgres URL for equality checks (trim + lowercase protocol/host).
 * @es Normaliza una URL de Postgres para comparación (trim + minúsculas en protocolo/host).
 * @pt-BR Normaliza uma URL Postgres para comparação (trim + minúsculas em protocolo/host).
 */
export function normalizeDatabaseUrl(url: string): string {
  return url.trim()
}

function parseHostname(url: string): string | null {
  try {
    const withProto = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url) ? url : `postgresql://${url}`
    const u = new URL(withProto)
    return u.hostname.toLowerCase() || null
  } catch {
    return null
  }
}

/**
 * @en Abort rules: missing target; staging===prod; hostname in production denylist.
 * @es Reglas de aborto: sin target; staging===prod; hostname en denylist de producción.
 * @pt-BR Regras de aborto: sem target; staging===prod; hostname na denylist de produção.
 */
export function assertSafeStagingDatabaseUrl(input: StagingDbGuardInput): StagingDbGuardResult {
  const target = normalizeDatabaseUrl(input.targetUrl)
  if (!target) {
    return { ok: false, reason: 'Target DATABASE_URL / STAGING_DATABASE_URL is empty.' }
  }

  const staging = input.stagingUrl ? normalizeDatabaseUrl(input.stagingUrl) : ''
  const prod = input.prodUrl ? normalizeDatabaseUrl(input.prodUrl) : ''

  if (staging && prod && staging === prod) {
    return {
      ok: false,
      reason: 'STAGING_DATABASE_URL must not equal PROD_DATABASE_URL (database isolation).',
    }
  }

  if (prod && target === prod) {
    return {
      ok: false,
      reason: 'Refusing to seed: target URL equals PROD_DATABASE_URL.',
    }
  }

  const host = parseHostname(target)
  const denylist = (input.prodHostsDenylist ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

  if (host && denylist.includes(host)) {
    return {
      ok: false,
      reason: `Refusing to seed: host "${host}" is listed in BIZCODE_PROD_DB_HOSTS.`,
    }
  }

  return { ok: true, targetUrl: target }
}

/**
 * @en Resolve seed target: STAGING_DATABASE_URL if set, else DATABASE_URL.
 * @es Resuelve el target del seed: STAGING_DATABASE_URL si existe, si no DATABASE_URL.
 * @pt-BR Resolve o alvo do seed: STAGING_DATABASE_URL se definido, senão DATABASE_URL.
 */
export function resolveStagingSeedTargetUrl(env: NodeJS.ProcessEnv): string {
  const staging = env.STAGING_DATABASE_URL?.trim()
  if (staging) return staging
  return env.DATABASE_URL?.trim() ?? ''
}
