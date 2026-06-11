import {
  formatPresentationDate,
  normalizeCuitDigits,
  padFixedAmount,
  splitFixedWidthLine,
} from './fixedWidthFormat'
import { resolveSifereProvinciaCode } from './sifereProvinciaCodes'

export type SifereRetencionExportRow = {
  fecha: Date
  cuitRetenido: string
  provincia: string | null
  baseImponible: number
  alicuota: number
  importe: number
}

/** Field widths for SIFERE fixed-width line (#242). */
export const SIFERE_FIELD_LENGTHS = [3, 11, 8, 15, 8, 15] as const

export const SIFERE_FIELD_NAMES = [
  'provincia',
  'cuit',
  'fecha',
  'base',
  'alicuota',
  'importe',
] as const

/**
 * @en Fixed-width TXT for SIFERE IIBB export (#242).
 * @es TXT de ancho fijo para export SIFERE IIBB (#242).
 * @pt-BR TXT de largura fixa para exportação SIFERE IIBB (#242).
 */
export function buildSifereLine(row: SifereRetencionExportRow): string {
  return (
    resolveSifereProvinciaCode(row.provincia) +
    normalizeCuitDigits(row.cuitRetenido) +
    formatPresentationDate(row.fecha) +
    padFixedAmount(row.baseImponible, 15, 2) +
    padFixedAmount(row.alicuota, 8, 4) +
    padFixedAmount(row.importe, 15, 2)
  )
}

export function parseSifereLine(line: string): Record<(typeof SIFERE_FIELD_NAMES)[number], string> {
  const parts = splitFixedWidthLine(line, SIFERE_FIELD_LENGTHS)
  const result = {} as Record<(typeof SIFERE_FIELD_NAMES)[number], string>
  SIFERE_FIELD_NAMES.forEach((name, i) => {
    result[name] = parts[i] ?? ''
  })
  return result
}

/**
 * @en Builds SIFERE TXT excluding zero-import rows (#242).
 * @es Genera TXT SIFERE excluyendo filas con importe 0 (#242).
 * @pt-BR Gera TXT SIFERE excluindo linhas com importe 0 (#242).
 */
export function buildSifereRetencionesExport(rows: SifereRetencionExportRow[]): string {
  const lines = rows.filter((r) => r.importe !== 0).map((r) => buildSifereLine(r))
  return lines.join('\n')
}
