/**
 * @en Pure helpers for staging DR drill precondition (#197). Fail-closed without STAGING_DEPLOY_*.
 * @es Helpers puros para la precondición del drill DR staging (#197). Fail-closed sin STAGING_DEPLOY_*.
 * @pt-BR Helpers puros para a pré-condição do drill DR staging (#197). Fail-closed sem STAGING_DEPLOY_*.
 */

export const STAGING_DEPLOY_ENV_KEYS = [
  'STAGING_DEPLOY_HOST',
  'STAGING_DEPLOY_USER',
  'STAGING_DEPLOY_SSH_KEY',
  'STAGING_DEPLOY_PATH',
] as const

export type StagingDeployEnvKey = (typeof STAGING_DEPLOY_ENV_KEYS)[number]

export type DrStagingCheckResult = {
  ok: boolean
  missing: StagingDeployEnvKey[]
  present: StagingDeployEnvKey[]
  checklist: string[]
}

/**
 * @en Returns which STAGING_DEPLOY_* keys are set (non-empty after trim).
 * @es Devuelve qué claves STAGING_DEPLOY_* están definidas (no vacías tras trim).
 * @pt-BR Retorna quais chaves STAGING_DEPLOY_* estão definidas (não vazias após trim).
 */
export function evaluateStagingDeployEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): DrStagingCheckResult {
  const present: StagingDeployEnvKey[] = []
  const missing: StagingDeployEnvKey[] = []
  for (const key of STAGING_DEPLOY_ENV_KEYS) {
    const value = env[key]
    if (typeof value === 'string' && value.trim() !== '') {
      present.push(key)
    } else {
      missing.push(key)
    }
  }
  return {
    ok: missing.length === 0,
    missing,
    present,
    checklist: [
      'Confirm STAGING_DEPLOY_* (same fail-closed gate as .github/workflows/staging.yml)',
      'Record start time (UTC); take snapshot/backup on staging only',
      'Simulate failure (stop app/DB on staging only)',
      'Restore from backup; redeploy; verify GET /api/health and GET /status',
      'Record end time; compute RTO; compare to < 4h target',
      'Append SEC-015 row with measured RTO; note gaps',
      'Keep #197 OPEN until this timed drill AND a live uptime-monitor-register.md entry exist',
      'docker-compose.staging.yml is local practice only — not the remote staging AC',
    ],
  }
}
