import jsQR from 'jsqr'
import sharp from 'sharp'
import type { ArcaQrJsonPayload } from '../fiscal/ar/arcaQrPayload'
import {
  extractArcaQrPayloadFromBuffer,
  parseArcaQrContent,
  type ArcaQrDecodeResult,
} from '../fiscal/ar/arcaQrDecode'
import { isDocumentoCompraImageFile } from '../lib/documentoCompraMedia'

export type DocumentoCompraTier1ExtractResult = ArcaQrDecodeResult

/**
 * @en Tier 1 — local AFIP/ARCA QR decode from PDF URL text or image scan (no portal API).
 * @es Tier 1 — decodificación local QR AFIP/ARCA desde URL en PDF o escaneo de imagen (sin API portal).
 * @pt-BR Tier 1 — decodificação local QR AFIP/ARCA de URL em PDF ou scan de imagem (sem API portal).
 */
export async function tryExtractDocumentoCompraTier1(
  buffer: Buffer,
  mimeType: string,
  tipoArchivo: string,
): Promise<DocumentoCompraTier1ExtractResult | null> {
  const fromBuffer = extractArcaQrPayloadFromBuffer(buffer)
  if (fromBuffer) {
    return { payload: fromBuffer, source: 'url_param' }
  }

  if (isDocumentoCompraImageFile(mimeType, tipoArchivo)) {
    const fromImage = await tryDecodeArcaQrFromImageBuffer(buffer)
    if (fromImage) {
      return { payload: fromImage, source: 'image_scan' }
    }
  }

  return null
}

async function tryDecodeArcaQrFromImageBuffer(buffer: Buffer): Promise<ArcaQrJsonPayload | null> {
  try {
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height)
    if (!code?.data) return null
    return parseArcaQrContent(code.data)
  } catch {
    return null
  }
}
