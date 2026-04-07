import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import {
  PlanDocument,
  PlanFrontmatterSchema,
  PlanTodo,
  PlanTodoMetaSchema,
  PlanTodoSchema,
} from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type LabelCatalog = Set<string>

function defaultRepoRoot(): string {
  // .../scripts/github/plan-sync -> repo root is three levels up
  return path.resolve(__dirname, '../../..')
}

/**
 * @en Split a Markdown plan file into YAML frontmatter (between first two ---) and body.
 * @es Separa un plan Markdown en frontmatter YAML (entre los primeros dos ---) y cuerpo.
 * @pt-BR Separa um plano Markdown em frontmatter YAML (entre os dois primeiros ---) e corpo.
 */
export function splitPlanFrontmatter(raw: string): { frontmatterYaml: string; body: string } {
  const lines = raw.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') {
    throw new Error('Plan must start with YAML frontmatter delimited by ---')
  }
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
  if (end === -1) {
    throw new Error('Missing closing --- for YAML frontmatter')
  }
  const frontmatterYaml = lines.slice(1, end).join('\n')
  const body = lines.slice(end + 1).join('\n')
  return { frontmatterYaml, body }
}

export function hashPlanContent(planPath: string, raw: string): string {
  return createHash('sha256').update(planPath).update('\0').update(raw).digest('hex').slice(0, 16)
}

export function todoContentHash(todo: PlanTodo): string {
  const normalized = PlanTodoSchema.parse(todo)
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex').slice(0, 16)
}

export function resolveDefaultMeta(todo: PlanTodo): Required<NonNullable<PlanTodo['meta']>> {
  const meta = PlanTodoMetaSchema.parse(todo.meta) ?? {}
  return {
    type: meta.type ?? 'feature',
    priority: meta.priority ?? 'P1',
    area: meta.area ?? 'platform',
  }
}

export function labelsForTodo(todo: PlanTodo): string[] {
  const m = resolveDefaultMeta(todo)
  if (todo.status === 'cancelled') {
    return [`type:chore`, `priority:${m.priority}`, `area:${m.area}`]
  }
  return [`type:${m.type}`, `priority:${m.priority}`, `area:${m.area}`]
}

/**
 * @en Optional labels from plan text heuristics (needs-docs, needs-tests).
 * @es Etiquetas opcionales por heurística del texto del plan.
 * @pt-BR Rótulos opcionais por heurística do texto do plano.
 */
export function heuristicExtraLabels(todo: PlanTodo, planBody: string): string[] {
  const text = `${todo.content}\n${planBody}`.toLowerCase()
  const out = new Set<string>()
  if (
    /\b(docs?|documentation|documentaci[oó]n|openapi|i18n|traducc|translate|locale|localized)\b/.test(text)
  ) {
    out.add('needs-docs')
  }
  if (/\b(test|testing|prueba|coverage|vitest|playwright|e2e|cobertura)\b/.test(text)) {
    out.add('needs-tests')
  }
  return [...out]
}

/** Base plan labels plus heuristic extras; order: base then extras. */
export function allLabelsForTodo(todo: PlanTodo, planBody: string): string[] {
  return [...labelsForTodo(todo), ...heuristicExtraLabels(todo, planBody)]
}

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
  const parsed = parseYaml(frontmatterYaml) as unknown
  const doc = PlanFrontmatterSchema.parse(parsed)
  const ids = new Set<string>()
  for (const t of doc.todos) {
    if (ids.has(t.id)) {
      throw new Error(`Duplicate todo id: ${t.id}`)
    }
    ids.add(t.id)
  }
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
