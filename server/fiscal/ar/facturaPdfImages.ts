import bwipjs from 'bwip-js'
import { buildAfipBarcodePayload } from './afipBarcodePayload'
import { buildAfipQrUrl } from './afipQrPayload'
import type { AfipFacturaPdfInput } from './afipFiscalPdfTypes'

export type FacturaPdfImages = {
  barcodePng: Buffer | null
  qrPng: Buffer | null
}

/**
 * @en Renders AFIP barcode (I2of5) and QR images when CAE is issued.
 * @es Genera imágenes de código de barras I2of5 y QR AFIP con CAE emitido.
 * @pt-BR Gera imagens de código de barras I2of5 e QR AFIP com CAE emitido.
 */
export async function buildFacturaPdfImages(
  input: AfipFacturaPdfInput,
): Promise<FacturaPdfImages> {
  if (input.preview || !input.factura.cae || !input.factura.caeVto) {
    return { barcodePng: null, qrPng: null }
  }

  const barcodeText = buildAfipBarcodePayload({
    cuitEmisor: input.empresa.cuit,
    tipo: input.factura.tipo,
    prefijo: input.factura.prefijo,
    cae: input.factura.cae,
    caeVto: input.factura.caeVto,
  })

  const qrUrl = buildAfipQrUrl({
    fecha: input.factura.fecha,
    cuitEmisor: input.empresa.cuit,
    prefijo: input.factura.prefijo,
    tipo: input.factura.tipo,
    numero: input.factura.numero,
    importeTotal: input.factura.total,
    clienteCuit: input.factura.cliente?.cuit,
    cae: input.factura.cae,
  })

  const barcodePng = await renderBarcodePng(barcodeText)
  const qrPng = await renderQrPng(qrUrl)

  return { barcodePng, qrPng }
}

async function renderBarcodePng(text: string): Promise<Buffer | null> {
  try {
    return await bwipjs.toBuffer({
      bcid: 'interleaved2of5',
      text,
      scale: 2,
      height: 12,
      includetext: false,
    })
  } catch {
    return null
  }
}

async function renderQrPng(text: string): Promise<Buffer | null> {
  try {
    return await bwipjs.toBuffer({
      bcid: 'qrcode',
      text,
      scale: 3,
      includetext: false,
    })
  } catch {
    return null
  }
}
