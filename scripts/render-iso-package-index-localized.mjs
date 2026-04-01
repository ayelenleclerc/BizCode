/**
 * Renders Spanish or Portuguese iso-package index tables (stdout).
 * Usage: node scripts/render-iso-package-index-localized.mjs es
 */
import { REGISTRY } from './iso-doc-registry.mjs'

const locale = process.argv[2] || 'es'
const key = locale === 'pt-br' || locale === 'pt' ? 'pt' : 'es'

const byFamily = {}
for (const d of REGISTRY) {
  if (!byFamily[d.family]) byFamily[d.family] = []
  byFamily[d.family].push(d)
}

const order = ['gov', 'rsk', 'sec', 'qlt', 'req', 'tst', 'arc', 'srv', 'hr', 'prv', 'ai', 'processes']
const titles = {
  es: {
    gov: 'GOV — Gobierno',
    rsk: 'RSK — Riesgos',
    sec: 'SEC — Seguridad de la información',
    qlt: 'QLT — Calidad / ciclo de vida del software',
    req: 'REQ — Requisitos',
    tst: 'TST — Pruebas',
    arc: 'ARC — Arquitectura / operación',
    srv: 'SRV — Gestión de servicios',
    hr: 'HR — Personas',
    prv: 'PRV — Privacidad',
    ai: 'AI — Inteligencia artificial',
    processes: 'PROC-MAN — Manuales de proceso',
  },
  pt: {
    gov: 'GOV — Governança',
    rsk: 'RSK — Riscos',
    sec: 'SEC — Segurança da informação',
    qlt: 'QLT — Qualidade / ciclo de vida do software',
    req: 'REQ — Requisitos',
    tst: 'TST — Testes',
    arc: 'ARC — Arquitetura / operação',
    srv: 'SRV — Gestão de serviços',
    hr: 'HR — Pessoas',
    prv: 'PRV — Privacidade',
    ai: 'AI — Inteligência artificial',
    processes: 'PROC-MAN — Manuais de processo',
  },
}[key]

const colDoc = key === 'es' ? 'Documento (es)' : 'Documento (pt-BR)'
const colCode = key === 'es' ? 'Código' : 'Código'
const colLvl = key === 'es' ? 'Nivel de requisito' : 'Nível de requisito'

for (const fam of order) {
  const list = byFamily[fam]
  if (!list) continue
  console.log(`\n## ${titles[fam]}\n`)
  console.log(`| ${colCode} | ${colDoc} | ${colLvl} |`)
  console.log('|------|-----------------|---------------------|')
  for (const d of list) {
    const rel = key === 'es' ? d.files.es : d.files.pt
    let href = rel
    if (href.startsWith('processes/')) href = `../${href}`
    else href = href.replace(/^certificacion-iso\//, '')
    const title = d.titles[key]
    console.log(`| ${d.code} | [${title}](${href}) | ${d.level} |`)
  }
}
