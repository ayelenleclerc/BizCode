import { createWorker } from 'tesseract.js'

/** @en OCR languages for purchase documents (#277 Fase G): Spanish, English, Portuguese. */
export const DOCUMENTO_COMPRA_OCR_LANG = 'spa+eng+por'

/**
 * @en Runs local Tesseract OCR on a preprocessed image buffer (#277 Tier 3).
 * @es Ejecuta OCR Tesseract local sobre imagen preprocesada (#277 Tier 3).
 * @pt-BR Executa OCR Tesseract local em buffer de imagem pré-processada (#277 Tier 3).
 */
export async function runDocumentoCompraOcr(imageBuffer: Buffer): Promise<string | null> {
  const worker = await createWorker(DOCUMENTO_COMPRA_OCR_LANG)
  try {
    const { data } = await worker.recognize(imageBuffer)
    const text = data.text?.replace(/\s+/g, ' ').trim() ?? ''
    return text.length > 0 ? text : null
  } catch {
    return null
  } finally {
    await worker.terminate()
  }
}
