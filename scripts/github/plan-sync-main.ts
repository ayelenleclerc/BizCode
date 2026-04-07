#!/usr/bin/env npx tsx
/**
 * @en CLI: sync a Cursor `.plan.md` to GitHub Issues and Project v2 (see docs).
 * @es CLI: sincroniza un `.plan.md` de Cursor con Issues de GitHub y Project v2.
 * @pt-BR CLI: sincroniza um `.plan.md` do Cursor com Issues do GitHub e Project v2.
 */
import path from 'node:path'
import { parsePlanFile, planSlugFromPath } from './plan-sync/parse'
import { resolveRepoRoot, syncPlanToGitHub } from './plan-sync/sync'

function usage(): string {
  return [
    'Usage: npm run plan:sync -- --plan <path-to.plan.md> [--repo-root <dir>] [--dry-run]',
    '',
    'Environment (non-dry-run): GH_TOKEN or GITHUB_TOKEN; GITHUB_REPOSITORY or GITHUB_OWNER+GITHUB_REPO;',
    'PROJECT_V2_ID; PROJECT_STATUS_FIELD_ID; PROJECT_STATUS_OPTION_BACKLOG;',
    'PROJECT_STATUS_OPTION_IN_PROGRESS; PROJECT_STATUS_OPTION_DONE',
    '',
    'See docs/*/quality/ (DOCUMENT_LOCALE_MAP: Cursor plan → GitHub sync).',
  ].join('\n')
}

function parseArgs(argv: string[]): {
  plan?: string
  repoRoot?: string
  dryRun: boolean
} {
  let plan: string | undefined
  let repoRoot: string | undefined
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
  }
  return { plan, repoRoot, dryRun }
}

async function main(): Promise<void> {
  const { plan, repoRoot: rootArg, dryRun } = parseArgs(process.argv.slice(2))
  if (!plan?.trim()) {
    console.error('Missing --plan <path>\n\n' + usage())
    process.exit(1)
  }
  const repoRoot = resolveRepoRoot(rootArg)
  const absPlan = path.isAbsolute(plan) ? plan : path.resolve(process.cwd(), plan)
  const planSlug = planSlugFromPath(absPlan)
  const { doc, body, planHash } = parsePlanFile(absPlan, { repoRoot })

  const result = await syncPlanToGitHub({
    repoRoot,
    planPath: path.relative(repoRoot, absPlan).replace(/\\/g, '/'),
    planSlug,
    doc,
    bodyMarkdown: body,
    planHash,
    dryRun,
  })

  console.log(
    [
      `plan:sync ${dryRun ? '(dry-run) ' : ''}done`,
      `  syncDurationMs: ${result.syncDurationMs}`,
      `  created: ${result.created}`,
      `  updated: ${result.updated}`,
      `  unchanged: ${result.unchanged}`,
      `  failed: ${result.failed}`,
      `  projectLinkFailures: ${result.projectLinkFailures}`,
      `  orphanHandled: ${result.orphanHandled}`,
    ].join('\n'),
  )
  if (result.lines.length) {
    console.log('\nLog:\n' + result.lines.map((l) => '  ' + l).join('\n'))
  }
  if (result.failed > 0 || result.projectLinkFailures > 0) {
    process.exit(1)
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
