/**
 * @en Minimal MT940 statement line parser (#190).
 * @es Parser mínimo de líneas MT940 (#190).
 * @pt-BR Parser mínimo de linhas MT940 (#190).
 */
import type { ParsedMovimiento } from './types'

export type Mt940ParseResult =
  | { ok: true; movimientos: ParsedMovimiento[] }
  | { ok: false; error: string }

function parseYyMmDd(raw: string): Date | null {
  const m = /^(\d{2})(\d{2})(\d{2})/.exec(raw)
  if (!m) return null
  const yy = Number(m[1])
  const year = yy >= 70 ? 1900 + yy : 2000 + yy
  const d = new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[3])))
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * @en Parses :61: value date / entry date / D|C / amount
 * @es Parsea :61: fecha valor / fecha asiento / D|C / importe
 * @pt-BR Faz parse de :61: data valor / data lançamento / D|C / valor
 */
function parseField61(line: string): Omit<ParsedMovimiento, 'descripcion'> | null {
  // Example: 2401150115D1234,56NTRFNONREF
  const body = line.replace(/^:61:/, '').trim()
  const m = /^(\d{6})(\d{4})?([CD])([A-Z]?)(\d+[,.]?\d*)/i.exec(body)
  if (!m) return null
  const fecha = parseYyMmDd(m[1])
  if (!fecha) return null
  const tipo = m[3].toUpperCase() === 'D' ? 'debito' : 'credito'
  const amount = Number.parseFloat(m[5].replace(',', '.'))
  if (!Number.isFinite(amount)) return null
  const refMatch = /\/\/([^\s]+)/.exec(body) ?? /N[A-Z]{3}(.+)$/i.exec(body)
  const referencia = refMatch?.[1]?.slice(0, 80) ?? null
  return {
    fecha,
    importe: Math.abs(amount).toFixed(2),
    tipo,
    saldo: null,
    referencia,
  }
}

export function parseMt940Extracto(text: string): Mt940ParseResult {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const movimientos: ParsedMovimiento[] = []
  let pending: Omit<ParsedMovimiento, 'descripcion'> | null = null

  for (const line of lines) {
    if (line.startsWith(':61:')) {
      if (pending) {
        movimientos.push({ ...pending, descripcion: 'MT940' })
      }
      pending = parseField61(line)
      continue
    }
    if (line.startsWith(':86:') && pending) {
      const desc = line.replace(/^:86:/, '').trim().slice(0, 255) || 'MT940'
      movimientos.push({ ...pending, descripcion: desc })
      pending = null
    }
  }
  if (pending) {
    movimientos.push({ ...pending, descripcion: 'MT940' })
  }

  if (movimientos.length === 0) {
    return { ok: false, error: 'MT940 contained no :61: transactions' }
  }
  return { ok: true, movimientos }
}
