#!/usr/bin/env npx tsx
/**
 * @en CLI: archive approved Cursor plan into `.cursor/plans` and run `plan:sync`.
 * @es CLI: archiva plan aprobado de Cursor en `.cursor/plans` y ejecuta `plan:sync`.
 * @pt-BR CLI: arquiva plano aprovado do Cursor em `.cursor/plans` e executa `plan:sync`.
 */
import { approvePlanToGitHub } from './plan-approve'

function usage(): string {
  return [
    'Usage: npm run plan:approve -- --plan <path-to.plan.md> [--repo-root <dir>] [--archive-dir <dir>] [--dry-run]',
    '',
    'Behavior:',
    '  1) Archives approved plan copy under .cursor/plans (timestamp + slug)',
    '  2) Runs existing plan:sync flow (GitHub Issues + Project v2)',
    '',
    'Note: No repository hook to Cursor Build click is implemented in this codebase.',
  ].join('\n')
}

function parseArgs(argv: string[]): {
  plan?: string
  repoRoot?: string
  archiveDir?: string
  dryRun: boolean
} {
  let plan: string | undefined
  let repoRoot: string | undefined
  let archiveDir: string | undefined
  let dryRun = false
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      console.log(usage())
      process.exit(0)
    }
    if (a === '--dry-run') {
      dryRun = true
      continue
    }
    if (a === '--plan') {
      plan = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--repo-root') {
      repoRoot = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--archive-dir') {
      archiveDir = argv[i + 1]
      i += 1
      continue
    }
  }
  return { plan, repoRoot, archiveDir, dryRun }
}

async function main(): Promise<void> {
  const { plan, repoRoot, archiveDir, dryRun } = parseArgs(process.argv.slice(2))
  if (!plan?.trim()) {
    console.error('Missing --plan <path>\n\n' + usage())
    process.exit(1)
  }
  const { archivePath, syncResult } = await approvePlanToGitHub({
    plan,
    repoRoot,
    archiveDir,
    dryRun,
  })
  console.log(
    [
      `plan:approve ${dryRun ? '(dry-run) ' : ''}done`,
      `  archived: ${dryRun ? 'would write' : 'wrote'} ${archivePath}`,
      `  syncDurationMs: ${syncResult.syncDurationMs}`,
      `  created: ${syncResult.created}`,
      `  updated: ${syncResult.updated}`,
      `  unchanged: ${syncResult.unchanged}`,
      `  failed: ${syncResult.failed}`,
      `  projectLinkFailures: ${syncResult.projectLinkFailures}`,
      `  orphanHandled: ${syncResult.orphanHandled}`,
    ].join('\n'),
  )
  if (syncResult.lines.length) {
    console.log('\nLog:\n' + syncResult.lines.map((l) => '  ' + l).join('\n'))
  }
  if (syncResult.failed > 0 || syncResult.projectLinkFailures > 0) {
    process.exit(1)
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
