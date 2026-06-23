/**
 * @en Shared fixed-width field helpers for AFIP/COMARB TXT exports (#242).
 * @es Helpers de campos de ancho fijo para export TXT AFIP/COMARB (#242).
 * @pt-BR Helpers de campos de largura fixa para export TXT AFIP/COMARB (#242).
 */

/** @en Pads monetary amount as width.decimals (dot decimal, zero-padded left). */
export function padFixedAmount(value: number, width: number, decimals: number): string {
  if (!Number.isFinite(value)) {
    return '0'.repeat(width - decimals - 1) + '.' + '0'.repeat(decimals)
  }
  const formatted = value.toFixed(decimals)
  return formatted.padStart(width, '0').slice(-width)
}

/** @en Formats date as DDMMAAAA for SICORE/SIFERE presentation files. */
export function formatPresentationDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = String(date.getFullYear())
  return `${d}${m}${y}`
}

/** @en Normalizes CUIT to 11 numeric digits. */
export function normalizeCuitDigits(cuit: string): string {
  return cuit.replace(/\D/g, '').padStart(11, '0').slice(-11)
}

/** @en Left-aligns text, truncates or pads with spaces to fixed width. */
export function padFixedText(value: string, width: number): string {
  const normalized = value.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()
  if (normalized.length >= width) return normalized.slice(0, width)
  return normalized.padEnd(width, ' ')
}

/** @en Splits a fixed-width line into sequential field slices. */
export function splitFixedWidthLine(line: string, lengths: readonly number[]): string[] {
  const parts: string[] = []
  let offset = 0
  for (const len of lengths) {
    parts.push(line.slice(offset, offset + len))
    offset += len
  }
  return parts
}
