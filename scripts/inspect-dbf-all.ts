/**
 * Barrido de todos los `.DBF` bajo `Programa_Viejo/…/sistema/` (o `PROGRAMA_VIEJO_ROOT`).
 * Uso: npm run inspect:dbf-all -- [opciones]
 *
 * Documentación: docs/referencias/12-trazabilidad-scripts-herramientas.md
 */
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DBFFile } from 'dbffile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function programaViejoRoot(): string {
  const fallback = path.join(__dirname, '..', 'Programa_Viejo')
  const fromEnv = process.env.PROGRAMA_VIEJO_ROOT?.trim()
  if (!fromEnv) return fallback
  return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv)
}

const SISTEMA = path.join(programaViejoRoot(), '16-07-2025 completa', 'sistema')

const ENCODING = 'cp437' as const

type OutputFormat = 'text' | 'markdown' | 'json'

function parseArgs(argv: string[]): {
  format: OutputFormat
  sample: number
  maxFiles: number | null
} {
  let format: OutputFormat = 'text'
  let sample = 3
  let maxFiles: number | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--format' && argv[i + 1]) {
      const v = argv[++i] as OutputFormat
      if (v === 'text' || v === 'markdown' || v === 'json') format = v
    } else if (a === '--sample' && argv[i + 1]) {
      sample = Math.max(0, parseInt(argv[++i], 10) || 0)
    } else if (a === '--max-files' && argv[i + 1]) {
      maxFiles = Math.max(1, parseInt(argv[++i], 10) || 1)
    } else if (a === '--help' || a === '-h') {
      console.log(`Uso: npx tsx scripts/inspect-dbf-all.ts [--format text|markdown|json] [--sample N] [--max-files N]

Recorre todos los .DBF en:
  ${SISTEMA}

Variable de entorno: PROGRAMA_VIEJO_ROOT (raíz de la copia del legado).
`)
      process.exit(0)
    }
  }
  return { format, sample, maxFiles }
}

async function main() {
  const { format, sample, maxFiles } = parseArgs(process.argv.slice(2))

  let names: string[]
  try {
    const all = await fs.readdir(SISTEMA)
    names = all.filter((f) => f.toLowerCase().endsWith('.dbf')).sort((a, b) => a.localeCompare(b))
  } catch (e) {
    console.error(`[inspect-dbf-all] No se puede leer la carpeta sistema:\n  ${SISTEMA}\n`, e)
    process.exit(1)
  }

  const limited = maxFiles != null ? names.slice(0, maxFiles) : names

  const rows: {
    name: string
    recordCount: number
    size: number
    fields: { name: string; type: string; size: number; dec?: number }[]
    sample: Record<string, unknown>[]
    error?: string
  }[] = []

  for (const name of limited) {
    const filePath = path.join(SISTEMA, name)
    let size = 0
    try {
      const st = await fs.stat(filePath)
      size = st.size
    } catch {
      size = 0
    }
    try {
      const dbf = await DBFFile.open(filePath, { readMode: 'loose', encoding: ENCODING })
      const fields = dbf.fields.map((f) => ({
        name: f.name,
        type: String(f.type),
        size: f.size,
        ...(f.decimalPlaces != null ? { dec: f.decimalPlaces } : {}),
      }))
      const sampleRows =
        sample > 0 && dbf.recordCount > 0 ? await dbf.readRecords(Math.min(sample, dbf.recordCount)) : []
      rows.push({
        name,
        recordCount: dbf.recordCount,
        size,
        fields,
        sample: sampleRows as Record<string, unknown>[],
      })
    } catch (err: unknown) {
      rows.push({
        name,
        recordCount: -1,
        size,
        fields: [],
        sample: [],
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (format === 'json') {
    console.log(JSON.stringify({ sistema: SISTEMA, count: rows.length, files: rows }, null, 2))
    return
  }

  if (format === 'markdown') {
    console.log(`## Inventario DBF\n`)
    console.log(`- **Carpeta:** \`${SISTEMA}\``)
    console.log(`- **Archivos listados:** ${rows.length}\n`)
    console.log('| Archivo | Registros | Tamaño (bytes) | Grupo | Estado análisis |')
    console.log('|---------|-----------|----------------|-------|-----------------|')
    for (const r of rows) {
      const rc = r.error != null ? `ERROR` : String(r.recordCount)
      console.log(`| ${r.name} | ${rc} | ${r.size} | *(asignar)* | pendiente |`)
    }
    console.log('')
    for (const r of rows) {
      console.log(`### ${r.name}\n`)
      if (r.error) {
        console.log(`**Error:** ${r.error}\n`)
        continue
      }
      console.log(`- recordCount: ${r.recordCount}`)
      console.log(`- campos:`)
      for (const f of r.fields) {
        const dec = f.dec != null ? ` dec=${f.dec}` : ''
        console.log(`  - \`${f.name}\` ${f.type} len=${f.size}${dec}`)
      }
      if (r.sample.length > 0) {
        console.log(`- muestra:`)
        console.log('```json')
        console.log(JSON.stringify(r.sample, null, 2))
        console.log('```')
      }
      console.log('')
    }
    return
  }

  // text
  console.log(`[inspect-dbf-all] Carpeta: ${SISTEMA}`)
  console.log(`[inspect-dbf-all] Archivos .DBF: ${rows.length}\n`)
  for (const r of rows) {
    console.log(`=== ${r.name} ===`)
    if (r.error) {
      console.log('ERROR:', r.error)
      console.log('')
      continue
    }
    console.log('size:', r.size)
    console.log('recordCount:', r.recordCount)
    for (const f of r.fields) {
      const dec = f.dec != null ? ` dec=${f.dec}` : ''
      console.log(`  ${f.name} ${f.type} len=${f.size}${dec}`)
    }
    if (r.sample.length > 0) {
      console.log('sample:', JSON.stringify(r.sample, null, 2))
    }
    console.log('')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
