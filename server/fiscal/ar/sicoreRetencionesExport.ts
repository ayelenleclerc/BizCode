import {
  formatPresentationDate,
  normalizeCuitDigits,
  padFixedAmount,
  padFixedText,
  splitFixedWidthLine,
} from './fixedWidthFormat'
import {
  resolveSicoreImpuestoCode,
  resolveSicoreOperacionCode,
  resolveSicoreRegimenCode,
} from './sicoreRegimenCodes'

export type SicoreRetencionExportRow = {
  fecha: Date
  cuitRetenido: string
  denominacion: string
  regimenTipo: string
  regimenNombre?: string
  operacionTipo: 'retencion' | 'percepcion'
  baseImponible: number
  importe: number
}

/** Field widths for SICORE fixed-width line (#242). */
export const SICORE_FIELD_LENGTHS = [3, 3, 1, 8, 11, 30, 15, 15] as const

export const SICORE_FIELD_NAMES = [
  'impuesto',
  'regimen',
  'operacion',
  'fecha',
  'cuit',
  'denominacion',
  'base',
  'importe',
] as const

/**
 * @en Fixed-width TXT for SICORE withholding/perception export (#242).
 * @es TXT de ancho fijo para export SICORE (#242).
 * @pt-BR TXT de largura fixa para exportação SICORE (#242).
 */
export function buildSicoreLine(row: SicoreRetencionExportRow): string {
  const impuesto = resolveSicoreImpuestoCode(row.regimenTipo)
  const regimen = resolveSicoreRegimenCode(row.regimenTipo, row.regimenNombre)
  const operacion = resolveSicoreOperacionCode(row.operacionTipo)
  return (
    impuesto +
    regimen +
    operacion +
    formatPresentationDate(row.fecha) +
    normalizeCuitDigits(row.cuitRetenido) +
    padFixedText(row.denominacion, 30) +
    padFixedAmount(row.baseImponible, 15, 2) +
    padFixedAmount(row.importe, 15, 2)
  )
}

export function parseSicoreLine(line: string): Record<(typeof SICORE_FIELD_NAMES)[number], string> {
  const parts = splitFixedWidthLine(line, SICORE_FIELD_LENGTHS)
  const result = {} as Record<(typeof SICORE_FIELD_NAMES)[number], string>
  SICORE_FIELD_NAMES.forEach((name, i) => {
    result[name] = parts[i] ?? ''
  })
  return result
}

/**
 * @en Builds SICORE TXT excluding zero-import rows (#242).
 * @es Genera TXT SICORE excluyendo filas con importe 0 (#242).
 * @pt-BR Gera TXT SICORE excluindo linhas com importe 0 (#242).
 */
export function buildSicoreRetencionesExport(rows: SicoreRetencionExportRow[]): string {
  const lines = rows.filter((r) => r.importe !== 0).map((r) => buildSicoreLine(r))
  return lines.join('\n')
}
