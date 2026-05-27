import { TIPO_FACTURA_AFIP } from './libroIvaVentasConstants'

/**
 * @en Maps invoice letter to AFIP tipo comprobante numeric code (RG 3685 / FE QR).
 * @es Mapea letra de factura al código AFIP de tipo comprobante.
 * @pt-BR Mapeia letra da fatura para o código AFIP de tipo de comprovante.
 */
export function afipTipoComprobanteFromLetter(tipo: string): number {
  const code = TIPO_FACTURA_AFIP[tipo.toUpperCase()]
  return code ? Number.parseInt(code, 10) : 0
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
