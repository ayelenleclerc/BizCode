import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  allLabelsForTodo,
  assertLabelsExist,
  heuristicExtraLabels,
  labelsForTodo,
  loadLabelCatalog,
  parsePlanFile,
  splitPlanFrontmatter,
} from '../../scripts/github/plan-sync/parse'
import type { PlanTodo } from '../../scripts/github/plan-sync/types'

const minimalFrontmatter = `name: Test plan
overview: Test overview
todos:
  - id: a1
    content: First task
    status: pending
`

function writeLabels(root: string): void {
  const labels = [
    { name: 'type:feature' },
    { name: 'type:bug' },
    { name: 'type:chore' },
    { name: 'priority:P1' },
    { name: 'priority:P2' },
    { name: 'area:platform' },
    { name: 'area:quality' },
    { name: 'needs-spec' },
    { name: 'needs-docs' },
    { name: 'needs-tests' },
  ]
  const dir = path.join(root, '.github')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'labels.json'), JSON.stringify(labels, null, 2), 'utf8')
}

describe('splitPlanFrontmatter', () => {
  it('splits valid frontmatter', () => {
    const raw = `---\n${minimalFrontmatter}---\n\nBody line`
    const { frontmatterYaml, body } = splitPlanFrontmatter(raw)
    expect(frontmatterYaml.trimStart().startsWith('name:')).toBe(true)
    expect(body.trim()).toBe('Body line')
  })

  it('rejects missing opening delimiter', () => {
    expect(() => splitPlanFrontmatter('no frontmatter')).toThrow(/start with YAML/)
  })

  it('rejects missing closing delimiter', () => {
    expect(() => splitPlanFrontmatter('---\nname: x\n')).toThrow(/closing ---/)
  })
})

describe('labelsForTodo', () => {
  it('uses type:chore when status is cancelled', () => {
    const todo: PlanTodo = {
      id: 'x',
      content: 'c',
      status: 'cancelled',
      meta: { type: 'feature', priority: 'P1', area: 'platform' },
    }
    expect(labelsForTodo(todo)).toEqual(['type:chore', 'priority:P1', 'area:platform'])
  })

  it('uses meta type when not cancelled', () => {
    const todo: PlanTodo = {
      id: 'x',
      content: 'c',
      status: 'pending',
      meta: { type: 'bug', priority: 'P2', area: 'quality' },
    }
    expect(labelsForTodo(todo)).toEqual(['type:bug', 'priority:P2', 'area:quality'])
  })
})

describe('heuristicExtraLabels / allLabelsForTodo', () => {
  it('adds needs-docs when text mentions documentation', () => {
    const todo: PlanTodo = { id: '1', content: 'Update OpenAPI contract', status: 'pending' }
    expect(heuristicExtraLabels(todo, '')).toContain('needs-docs')
    expect(allLabelsForTodo(todo, 'i18n keys')).toEqual([
      'type:feature',
      'priority:P1',
      'area:platform',
      'needs-docs',
    ])
  })

  it('adds needs-tests when text mentions testing', () => {
    const todo: PlanTodo = { id: '1', content: 'Add vitest coverage', status: 'pending' }
    expect(heuristicExtraLabels(todo, '')).toContain('needs-tests')
  })
})

describe('parsePlanFile', () => {
  const originals: string[] = []
  afterEach(() => {
    for (const d of originals) {
      try {
        rmSync(d, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    originals.length = 0
  })

  it('parses valid plan and validates labels against catalog', () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-plan-'))
    originals.push(tmp)
    writeLabels(tmp)
    const planFile = path.join(tmp, 'my.plan.md')
    writeFileSync(
      planFile,
      `---\n${minimalFrontmatter}---\n\n## Notes\nHello`,
      'utf8',
    )
    const { doc, body, planHash } = parsePlanFile(planFile, { repoRoot: tmp })
    expect(doc.name).toBe('Test plan')
    expect(doc.todos).toHaveLength(1)
    expect(doc.todos[0].id).toBe('a1')
    expect(body).toContain('Hello')
    expect(planHash.length).toBeGreaterThan(4)
  })

  it('throws on duplicate todo id', () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-plan-'))
    originals.push(tmp)
    writeLabels(tmp)
    const planFile = path.join(tmp, 'dup.plan.md')
    writeFileSync(
      planFile,
      `---
name: Dup
overview: ''
todos:
  - id: same
    content: One
    status: pending
  - id: same
    content: Two
    status: pending
---
`,
      'utf8',
    )
    expect(() => parsePlanFile(planFile, { repoRoot: tmp })).toThrow(/Duplicate todo id/)
  })

  it('throws when needs-spec is missing from catalog', () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-plan-'))
    originals.push(tmp)
    mkdirSync(path.join(tmp, '.github'), { recursive: true })
    writeFileSync(
      path.join(tmp, '.github', 'labels.json'),
      JSON.stringify([
        { name: 'type:feature' },
        { name: 'priority:P1' },
        { name: 'area:platform' },
      ]),
      'utf8',
    )
    const planFile = path.join(tmp, 'n.spec.plan.md')
    writeFileSync(planFile, `---\n${minimalFrontmatter}---\n`, 'utf8')
    expect(() => parsePlanFile(planFile, { repoRoot: tmp })).toThrow(/needs-spec/)
  })

  it('throws when label is missing from catalog', () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-plan-'))
    originals.push(tmp)
    mkdirSync(path.join(tmp, '.github'), { recursive: true })
    writeFileSync(
      path.join(tmp, '.github', 'labels.json'),
      JSON.stringify([{ name: 'type:feature' }, { name: 'needs-spec' }]),
      'utf8',
    )
    const planFile = path.join(tmp, 'x.plan.md')
    writeFileSync(planFile, `---\n${minimalFrontmatter}---\n`, 'utf8')
    expect(() => parsePlanFile(planFile, { repoRoot: tmp })).toThrow(/not defined in .github\/labels.json/)
  })
})

describe('assertLabelsExist', () => {
  it('passes when all labels exist', () => {
    const cat = new Set(['type:feature'])
    expect(() => assertLabelsExist(cat, ['type:feature'])).not.toThrow()
  })

  it('throws when a label is missing', () => {
    const cat = new Set(['type:feature'])
    expect(() => assertLabelsExist(cat, ['type:missing'])).toThrow(/type:missing/)
  })
})

describe('loadLabelCatalog', () => {
  it('loads names from labels.json', () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-lbl-'))
    writeLabels(tmp)
    const cat = loadLabelCatalog(tmp)
    expect(cat.has('type:feature')).toBe(true)
    rmSync(tmp, { recursive: true, force: true })
  })
})
