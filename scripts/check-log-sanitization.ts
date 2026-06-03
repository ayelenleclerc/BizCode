/**
 * @en Guardrail: flags risky console logging in scripts (PII/secrets); see docs log sanitization policy.
 * @es Guardrail: detecta console.log riesgoso en scripts; ver política de sanitización de logs.
 * @pt-BR Guardrail: detecta console.log arriscado em scripts; ver política de sanitização de logs.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** CLI migration/inspection tools may print legacy DBF samples to stdout (operator-only). */
const EXEMPT_REL_PATHS = new Set([
  'scripts/inspect-dbf.ts',
  'scripts/inspect-dbf-all.ts',
  'scripts/migrate-from-dbf.ts',
])

const CONSOLE_RE = /\bconsole\.(log|info|debug|warn|error)\s*\(/g

const FORBIDDEN_SNIPPETS = [
  'req.body',
  'req.headers',
  'authorization:',
  'password:',
  'token:',
  'privateKey:',
  'private_key:',
  'secret:',
  'session:',
  'cookie:',
  'apiKey:',
  'accessToken:',
  'refreshToken:',
  'creditCard:',
  'cardNumber:',
] as const

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
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      acc.push(full)
    }
  }
}

function rel(p: string): string {
  return path.relative(REPO_ROOT, p).split(path.sep).join('/')
}

function main(): void {
  const scriptsDir = path.join(REPO_ROOT, 'scripts')
  const files: string[] = []
  collectTsFiles(scriptsDir, files)

  const violations: string[] = []

  for (const file of files) {
    const r = rel(file)
    if (EXEMPT_REL_PATHS.has(r)) {
      continue
    }
    const content = readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!CONSOLE_RE.test(line)) {
        CONSOLE_RE.lastIndex = 0
        continue
      }
      CONSOLE_RE.lastIndex = 0
      const lower = line.toLowerCase()
      for (const snippet of FORBIDDEN_SNIPPETS) {
        if (lower.includes(snippet.toLowerCase())) {
          violations.push(`${r}:${i + 1}: forbidden snippet "${snippet}" in console call`)
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('check-log-sanitization: FAILED')
    for (const v of violations) {
      console.error(`  - ${v}`)
    }
    process.exit(1)
  }

  console.log(`check-log-sanitization: OK (${files.length} script files scanned, ${EXEMPT_REL_PATHS.size} exempt)`)
}

main()
