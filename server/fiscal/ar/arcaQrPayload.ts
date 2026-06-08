import { buyerDocFields, formatLibroIvaDate } from './libroIvaVentasFormat'
import { arcaTipoComprobanteFromLetter, normalizeCuitDigits, parsePuntoVentaFromPrefijo } from './arcaComprobanteCodes'

/** @en AFIP FE public QR base URL (verification portal). */
export const ARCA_FE_QR_BASE_URL = 'https://www.afip.gob.ar/fe/qr/'

export type ArcaQrJsonPayload = {
  ver: number
  fecha: string
  cuit: number
  ptoVta: number
  tipoCmp: number
  nroCmp: number
  importe: number
  moneda: string
  ctz: number
  tipoDocRec: number
  nroDocRec: number
  tipoCodAut: string
  codAut: number
}

export type ArcaQrBuildInput = {
  fecha: Date
  cuitEmisor: string
  prefijo: string
  tipo: string
  numero: number
  importeTotal: number
  clienteCuit: string | null | undefined
  cae: string
}

/**
 * @en Builds AFIP FE QR JSON (public spec; manual portal validation pending per ADR-0014).
 * @es Arma JSON del QR FE AFIP (especificación pública; validación manual pendiente ADR-0014).
 * @pt-BR Monta JSON do QR FE AFIP (especificação pública; validação manual pendente ADR-0014).
 */
export function buildArcaQrJsonPayload(input: ArcaQrBuildInput): ArcaQrJsonPayload {
  const cuitDigits = normalizeCuitDigits(input.cuitEmisor)
  const { codDoc, nroDoc } = buyerDocFields(input.clienteCuit)
  const caeDigits = input.cae.replace(/\D/g, '')

  return {
    ver: 1,
    fecha: formatLibroIvaDate(input.fecha),
    cuit: Number.parseInt(cuitDigits, 10) || 0,
    ptoVta: parsePuntoVentaFromPrefijo(input.prefijo),
    tipoCmp: arcaTipoComprobanteFromLetter(input.tipo),
    nroCmp: input.numero,
    importe: Number(input.importeTotal.toFixed(2)),
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: Number.parseInt(codDoc, 10) || 99,
    nroDocRec: Number.parseInt(nroDoc, 10) || 0,
    tipoCodAut: 'E',
    codAut: Number.parseInt(caeDigits, 10) || 0,
  }
}

/**
 * @en Base64url-encoded query param for AFIP QR URL.
 * @es Parámetro `p` codificado en base64url para URL QR AFIP.
 * @pt-BR Parâmetro `p` em base64url para URL QR AFIP.
 */
export function encodeArcaQrParam(payload: ArcaQrJsonPayload): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/**
 * @en Full AFIP verification QR URL.
 * @es URL completa de verificación QR AFIP.
 * @pt-BR URL completa de verificação QR AFIP.
 */
export function buildArcaQrUrl(input: ArcaQrBuildInput): string {
  const payload = buildArcaQrJsonPayload(input)
  return `${ARCA_FE_QR_BASE_URL}?p=${encodeArcaQrParam(payload)}`
}
