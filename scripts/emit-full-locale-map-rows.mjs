import { REGISTRY } from './iso-doc-registry.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const extra = [
  {
    label: 'Controlled document convention (META-CONVENTION-001)',
    en: 'certificacion-iso/controlled-document-convention.md',
    es: 'certificacion-iso/convencion-documentos-controlados.md',
    pt: 'certificacion-iso/convencao-documentos-controlados.md',
  },
  {
    label: 'Document register — normative traceability (QMS-DR-001)',
    en: 'certificacion-iso/document-register-traceability.md',
    es: 'certificacion-iso/registro-trazabilidad-documentos-normas.md',
    pt: 'certificacion-iso/registro-rastreabilidade-documentos-normas.md',
  },
  {
    label: 'Traceability between documents (QMS-D2D-001)',
    en: 'certificacion-iso/traceability-between-documents.md',
    es: 'certificacion-iso/trazabilidad-entre-documentos.md',
    pt: 'certificacion-iso/rastreabilidade-entre-documentos.md',
  },
  {
    label: 'Process manuals index',
    en: 'processes/index.md',
    es: 'processes/indice.md',
    pt: 'processes/indice.md',
  },
]

const lines = []
for (const d of REGISTRY) {
  const label = `${d.code} (${d.titles.en})`
  const en = d.files.en
  const es = d.files.es
  const pt = d.files.pt
  lines.push(
    `| ${label} | [${path.basename(en)}](en/${en}) | [${path.basename(es)}](es/${es}) | [${path.basename(pt)}](pt-br/${pt}) |`,
  )
}
for (const e of extra) {
  lines.push(
    `| ${e.label} | [${path.basename(e.en)}](en/${e.en}) | [${path.basename(e.es)}](es/${e.es}) | [${path.basename(e.pt)}](pt-br/${e.pt}) |`,
  )
}
fs.writeFileSync(path.join(ROOT, 'scripts', '_DOCUMENT_LOCALE_MAP_INSERT_ROWS.md'), lines.join('\n') + '\n')
console.log(`Wrote ${lines.length} rows to scripts/_DOCUMENT_LOCALE_MAP_INSERT_ROWS.md`)
