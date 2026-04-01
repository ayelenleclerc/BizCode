/**
 * Verifies that every locale path linked from docs/DOCUMENT_LOCALE_MAP.md exists on disk.
 * Run: npx tsx scripts/check-docs-locale-map.ts
 * Exit code 1 if any path is missing.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MAP_FILE = path.join(ROOT, 'docs', 'DOCUMENT_LOCALE_MAP.md')

function main(): void {
  if (!fs.existsSync(MAP_FILE)) {
    console.error(`Missing map file: ${MAP_FILE}`)
    process.exit(1)
  }

  const text = fs.readFileSync(MAP_FILE, 'utf-8')
  const targets = new Set<string>()

  const linkRe = /\]\((en|es|pt-br)\/([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = linkRe.exec(text)) !== null) {
    const locale = m[1]
    const rel = m[2]
    targets.add(path.join(ROOT, 'docs', locale, rel))
  }

  const apiRe = /\]\(api\/([^)]+)\)/g
  while ((m = apiRe.exec(text)) !== null) {
    targets.add(path.join(ROOT, 'docs', 'api', m[1]))
  }

  const missing: string[] = []
  for (const abs of targets) {
    if (!fs.existsSync(abs)) {
      missing.push(path.relative(ROOT, abs))
    }
  }

  if (missing.length > 0) {
    console.error('DOCUMENT_LOCALE_MAP.md references missing files:')
    for (const p of missing.sort()) {
      console.error(`  - ${p}`)
    }
    process.exit(1)
  }

  console.log(`check-docs-locale-map: OK (${targets.size} paths)`)
}

main()
