/**
 * Uso puntual: npx tsx scripts/inspect-dbf.ts
 * Lista campos y 3 registros de LIST_CLI, PVAR y PVAR2.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DBFFile } from 'dbffile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SISTEMA = path.join(
  __dirname,
  '..',
  'Programa_Viejo',
  '16-07-2025 completa',
  'sistema'
)

/** Archivos presentes en la copia de Programa_Viejo analizada en la migración. */
const FILES = ['LIST_CLI.DBF', 'PVAR.DBF', 'PVAR2.DBF'] as const

async function main() {
  for (const name of FILES) {
    const filePath = path.join(SISTEMA, name)
    console.log('\n===', name, '===')
    try {
      const dbf = await DBFFile.open(filePath, {
        readMode: 'loose',
        encoding: 'cp437',
      })
      console.log('recordCount:', dbf.recordCount)
      for (const f of dbf.fields) {
        console.log(`  ${f.name} ${f.type} len=${f.size}${f.decimalPlaces != null ? ` dec=${f.decimalPlaces}` : ''}`)
      }
      const sample = await dbf.readRecords(5)
      console.log('sample:', JSON.stringify(sample, null, 2))
    } catch (e) {
      console.error(e)
    }
  }
}

main()
