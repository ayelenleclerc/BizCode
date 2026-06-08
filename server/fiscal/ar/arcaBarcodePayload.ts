import { formatLibroIvaDate } from './libroIvaVentasFormat'
import { arcaTipoComprobanteFromLetter, normalizeCuitDigits, parsePuntoVentaFromPrefijo } from './arcaComprobanteCodes'

export type ArcaBarcodeBuildInput = {
  cuitEmisor: string
  tipo: string
  prefijo: string
  cae: string
  caeVto: Date
}

/**
 * @en Builds Interleaved 2 of 5 payload for AFIP electronic invoice barcode (39 digits).
 * @es Arma payload I2of5 para código de barras de comprobante electrónico AFIP (39 dígitos).
 * @pt-BR Monta payload I2of5 para código de barras de comprovante eletrônico AFIP (39 dígitos).
 *
 * Structure (public AFIP practice, aligned with FE QR fields): CUIT(11) + tipoCmp(2) + ptoVta(4) + CAE(14) + vtoCAE(8).
 * Manual AFIP portal validation pending (ADR-0014).
 */
export function buildArcaBarcodePayload(input: ArcaBarcodeBuildInput): string {
  const cuit = normalizeCuitDigits(input.cuitEmisor).padStart(11, '0').slice(-11)
  const tipo = String(arcaTipoComprobanteFromLetter(input.tipo)).padStart(2, '0').slice(-2)
  const ptoVta = String(parsePuntoVentaFromPrefijo(input.prefijo)).padStart(4, '0').slice(-4)
  const cae = input.cae.replace(/\D/g, '').padStart(14, '0').slice(-14)
  const vto = formatLibroIvaDate(input.caeVto)
  return `${cuit}${tipo}${ptoVta}${cae}${vto}`
}
