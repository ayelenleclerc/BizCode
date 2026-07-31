/**
 * @en Parse bank CSV using a configurable column mapping (#190).
 * @es Parsea CSV bancario con mapeo de columnas configurable (#190).
 * @pt-BR Faz parse de CSV bancário com mapeamento configurável (#190).
 */
import { parse } from 'csv-parse/sync'
import type { ParsedMovimiento } from './types'

export type CsvMappingLike = {
  columnaFecha: string
  columnaDescripcion: string
  columnaImporte: string
  columnaReferencia: string | null
  columnaSaldo: string | null
  separadorDecimal: string
  formatoFecha: string
  delimiter: string
  signoDebitoCredito: string
}

export type CsvParseResult =
  | { ok: true; movimientos: ParsedMovimiento[]; errors: Array<{ row: number; message: string }> }
  | { ok: false; error: string }

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function parseImporte(raw: string, separadorDecimal: string): number | null {
  let s = raw.trim().replace(/\s/g, '')
  if (!s) return null
  if (separadorDecimal === ',') {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    s = s.replace(/,/g, '')
  }
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : null
}

function parseFecha(raw: string, formato: string): Date | null {
  const s = raw.trim()
  if (!s) return null
  let day: number
  let month: number
  let year: number
  if (formato === 'yyyy-MM-dd') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
    if (!m) return null
    year = Number(m[1])
    month = Number(m[2])
    day = Number(m[3])
  } else if (formato === 'dd-MM-yyyy') {
    const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s)
    if (!m) return null
    day = Number(m[1])
    month = Number(m[2])
    year = Number(m[3])
  } else {
    // dd/MM/yyyy
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
    if (!m) return null
    day = Number(m[1])
    month = Number(m[2])
    year = Number(m[3])
  }
  const d = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(d.getTime())) return null
  return d
}

function resolveTipo(
  amount: number,
  mapping: CsvMappingLike,
  row: Record<string, string>,
): 'debito' | 'credito' {
  if (mapping.signoDebitoCredito === 'credit_positive') {
    return amount >= 0 ? 'credito' : 'debito'
  }
  if (mapping.signoDebitoCredito === 'tipo_column') {
    const tipoRaw = (row['Tipo'] ?? row['tipo'] ?? row['Debito/Credito'] ?? '').toLowerCase()
    if (tipoRaw.includes('cred') || tipoRaw.includes('haber')) return 'credito'
    if (tipoRaw.includes('deb') || tipoRaw.includes('debe')) return 'debito'
  }
  // signed_importe: negative = debito, positive = credito
  return amount < 0 ? 'debito' : 'credito'
}

export function parseCsvExtracto(text: string, mapping: CsvMappingLike): CsvParseResult {
  try {
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      delimiter: mapping.delimiter || ';',
      relax_column_count: true,
    }) as Record<string, string>[]

    if (records.length === 0) {
      return { ok: false, error: 'CSV has no data rows' }
    }

    const headers = Object.keys(records[0] ?? {}).map(normalizeHeader)
    const need = [
      mapping.columnaFecha,
      mapping.columnaDescripcion,
      mapping.columnaImporte,
    ].map(normalizeHeader)
    for (const h of need) {
      if (!headers.includes(h)) {
        return {
          ok: false,
          error: `CSV missing required column "${h}" (found: ${headers.join(', ')})`,
        }
      }
    }

    const byNorm = (row: Record<string, string>, col: string): string => {
      const target = normalizeHeader(col)
      for (const [k, v] of Object.entries(row)) {
        if (normalizeHeader(k) === target) return String(v ?? '')
      }
      return ''
    }

    const movimientos: ParsedMovimiento[] = []
    const errors: Array<{ row: number; message: string }> = []

    records.forEach((row, idx) => {
      const rowNum = idx + 2
      const fechaRaw = byNorm(row, mapping.columnaFecha)
      const desc = byNorm(row, mapping.columnaDescripcion).slice(0, 255)
      const importeRaw = byNorm(row, mapping.columnaImporte)
      const ref =
        mapping.columnaReferencia != null
          ? byNorm(row, mapping.columnaReferencia).slice(0, 80) || null
          : null
      const saldoRaw =
        mapping.columnaSaldo != null ? byNorm(row, mapping.columnaSaldo) : ''

      const fecha = parseFecha(fechaRaw, mapping.formatoFecha)
      if (!fecha) {
        errors.push({ row: rowNum, message: `Invalid date: ${fechaRaw}` })
        return
      }
      const amount = parseImporte(importeRaw, mapping.separadorDecimal)
      if (amount == null) {
        errors.push({ row: rowNum, message: `Invalid amount: ${importeRaw}` })
        return
      }
      if (!desc) {
        errors.push({ row: rowNum, message: 'Empty description' })
        return
      }

      const tipo = resolveTipo(amount, mapping, row)
      const abs = Math.abs(amount)
      let saldo: string | null = null
      if (saldoRaw) {
        const s = parseImporte(saldoRaw, mapping.separadorDecimal)
        if (s != null) saldo = s.toFixed(2)
      }

      movimientos.push({
        fecha,
        descripcion: desc,
        importe: abs.toFixed(2),
        tipo,
        saldo,
        referencia: ref,
      })
    })

    return { ok: true, movimientos, errors }
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
