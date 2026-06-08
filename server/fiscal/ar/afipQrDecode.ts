import type { DocumentoCompraPreviewData } from '../../lib/documentoCompraTypes'
import { AFIP_FE_QR_BASE_URL, type AfipQrJsonPayload } from './afipQrPayload'
import {
  afipTipoComprobanteToLetter,
  formatPrefijoFromPtoVta,
  normalizeCuitDigits,
} from './afipComprobanteCodes'

/** @en Result of local AFIP/ARCA QR decode (no portal API call). */
export type AfipQrDecodeResult = {
  payload: AfipQrJsonPayload
  source: 'url_param' | 'image_scan'
}

const AFIP_QR_URL_RE =
  /https?:\/\/(?:www\.)?afip\.gob\.ar\/fe\/qr\/?\?p=([A-Za-z0-9_-]+)/i

/**
 * @en Decodes base64url `p` query param from AFIP FE QR (public spec; no ARCA API).
 * @es Decodifica parámetro `p` base64url del QR FE AFIP (especificación pública; sin API ARCA).
 * @pt-BR Decodifica parâmetro `p` base64url do QR FE AFIP (especificação pública; sem API ARCA).
 */
export function decodeAfipQrParam(encoded: string): AfipQrJsonPayload {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  const json = Buffer.from(`${normalized}${pad}`, 'base64').toString('utf8')
  const parsed = JSON.parse(json) as AfipQrJsonPayload
  if (parsed.ver !== 1) {
    throw new Error('Unsupported AFIP QR version')
  }
  return parsed
}

/**
 * @en Parses AFIP QR content from URL or raw base64url param.
 * @es Parsea contenido QR AFIP desde URL o parámetro base64url.
 * @pt-BR Analisa conteúdo QR AFIP a partir de URL ou parâmetro base64url.
 */
export function parseAfipQrContent(content: string): AfipQrJsonPayload | null {
  const trimmed = content.trim()
  if (trimmed.length === 0) return null

  const urlMatch = trimmed.match(AFIP_QR_URL_RE)
  if (urlMatch?.[1]) {
    try {
      return decodeAfipQrParam(urlMatch[1])
    } catch {
      return null
    }
  }

  if (trimmed.includes(AFIP_FE_QR_BASE_URL)) {
    const idx = trimmed.indexOf('?p=')
    if (idx >= 0) {
      const param = trimmed.slice(idx + 3).split(/[\s"'<>]/)[0]
      if (param) {
        try {
          return decodeAfipQrParam(param)
        } catch {
          return null
        }
      }
    }
  }

  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) {
    try {
      return decodeAfipQrParam(trimmed)
    } catch {
      return null
    }
  }

  return null
}

/**
 * @en Scans a buffer for an embedded AFIP QR URL (digital PDF text streams).
 * @es Busca URL QR AFIP embebida en buffer (PDF digital).
 * @pt-BR Varre buffer em busca de URL QR AFIP embutida (PDF digital).
 */
export function extractAfipQrPayloadFromBuffer(buffer: Buffer): AfipQrJsonPayload | null {
  const latin = buffer.toString('latin1')
  const match = latin.match(AFIP_QR_URL_RE)
  if (match?.[1]) {
    try {
      return decodeAfipQrParam(match[1])
    } catch {
      return null
    }
  }
  const idx = latin.indexOf('afip.gob.ar/fe/qr')
  if (idx >= 0) {
    const slice = latin.slice(idx, idx + 512)
    const paramMatch = slice.match(/\?p=([A-Za-z0-9_-]+)/)
    if (paramMatch?.[1]) {
      try {
        return decodeAfipQrParam(paramMatch[1])
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * @en Parses AFIP QR `fecha` (YYYYMMDD or YYYY-MM-DD) to ISO date-time noon UTC.
 * @es Parsea `fecha` del QR AFIP a ISO date-time mediodía UTC.
 * @pt-BR Converte `fecha` do QR AFIP para ISO date-time meio-dia UTC.
 */
export function parseAfipQrFechaToIso(fecha: string): string | null {
  const digits = fecha.replace(/\D/g, '')
  if (digits.length !== 8) return null
  const y = digits.slice(0, 4)
  const m = digits.slice(4, 6)
  const d = digits.slice(6, 8)
  const month = Number.parseInt(m, 10)
  const day = Number.parseInt(d, 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${y}-${m}-${d}T12:00:00.000Z`
}

function estimateVatFromTotal(
  tipo: 'A' | 'B' | 'C',
  total: number,
): Pick<DocumentoCompraPreviewData, 'neto1' | 'neto2' | 'neto3' | 'iva1' | 'iva2'> {
  if (tipo === 'C') {
    return { neto1: total, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }
  }
  if (tipo === 'B') {
    const neto = Math.round((total / 1.21) * 100) / 100
    const iva = Math.round((total - neto) * 100) / 100
    return { neto1: neto, neto2: 0, neto3: 0, iva1: iva, iva2: 0 }
  }
  return { neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }
}

/**
 * @en Maps decoded AFIP QR JSON to purchase document preview fields (local decode only).
 * @es Mapea JSON QR AFIP decodificado a campos de preview de compra (solo decodificación local).
 * @pt-BR Mapeia JSON QR AFIP decodificado para campos de preview de compra (somente decodificação local).
 */
export function mapAfipQrToDocumentoCompraPreview(
  payload: AfipQrJsonPayload,
  proveedorId: number | null,
): DocumentoCompraPreviewData {
  const tipo = afipTipoComprobanteToLetter(payload.tipoCmp)
  const total = Number(payload.importe)
  const amounts =
    tipo != null && Number.isFinite(total) && total > 0
      ? estimateVatFromTotal(tipo, total)
      : { neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }

  const caeDigits = String(payload.codAut ?? '').replace(/\D/g, '')
  const cae = caeDigits.length > 0 ? caeDigits.padStart(14, '0').slice(-14) : null

  const fechaIso = parseAfipQrFechaToIso(String(payload.fecha))

  const fieldConfidence: Record<string, number> = {
    tipo: tipo != null ? 1 : 0,
    prefijo: 1,
    numero: 1,
    fecha: fechaIso != null ? 1 : 0,
    total: Number.isFinite(total) && total > 0 ? 1 : 0,
    cae: cae != null ? 1 : 0,
    proveedorId: proveedorId != null ? 1 : 0,
    neto1: tipo === 'B' || tipo === 'C' ? 0.7 : 0.3,
    iva1: tipo === 'B' ? 0.7 : 0.3,
  }

  return {
    proveedorId,
    fecha: fechaIso,
    vencimiento: null,
    tipo,
    prefijo: formatPrefijoFromPtoVta(payload.ptoVta),
    numero: payload.nroCmp,
    ...amounts,
    total: Number.isFinite(total) ? total : null,
    cae,
    caeVto: null,
    items: [],
    fieldConfidence,
  }
}

/**
 * @en Emisor CUIT digits from QR payload (supplier on purchase invoices).
 * @es Dígitos CUIT emisor del payload QR (proveedor en facturas de compra).
 * @pt-BR Dígitos CUIT emissor do payload QR (fornecedor em faturas de compra).
 */
export function afipQrEmisorCuitDigits(payload: AfipQrJsonPayload): string {
  return normalizeCuitDigits(String(payload.cuit))
}
