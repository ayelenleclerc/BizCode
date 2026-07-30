/**
 * @en Prunes local encrypted backups under 7 daily / 4 weekly / 3 monthly retention.
 * @es Poda backups cifrados locales con retención 7 diarios / 4 semanales / 3 mensuales.
 * @pt-BR Poda backups cifrados locais com retenção 7 diários / 4 semanais / 3 mensais.
 *
 * Usage: npx tsx scripts/prune-postgres-backups.ts [--dry-run]
 */
import { readdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { loadPostgresBackupConfig } from './lib/postgres-backup/config'
import { parseBackupFileName } from './lib/postgres-backup/naming'
import { selectBackupsToPrune } from './lib/postgres-backup/retention'

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  let cfg
  try {
    cfg = loadPostgresBackupConfig()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ok: false, stage: 'config', error: msg }))
    process.exitCode = 1
    return
  }

  let dirNames: string[]
  try {
    dirNames = readdirSync(cfg.backupDir)
  } catch {
    console.log(JSON.stringify({ ok: true, pruned: [], dryRun, dir: cfg.backupDir, note: 'dir missing' }))
    return
  }

  const parsed = dirNames
    .map((n) => parseBackupFileName(n))
    .filter((p): p is NonNullable<typeof p> => p != null)

  const toPrune = selectBackupsToPrune(parsed)
  const pruned: string[] = []
  for (const item of toPrune) {
    const full = path.join(cfg.backupDir, item.fileName)
    if (!dryRun) {
      unlinkSync(full)
    }
    pruned.push(item.fileName)
  }

  console.log(
    JSON.stringify({
      ok: true,
      dryRun,
      dir: cfg.backupDir,
      total: parsed.length,
      pruned,
      kept: parsed.length - pruned.length,
    }),
  )
}

void main()
