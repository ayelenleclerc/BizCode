import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { parsePlanFile, planSlugFromPath } from './plan-sync/parse'
import { resolveRepoRoot, syncPlanToGitHub } from './plan-sync/sync'

export type ApprovePlanOptions = {
  plan: string
  repoRoot?: string
  dryRun: boolean
  archiveDir?: string
}

export type ApprovePlanResult = {
  archivePath: string
  syncResult: Awaited<ReturnType<typeof syncPlanToGitHub>>
}

export function defaultArchiveDir(repoRoot: string): string {
  return path.join(repoRoot, '.cursor', 'plans')
}

function archiveSlugFromPath(absPlanPath: string): string {
  return planSlugFromPath(absPlanPath).replace(/([._-])plan$/i, '')
}

/**
 * @en Build a deterministic UTC timestamp for archive filenames.
 * @es Genera una marca de tiempo UTC determinista para nombres de archivo.
 * @pt-BR Gera um carimbo de tempo UTC determinístico para nomes de arquivo.
 */
export function timestampForArchive(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-')
}

/**
 * @en Compute archive path under `.cursor/plans` with timestamp + slug.
 * @es Calcula la ruta de archivo en `.cursor/plans` con timestamp + slug.
 * @pt-BR Calcula o caminho de arquivo em `.cursor/plans` com timestamp + slug.
 */
export function buildArchivePath(params: {
  repoRoot: string
  absPlanPath: string
  archiveDir?: string
  now?: Date
}): string {
  const slug = archiveSlugFromPath(params.absPlanPath)
  const ts = timestampForArchive(params.now ?? new Date())
  const dir = params.archiveDir
    ? path.resolve(params.repoRoot, params.archiveDir)
    : defaultArchiveDir(params.repoRoot)
  return path.join(dir, `${ts}-${slug}.plan.md`)
}

export function archiveApprovedPlan(params: {
  repoRoot: string
  absPlanPath: string
  archiveDir?: string
  now?: Date
  dryRun: boolean
}): string {
  const archivePath = buildArchivePath(params)
  if (!params.dryRun) {
    mkdirSync(path.dirname(archivePath), { recursive: true })
    copyFileSync(params.absPlanPath, archivePath)
  }
  return archivePath
}

export async function approvePlanToGitHub(opts: ApprovePlanOptions): Promise<ApprovePlanResult> {
  if (!opts.plan.trim()) {
    throw new Error('Missing --plan <path>')
  }
  const repoRoot = resolveRepoRoot(opts.repoRoot)
  const absPlan = path.isAbsolute(opts.plan) ? opts.plan : path.resolve(process.cwd(), opts.plan)
  const planSlug = planSlugFromPath(absPlan)
  const { doc, body, planHash } = parsePlanFile(absPlan, { repoRoot })
  const archivePath = archiveApprovedPlan({
    repoRoot,
    absPlanPath: absPlan,
    archiveDir: opts.archiveDir,
    dryRun: opts.dryRun,
  })
  const syncResult = await syncPlanToGitHub({
    repoRoot,
    planPath: path.relative(repoRoot, absPlan).replace(/\\/g, '/'),
    planSlug,
    doc,
    bodyMarkdown: body,
    planHash,
    dryRun: opts.dryRun,
  })
  return { archivePath, syncResult }
}
