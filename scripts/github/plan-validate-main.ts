#!/usr/bin/env npx tsx
/**
 * @en Validate `.plan.md` files (fixtures + optional `.cursor/plans`) against repo labels; no GitHub token.
 * @es Valida archivos `.plan.md` contra etiquetas del repo; sin token de GitHub.
 * @pt-BR Valida arquivos `.plan.md` contra rótulos do repositório; sem token do GitHub.
 */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parsePlanFile } from './plan-sync/parse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function repoRootDefault(): string {
  return path.resolve(__dirname, '../..')
}

function collectPlanPaths(root: string, includeCursorPlans: boolean): string[] {
  const files: string[] = []
  const fixturesDir = path.join(root, 'tests', 'plan-sync', 'fixtures')
  if (existsSync(fixturesDir)) {
    for (const name of readdirSync(fixturesDir)) {
      if (name.startsWith('valid-') && name.endsWith('.plan.md')) {
        files.push(path.join(fixturesDir, name))
      }
    }
  }
  if (includeCursorPlans) {
    const cursorDir = path.join(root, '.cursor', 'plans')
    if (existsSync(cursorDir)) {
      for (const name of readdirSync(cursorDir)) {
        if (name.endsWith('.plan.md')) {
          files.push(path.join(cursorDir, name))
        }
      }
    }
  }
  return files.sort()
}

function usage(): string {
  return [
    'Usage: npm run plan:validate [-- --repo-root <dir>] [--with-cursor-plans]',
    '',
    'By default validates only:',
    '  - tests/plan-sync/fixtures/valid-*.plan.md',
    '',
    'Optional:',
    '  --with-cursor-plans  also validate .cursor/plans/*.plan.md (local Cursor copies)',
    '',
    'Uses .github/labels.json for label existence checks (same as plan:sync).',
  ].join('\n')
}

function parseArgs(argv: string[]): { repoRoot?: string; withCursorPlans: boolean } {
  let repoRoot: string | undefined
  let withCursorPlans = false
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      console.log(usage())
      process.exit(0)
    }
    if (a === '--repo-root') {
      repoRoot = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--with-cursor-plans') {
      withCursorPlans = true
    }
  }
  return { repoRoot, withCursorPlans }
}

function main(): void {
  const { repoRoot: rootArg, withCursorPlans } = parseArgs(process.argv.slice(2))
  const repoRoot = rootArg?.trim() ? path.resolve(rootArg.trim()) : repoRootDefault()
  const paths = collectPlanPaths(repoRoot, withCursorPlans)
  if (paths.length === 0) {
    console.log('plan:validate: no matching .plan.md files (skipped).')
    return
  }
  for (const p of paths) {
    parsePlanFile(p, { repoRoot })
    console.log(`plan:validate OK  ${path.relative(repoRoot, p)}`)
  }
}

main()
