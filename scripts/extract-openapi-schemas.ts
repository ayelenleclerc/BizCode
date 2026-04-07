/**
 * Extracts `components.schemas` from `docs/api/openapi.yaml` into JSON Schema files
 * under `docs/generated/schema-json/` for `@adobe/jsonschema2md`. Rewrites
 * `#/components/schemas/X` refs to `./X.schema.json`.
 *
 * @en Writes deterministic JSON (sorted keys) for stable diffs in CI.
 * @es Escribe JSON determinista (claves ordenadas) para diffs estables en CI.
 * @pt-BR Grava JSON determinístico (chaves ordenadas) para diffs estáveis no CI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.join(ROOT, '..')
const OPENAPI_PATH = path.join(REPO, 'docs', 'api', 'openapi.yaml')
const OUT_DIR = path.join(REPO, 'docs', 'generated', 'schema-json')

const OPENAPI_REF_RE = /^#\/components\/schemas\/([^/]+)$/

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep)
  }
  const obj = value as Record<string, unknown>
  const sortedKeys = Object.keys(obj).sort()
  const out: Record<string, unknown> = {}
  for (const k of sortedKeys) {
    out[k] = sortKeysDeep(obj[k])
  }
  return out
}

function rewriteRefs(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(rewriteRefs)
  }
  const obj = value as Record<string, unknown>
  if (typeof obj.$ref === 'string') {
    const m = OPENAPI_REF_RE.exec(obj.$ref)
    if (m) {
      return { ...obj, $ref: `./${m[1]}.schema.json` }
    }
  }
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj).sort()) {
    out[k] = rewriteRefs(obj[k])
  }
  return out
}

function main(): void {
  const raw = fs.readFileSync(OPENAPI_PATH, 'utf-8')
  const doc = YAML.parse(raw) as {
    components?: { schemas?: Record<string, unknown> }
  }
  const schemas = doc.components?.schemas
  if (!schemas || typeof schemas !== 'object') {
    console.error('extract-openapi-schemas: no components.schemas in openapi.yaml')
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const f of fs.readdirSync(OUT_DIR)) {
    try {
      fs.unlinkSync(path.join(OUT_DIR, f))
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
        continue
      }
      throw e
    }
  }

  const names = Object.keys(schemas).sort()
  for (const name of names) {
    const body = rewriteRefs(schemas[name])
    const withMeta = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: name,
      ...((body as object) ?? {}),
    }
    const stable = sortKeysDeep(withMeta)
    const target = path.join(OUT_DIR, `${name}.schema.json`)
    fs.writeFileSync(target, `${JSON.stringify(stable, null, 2)}\n`, 'utf-8')
  }

  console.log(`extract-openapi-schemas: wrote ${names.length} files to docs/generated/schema-json/`)
}

main()
