import {
  ALICUOTA_IVA_0,
  ALICUOTA_IVA_105,
  ALICUOTA_IVA_21,
  COD_DOC_CF,
  COD_DOC_CUIT,
  COD_MONEDA_PES,
  COD_OPERACION_NORMAL,
} from './libroIvaVentasConstants'

/**
 * @en Formats monetary amount: 2 decimals, dot separator, no thousands (#147 AC).
 * @es Formatea importe: 2 decimales, punto decimal, sin miles (#147 AC).
 * @pt-BR Formata valor: 2 decimais, ponto decimal, sem milhares (#147 AC).
 */
export function formatLibroIvaAmount(value: number): string {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

/**
 * @en Formats date as AAAAMMDD for RG 3685 TXT.
 * @es Formatea fecha como AAAAMMDD para TXT RG 3685.
 * @pt-BR Formata data como AAAAMMDD para TXT RG 3685.
 */
export function formatLibroIvaDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export function padPuntoVenta(prefijo: string): string {
  const digits = prefijo.replace(/\D/g, '')
  return digits.padStart(5, '0').slice(-5)
}

export function padNumeroComprobante(numero: number): string {
  return String(numero).padStart(20, '0')
}

export function normalizeBuyerName(name: string): string {
  return name.trim().slice(0, 30)
}

export function buyerDocFields(cuit: string | null | undefined): { codDoc: string; nroDoc: string } {
  const cleaned = (cuit ?? '').replace(/\D/g, '')
  if (cleaned.length === 11) {
    return { codDoc: COD_DOC_CUIT, nroDoc: cleaned.padStart(20, '0') }
  }
  return { codDoc: COD_DOC_CF, nroDoc: '0'.repeat(20) }
}

export type LibroIvaAlicuotaRow = {
  tipoComprobante: string
  puntoVenta: string
  numeroComprobante: string
  netoGravado: number
  alicuotaCode: string
  impuestoLiquidado: number
}

export type LibroIvaCbtvInput = {
  fecha: Date
  tipoComprobante: string
  puntoVenta: string
  numeroComprobante: string
  buyerName: string
  cuit: string | null | undefined
  importeTotal: number
  importeExento: number
  cantAlicuotas: number
}

/**
 * @en Builds one CBTV line (RG 3685 ventas — comma-separated, no header).
 * @es Arma una línea CBTV (RG 3685 ventas — comas, sin cabecera).
 * @pt-BR Monta uma linha CBTV (RG 3685 vendas — vírgulas, sem cabeçalho).
 */
export function buildCbtvLine(input: LibroIvaCbtvInput): string {
  const { codDoc, nroDoc } = buyerDocFields(input.cuit)
  const numero = padNumeroComprobante(Number.parseInt(input.numeroComprobante, 10) || 0)
  const zero = formatLibroIvaAmount(0)
  const fields = [
    formatLibroIvaDate(input.fecha),
    input.tipoComprobante.padStart(3, '0'),
    input.puntoVenta,
    numero,
    numero,
    codDoc,
    nroDoc,
    normalizeBuyerName(input.buyerName),
    formatLibroIvaAmount(input.importeTotal),
    zero,
    zero,
    formatLibroIvaAmount(input.importeExento),
    zero,
    zero,
    zero,
    zero,
    zero,
    COD_MONEDA_PES,
    '1.000000',
    String(Math.min(9, Math.max(0, input.cantAlicuotas))),
    COD_OPERACION_NORMAL,
    zero,
    '00000000',
  ]
  return fields.join(',')
}

/**
 * @en Builds one ALICUOTAS line for Libro IVA Ventas.
 * @es Arma una línea ALICUOTAS del Libro IVA Ventas.
 * @pt-BR Monta uma linha ALICUOTAS do Livro IVA Vendas.
 */
export function buildAlicuotaLine(row: LibroIvaAlicuotaRow): string {
  return [
    row.tipoComprobante.padStart(3, '0'),
    row.puntoVenta,
    padNumeroComprobante(Number.parseInt(row.numeroComprobante, 10) || 0),
    formatLibroIvaAmount(row.netoGravado),
    row.alicuotaCode,
    formatLibroIvaAmount(row.impuestoLiquidado),
  ].join(',')
}

export function alicuotaCodeForRate(neto: number, iva: number): string {
  if (neto === 0 && iva === 0) return ALICUOTA_IVA_0
  const rate = iva / neto
  if (Math.abs(rate - 0.21) < 0.001) return ALICUOTA_IVA_21
  if (Math.abs(rate - 0.105) < 0.001) return ALICUOTA_IVA_105
  return ALICUOTA_IVA_0
}
