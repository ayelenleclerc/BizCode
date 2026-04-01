/**
 * Generates trilingual ISO controlled-document stubs from scripts/iso-doc-registry.mjs
 * Run: node scripts/generate-iso-controlled-docs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REGISTRY } from './iso-doc-registry.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DOCS = path.join(ROOT, 'docs')

const LEVEL_LABEL = {
  M: { en: 'Mandatory', es: 'Obligatorio', pt: 'Obrigatório' },
  HR: { en: 'Highly recommended', es: 'Muy recomendado', pt: 'Muito recomendado' },
  SA: { en: 'As applicable', es: 'Según alcance', pt: 'Conforme o escopo' },
  HE: { en: 'Highly expected', es: 'Muy esperado', pt: 'Muito esperado' },
}

const EVIDENCE_LABEL = {
  none: {
    en: 'Not evidenced (stub)',
    es: 'No evidenciado (stub)',
    pt: 'Não evidenciado (stub)',
  },
  partial: {
    en: 'Partial — see canonical links',
    es: 'Parcial — ver enlaces canónicos',
    pt: 'Parcial — ver links canônicos',
  },
}

const NORM_LABEL = {
  '9001': 'ISO 9001:2015',
  '27001': 'ISO/IEC 27001:2022',
  '20000': 'ISO/IEC 20000-1:2018',
  '42001': 'ISO/IEC 42001:2023',
  '27701': 'ISO/IEC 27701:2019',
  '29148': 'ISO/IEC/IEEE 29148 (requirements)',
  '29119': 'ISO/IEC/IEEE 29119 (testing)',
}

const HEADERS = {
  en: {
    purpose: 'Purpose',
    outOfScope: 'Out-of-scope statement',
    canonical: 'Canonical body (single source of truth)',
    revision: 'Revision history',
    summary: 'Summary of changes',
    initial: 'Initial stub',
    author: 'Author',
    version: 'Version',
    date: 'Date',
    docCode: 'Document code',
    reqLevel: 'Requirement level',
    normApp: 'Normative applicability',
    evStatus: 'Evidence status',
  },
  es: {
    purpose: 'Propósito',
    outOfScope: 'Declaración de fuera de alcance',
    canonical: 'Cuerpo canónico (fuente única de verdad)',
    revision: 'Historial de revisiones',
    summary: 'Resumen de cambios',
    initial: 'Stub inicial',
    author: 'Autor',
    version: 'Versión',
    date: 'Fecha',
    docCode: 'Código de documento',
    reqLevel: 'Nivel de requisito',
    normApp: 'Aplicabilidad normativa',
    evStatus: 'Estado de evidencia',
  },
  pt: {
    purpose: 'Propósito',
    outOfScope: 'Declaração fora do escopo',
    canonical: 'Corpo canônico (fonte única de verdade)',
    revision: 'Histórico de revisões',
    summary: 'Resumo das alterações',
    initial: 'Stub inicial',
    author: 'Autor',
    version: 'Versão',
    date: 'Data',
    docCode: 'Código do documento',
    reqLevel: 'Nível de requisito',
    normApp: 'Aplicabilidade normativa',
    evStatus: 'Estado de evidência',
  },
}

function expandNorms(codes) {
  return codes.map((c) => NORM_LABEL[c] || c).join('; ')
}

function renderStub(doc, locale) {
  const H = HEADERS[locale]
  const title = doc.titles[locale]
  const lvl = doc.level
  const levelText = LEVEL_LABEL[lvl][locale]
  const evKey = doc.evidence === 'partial' ? 'partial' : 'none'
  const evText = EVIDENCE_LABEL[evKey][locale]
  const norms = expandNorms(doc.norms)
  const canonical = doc.canonical || []
  let canonSection = ''
  if (canonical.length > 0) {
    const bullets = canonical.map((p) => `- [${path.basename(p)}](${p})`).join('\n')
    canonSection = `\n## ${H.canonical}\n\n${bullets}\n`
  }
  const outScope =
    locale === 'en'
      ? 'Complete when product or organizational scope is defined. Do not claim certification.'
      : locale === 'es'
        ? 'Completar cuando se defina el alcance del producto u organización. No afirmar certificación.'
        : 'Preencher quando o escopo do produto ou organização estiver definido. Não afirmar certificação.'

  return `# ${title}

| ${H.docCode} | ${doc.code} |
| ${H.version} | 0.1 |
| ${H.date} | 2026-04-01 |
| ${H.author} | BizCode |
| ${H.reqLevel} | ${levelText} |
| ${H.normApp} | ${norms} |
| ${H.evStatus} | ${evText} |

## ${H.outOfScope}

${outScope}

${canonSection}
## ${H.purpose}

<!-- Content to be completed -->

## ${H.revision}

| ${H.version} | ${H.date} | ${H.author} | ${H.summary} |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | ${H.initial} |
`
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
}

function main() {
  const locales = ['en', 'es', 'pt-br']
  for (const doc of REGISTRY) {
    for (const loc of locales) {
      const key = loc === 'pt-br' ? 'pt' : loc
      const rel = doc.files[key]
      const abs = path.join(DOCS, loc, rel)
      ensureDir(abs)
      const body = renderStub(doc, key)
      fs.writeFileSync(abs, body, 'utf8')
    }
  }
  console.log(`Wrote ${REGISTRY.length * 3} stub files (${REGISTRY.length} logical documents × 3 locales).`)
}

main()
