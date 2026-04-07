import { createHash } from 'node:crypto'
import { parse as parseYaml } from 'yaml'

import { PlanFrontmatterSchema, PlanTodoSchema, type PlanDocument, type PlanTodo } from './schemas'

/**
 * @en Split a Markdown plan file into YAML frontmatter (between first two `---`) and body.
 * @es Separa el plan Markdown en frontmatter YAML y cuerpo.
 * @pt-BR Separa o plano Markdown em frontmatter YAML e corpo.
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
  const meta = PlanTodoSchema.parse(todo).meta ?? {}
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

/**
 * @en Parse YAML frontmatter object into a validated `PlanDocument` (duplicate ids rejected).
 * @es Parsea el objeto YAML del frontmatter a `PlanDocument` (rechaza ids duplicados).
 * @pt-BR Faz parse do frontmatter YAML para `PlanDocument` (rejeita ids duplicados).
 */
export function parsePlanFrontmatterData(parsedYaml: unknown): PlanDocument {
  const doc = PlanFrontmatterSchema.parse(parsedYaml)
  const ids = new Set<string>()
  for (const t of doc.todos) {
    if (ids.has(t.id)) {
      throw new Error(`Duplicate todo id: ${t.id}`)
    }
    ids.add(t.id)
  }
  return doc
}

/**
 * @en Full parse of frontmatter YAML string to `PlanDocument`.
 * @es Parse completo del string YAML del frontmatter.
 * @pt-BR Parse completo da string YAML do frontmatter.
 */
export function parsePlanFrontmatterYaml(frontmatterYaml: string): PlanDocument {
  const parsed = parseYaml(frontmatterYaml) as unknown
  return parsePlanFrontmatterData(parsed)
}
