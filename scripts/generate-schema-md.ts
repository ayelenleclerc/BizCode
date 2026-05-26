/**
 * @en Generate schema-md with a final pass on leaf schemas referenced by list envelopes.
 * @es Genera schema-md con repaso final en esquemas hoja referenciados por envelopes de lista.
 * @pt-BR Gera schema-md com passagem final em schemas folha referenciados por envelopes de lista.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCHEMA_DIR = path.join(ROOT, 'docs', 'generated', 'schema-json')
const OUT_DIR = path.join(ROOT, 'docs', 'generated', 'schema-md')
const STAMP_DIR = path.join(ROOT, 'docs', 'generated', '.schema-md-stamp')

/** Schemas whose markdown basename is overwritten when list envelopes are processed first on Linux CI. */
const LEAF_SCHEMAS_LAST = [
  'LogisticaChoferRow',
  'LogisticaZonaRow',
  'LogisticaKpis',
  'LogisticaReturnReasonRow',
] as const

function runJsonSchema2Md(inputDir: string, noReadme: boolean): void {
  const readmeFlag = noReadme ? ' -n' : ''
  execSync(`npx jsonschema2md -d "${inputDir}" -o "${OUT_DIR}" -x -${readmeFlag}`, {
    cwd: ROOT,
    stdio: 'inherit',
  })
}

function collectLocalSchemaRefs(fileName: string, into: Set<string>): void {
  if (into.has(fileName)) {
    return
  }
  const full = path.join(SCHEMA_DIR, fileName)
  if (!fs.existsSync(full)) {
    return
  }
  into.add(fileName)
  const raw = JSON.parse(fs.readFileSync(full, 'utf8')) as unknown
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== 'object') {
      return
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item)
      }
      return
    }
    const obj = value as Record<string, unknown>
    if (typeof obj.$ref === 'string' && obj.$ref.startsWith('./') && obj.$ref.endsWith('.schema.json')) {
      collectLocalSchemaRefs(obj.$ref.slice(2), into)
    }
    for (const key of Object.keys(obj)) {
      visit(obj[key])
    }
  }
  visit(raw)
}

function stampLeafSchema(name: string): void {
  const rootFile = `${name}.schema.json`
  if (!fs.existsSync(path.join(SCHEMA_DIR, rootFile))) {
    return
  }
  const files = new Set<string>()
  collectLocalSchemaRefs(rootFile, files)
  fs.mkdirSync(STAMP_DIR, { recursive: true })
  for (const f of fs.readdirSync(STAMP_DIR)) {
    fs.unlinkSync(path.join(STAMP_DIR, f))
  }
  for (const file of files) {
    fs.copyFileSync(path.join(SCHEMA_DIR, file), path.join(STAMP_DIR, file))
  }
  runJsonSchema2Md(STAMP_DIR, true)
  const slug = name.toLowerCase()
  for (const entry of fs.readdirSync(OUT_DIR)) {
    if (!entry.endsWith('.md') || !entry.startsWith(slug)) {
      continue
    }
    const mdPath = path.join(OUT_DIR, entry)
    const text = fs.readFileSync(mdPath, 'utf8').replaceAll('../.schema-md-stamp/', '../schema-json/')
    fs.writeFileSync(mdPath, text)
  }
}

function main(): void {
  runJsonSchema2Md(SCHEMA_DIR, false)
  for (const name of LEAF_SCHEMAS_LAST) {
    stampLeafSchema(name)
  }
  console.log('generate-schema-md: wrote docs/generated/schema-md/')
}

main()
