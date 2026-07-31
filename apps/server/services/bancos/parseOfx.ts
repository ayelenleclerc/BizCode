/**
 * @en Minimal OFX/QFX statement transaction parser (#190).
 * @es Parser mínimo de transacciones OFX/QFX (#190).
 * @pt-BR Parser mínimo de transações OFX/QFX (#190).
 */
import type { ParsedMovimiento } from './types'

export type OfxParseResult =
  | { ok: true; movimientos: ParsedMovimiento[] }
  | { ok: false; error: string }

function tagValue(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i')
  const m = re.exec(block)
  return m ? m[1].trim() : null
}

function parseOfxDate(raw: string): Date | null {
  // YYYYMMDD or YYYYMMDDHHMMSS[...]
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(raw.trim())
  if (!m) return null
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return Number.isNaN(d.getTime()) ? null : d
}

export function parseOfxExtracto(text: string): OfxParseResult {
  const blocks = text.split(/<STMTTRN>/i).slice(1)
  if (blocks.length === 0) {
    return { ok: false, error: 'OFX has no STMTTRN transactions' }
  }

  const movimientos: ParsedMovimiento[] = []
  for (const rawBlock of blocks) {
    const block = rawBlock.split(/<\/STMTTRN>/i)[0] ?? rawBlock
    const dt = tagValue(block, 'DTPOSTED')
    const amt = tagValue(block, 'TRNAMT')
    const name = tagValue(block, 'NAME') ?? tagValue(block, 'MEMO') ?? 'OFX'
    const fitid = tagValue(block, 'FITID')
    if (!dt || !amt) continue
    const fecha = parseOfxDate(dt)
    const amount = Number.parseFloat(amt)
    if (!fecha || !Number.isFinite(amount)) continue
    const tipo = amount < 0 ? 'debito' : 'credito'
    movimientos.push({
      fecha,
      descripcion: name.slice(0, 255),
      importe: Math.abs(amount).toFixed(2),
      tipo,
      saldo: null,
      referencia: fitid?.slice(0, 80) ?? null,
    })
  }

  if (movimientos.length === 0) {
    return { ok: false, error: 'OFX contained no parseable transactions' }
  }
  return { ok: true, movimientos }
}
