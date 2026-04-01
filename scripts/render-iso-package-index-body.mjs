import { REGISTRY } from './iso-doc-registry.mjs'

const byFamily = {}
for (const d of REGISTRY) {
  if (!byFamily[d.family]) byFamily[d.family] = []
  byFamily[d.family].push(d)
}

const order = ['gov', 'rsk', 'sec', 'qlt', 'req', 'tst', 'arc', 'srv', 'hr', 'prv', 'ai', 'processes']
const titles = {
  gov: 'GOV — Governance',
  rsk: 'RSK — Risk',
  sec: 'SEC — Information security',
  qlt: 'QLT — Quality / SDLC',
  req: 'REQ — Requirements',
  tst: 'TST — Testing',
  arc: 'ARC — Architecture / operations',
  srv: 'SRV — Service management',
  hr: 'HR — People',
  prv: 'PRV — Privacy',
  ai: 'AI — Artificial intelligence',
  processes: 'PROC-MAN — Process manuals',
}

for (const fam of order) {
  const list = byFamily[fam]
  if (!list) continue
  console.log(`\n## ${titles[fam]}\n`)
  console.log('| Code | Document (en) | Requirement level |')
  console.log('|------|-----------------|---------------------|')
  for (const d of list) {
    let rel = d.files.en
    if (rel.startsWith('processes/')) rel = `../${rel}`
    else rel = rel.replace(/^certificacion-iso\//, '')
    console.log(`| ${d.code} | [${d.titles.en}](${rel}) | ${d.level} |`)
  }
}
