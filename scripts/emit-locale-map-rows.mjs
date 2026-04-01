/**
 * Prints markdown table rows for docs/DOCUMENT_LOCALE_MAP.md from iso-doc-registry.mjs
 * Run: node scripts/emit-locale-map-rows.mjs
 */
import { REGISTRY } from './iso-doc-registry.mjs'

for (const d of REGISTRY) {
  const label = `${d.code} (${d.titles.en})`
  const en = d.files.en
  const es = d.files.es
  const pt = d.files.pt
  console.log(`| ${label} | [${en.split('/').pop()}](en/${en}) | [${es.split('/').pop()}](es/${es}) | [${pt.split('/').pop()}](pt-br/${pt}) |`)
}
