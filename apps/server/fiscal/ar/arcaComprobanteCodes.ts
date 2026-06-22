import { TIPO_FACTURA_ARCA } from './libroIvaVentasConstants'

/**
 * @en Maps invoice letter to AFIP tipo comprobante numeric code (RG 3685 / FE QR).
 * @es Mapea letra de factura al código AFIP de tipo comprobante.
 * @pt-BR Mapeia letra da fatura para o código AFIP de tipo de comprovante.
 */
export function arcaTipoComprobanteFromLetter(tipo: string): number {
  const code = TIPO_FACTURA_ARCA[tipo.toUpperCase()]
  return code ? Number.parseInt(code, 10) : 0
}

const ARCA_TIPO_TO_LETTER: Readonly<Record<number, 'A' | 'B' | 'C'>> = {
  1: 'A',
  6: 'B',
  11: 'C',
}

/**
 * @en Maps AFIP tipo comprobante numeric code to invoice letter (FE QR decode).
 * @es Mapea código numérico AFIP a letra de comprobante (decodificación QR FE).
 * @pt-BR Mapeia código numérico AFIP para letra do comprovante (decodificação QR FE).
 */
export function arcaTipoComprobanteToLetter(tipoCmp: number): 'A' | 'B' | 'C' | null {
  return ARCA_TIPO_TO_LETTER[tipoCmp] ?? null
}

/**
 * @en Formats punto de venta as invoice prefix (4 digits).
 * @es Formatea punto de venta como prefijo de comprobante (4 dígitos).
 * @pt-BR Formata ponto de venda como prefixo do comprovante (4 dígitos).
 */
export function formatPrefijoFromPtoVta(ptoVta: number): string {
  if (!Number.isFinite(ptoVta) || ptoVta < 0) return '0000'
  return String(Math.trunc(ptoVta)).padStart(4, '0').slice(-4)
}

/**
 * @en Strips non-digits from CUIT for AFIP payloads.
 * @es Quita no dígitos del CUIT para payloads AFIP.
 * @pt-BR Remove não dígitos do CUIT para payloads AFIP.
 */
export function normalizeCuitDigits(cuit: string | null | undefined): string {
  return (cuit ?? '').replace(/\D/g, '')
}

/**
 * @en Parses punto de venta from invoice prefix (4–5 digits).
 * @es Obtiene punto de venta desde prefijo de factura.
 * @pt-BR Obtém ponto de venda a partir do prefixo da fatura.
 */
export function parsePuntoVentaFromPrefijo(prefijo: string): number {
  const digits = prefijo.replace(/\D/g, '')
  const n = Number.parseInt(digits, 10)
  return Number.isFinite(n) ? n : 0
}
