const IMAGE_MIME_PREFIXES = ['image/'] as const
const IMAGE_TIPO_ARCHIVOS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'])

/**
 * @en Whether the upload is an image suitable for OCR / QR scan (#277).
 * @es Si la subida es imagen apta para OCR / escaneo QR (#277).
 * @pt-BR Se o upload é imagem adequada para OCR / scan QR (#277).
 */
export function isDocumentoCompraImageFile(mimeType: string, tipoArchivo: string): boolean {
  const mime = mimeType.toLowerCase()
  if (IMAGE_MIME_PREFIXES.some((p) => mime.startsWith(p))) return true
  return IMAGE_TIPO_ARCHIVOS.has(tipoArchivo.toLowerCase())
}

/**
 * @en Whether the upload is a PDF (#277).
 * @es Si la subida es PDF (#277).
 * @pt-BR Se o upload é PDF (#277).
 */
export function isDocumentoCompraPdfFile(mimeType: string, tipoArchivo: string): boolean {
  return mimeType === 'application/pdf' || tipoArchivo === 'pdf'
}
