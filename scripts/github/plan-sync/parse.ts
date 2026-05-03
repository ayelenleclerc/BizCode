import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  allLabelsForTodo,
  hashPlanContent,
  parsePlanFrontmatterYaml,
  splitPlanFrontmatter,
  todoContentHash,
} from '../../../src/lib/plan-sync'
import type { PlanDocument, PlanTodo } from '../../../src/lib/plan-sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type LabelCatalog = Set<string>

function defaultRepoRoot(): string {
  return path.resolve(__dirname, '../../..')
}

export { allLabelsForTodo, hashPlanContent, todoContentHash }

export function loadLabelCatalog(repoRoot: string): LabelCatalog {
  const p = path.join(repoRoot, '.github', 'labels.json')
  const raw = readFileSync(p, 'utf8')
  const arr = JSON.parse(raw) as { name: string }[]
  return new Set(arr.map((x) => x.name))
}

export function assertLabelsExist(catalog: LabelCatalog, labels: string[]): void {
  for (const name of labels) {
    if (!catalog.has(name)) {
      throw new Error(`Label "${name}" is not defined in .github/labels.json`)
    }
  }
}

export type ParsePlanOptions = {
  repoRoot?: string
}

/**
 * @en Parse and validate a Cursor `.plan.md` file (YAML frontmatter + todos).
 * @es Analiza y valida un archivo `.plan.md` de Cursor (frontmatter YAML + todos).
 * @pt-BR Analisa e valida um arquivo `.plan.md` do Cursor (frontmatter YAML + todos).
 */
export function parsePlanFile(
  absPath: string,
  options: ParsePlanOptions = {},
): { doc: PlanDocument; body: string; planHash: string } {
  const repoRoot = options.repoRoot ?? defaultRepoRoot()
  const raw = readFileSync(absPath, 'utf8')
  const { frontmatterYaml, body } = splitPlanFrontmatter(raw)
  const doc = parsePlanFrontmatterYaml(frontmatterYaml)
  const catalog = loadLabelCatalog(repoRoot)
  assertLabelsExist(catalog, ['needs-spec'])
  for (const t of doc.todos) {
    assertLabelsExist(catalog, allLabelsForTodo(t, body))
  }
  return { doc, body, planHash: hashPlanContent(absPath, raw) }
}

export function planSlugFromPath(absPath: string): string {
  const base = path.basename(absPath, path.extname(absPath))
  const s = base.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 120)
  return s || 'plan'
}

export type { PlanDocument, PlanTodo }
