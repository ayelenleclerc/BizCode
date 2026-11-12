/**
 * @en Staging DR drill precondition check (#197). Exits 0 only when all STAGING_DEPLOY_* are set.
 * @es Chequeo de precondición del drill DR staging (#197). Sale 0 solo si están todos los STAGING_DEPLOY_*.
 * @pt-BR Verificação de pré-condição do drill DR staging (#197). Sai 0 só se todos os STAGING_DEPLOY_* estiverem definidos.
 *
 * Usage: `pnpm run dr:staging:check`
 * Does not SSH, stop services, or invent uptime URLs.
 */

import { evaluateStagingDeployEnv } from './lib/drStagingCheck'

function main(): void {
  const result = evaluateStagingDeployEnv(process.env)
  const payload = {
    ok: result.ok,
    issue: 197,
    present: result.present,
    missing: result.missing,
    checklist: result.checklist,
    note: result.ok
      ? 'Preconditions met. Execute the timed staging drill per docs/en/quality/disaster-recovery.md; keep #197 open until SEC-015 + uptime-monitor-register evidence exist.'
      : 'STAGING_DEPLOY_* incomplete — fail-closed (same gate as staging.yml). Remote staging DR AC remains Not evidenced.',
  }
  console.log(JSON.stringify(payload, null, 2))
  process.exitCode = result.ok ? 0 : 1
}

main()
