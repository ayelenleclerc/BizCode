import { isDocumentoCompraImageFile, isDocumentoCompraPdfFile } from '../../lib/documentoCompraMedia'
import { preprocessDocumentoCompraImage } from './documentoCompraImagePreprocess'
import { runDocumentoCompraOcr } from './documentoCompraOcr'
import { extractPdfPlainText } from './documentoCompraPdfText'

/**
 * @en Collects plain text from a purchase document for Tier 4 LLM fallback (#277).
 * @es Recolecta texto plano del documento para fallback LLM Tier 4 (#277).
 * @pt-BR Coleta texto simples do documento para fallback LLM Tier 4 (#277).
 */
export async function collectDocumentoCompraRawText(
  buffer: Buffer,
  mimeType: string,
  tipoArchivo: string,
): Promise<string | null> {
  if (isDocumentoCompraPdfFile(mimeType, tipoArchivo)) {
    return extractPdfPlainText(buffer)
  }
  if (isDocumentoCompraImageFile(mimeType, tipoArchivo)) {
    try {
      const preprocessed = await preprocessDocumentoCompraImage(buffer)
      return runDocumentoCompraOcr(preprocessed)
    } catch {
      return null
    }
  }
  return null
}
