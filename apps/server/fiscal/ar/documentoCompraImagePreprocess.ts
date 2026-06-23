import sharp from 'sharp'

/** @en Target width ~300 DPI on A4 for OCR (#277 Tier 3). */
export const DOCUMENTO_COMPRA_OCR_TARGET_WIDTH_PX = 2480

/**
 * @en Preprocesses purchase document photos for OCR (grayscale, contrast, sharpen).
 * @es Preprocesa fotos de documentos de compra para OCR (escala de grises, contraste, nitidez).
 * @pt-BR Pré-processa fotos de documentos de compra para OCR (escala de cinza, contraste, nitidez).
 */
export async function preprocessDocumentoCompraImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: DOCUMENTO_COMPRA_OCR_TARGET_WIDTH_PX, withoutEnlargement: true })
    .png()
    .toBuffer()
}
