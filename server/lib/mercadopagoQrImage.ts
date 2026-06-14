import QRCode from 'qrcode'

/**
 * @en Renders Mercado Pago QR payload as PNG base64 (#177).
 * @es Renderiza el payload QR de Mercado Pago como PNG base64 (#177).
 * @pt-BR Renderiza o payload QR do Mercado Pago como PNG base64 (#177).
 */
export async function mercadoPagoQrPayloadToBase64(qrData: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 280, errorCorrectionLevel: 'M' })
  const prefix = 'data:image/png;base64,'
  if (!dataUrl.startsWith(prefix)) {
    throw new Error('Invalid QR image data URL')
  }
  return dataUrl.slice(prefix.length)
}
