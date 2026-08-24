/**
 * @en Guardrail: fail if Prisma `$queryRawUnsafe` / `$executeRawUnsafe` appear under `apps/server`.
 * @es Guardrail: falla si aparecen `$queryRawUnsafe` / `$executeRawUnsafe` de Prisma bajo `apps/server`.
 * @pt-BR Guardrail: falha se `$queryRawUnsafe` / `$executeRawUnsafe` do Prisma aparecerem em `apps/server`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCAN_ROOT = path.join(REPO_ROOT, 'apps', 'server')

/** Matches Prisma unsafe raw APIs (string-concat SQL), not tagged `$queryRaw` / `$executeRaw`. */
const UNSAFE_RAW_RE = /\$queryRawUnsafe\b|\$executeRawUnsafe\b/g

function collectTsFiles(dir: string, acc: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'generated') {
        continue
      }
      collectTsFiles(full, acc)
      continue
    }
    if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      acc.push(full)
    }
  }
}

function rel(p: string): string {
  return path.relative(REPO_ROOT, p).split(path.sep).join('/')
}

function main(): void {
  if (!readdirSync(REPO_ROOT).includes('apps')) {
    console.error('Expected monorepo root with apps/; refuse to scan.')
    process.exit(2)
  }

  const files: string[] = []
  collectTsFiles(SCAN_ROOT, files)

  const violations: string[] = []

  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      UNSAFE_RAW_RE.lastIndex = 0
      if (!UNSAFE_RAW_RE.test(lines[i])) {
        continue
      }
      violations.push(`${rel(file)}:${i + 1}: ${lines[i].trim()}`)
    }
  }

  if (violations.length > 0) {
    console.error(
      'Forbidden Prisma unsafe raw SQL APIs under apps/server (use tagged $queryRaw / $executeRaw / Prisma.sql):',
    )
    for (const v of violations) {
      console.error(`  ${v}`)
    }
    process.exit(1)
  }

  console.log(`check-raw-sql: OK (${files.length} files under apps/server)`)
}

main()
