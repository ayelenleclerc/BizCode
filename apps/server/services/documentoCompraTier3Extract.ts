import { preprocessDocumentoCompraImage } from '../fiscal/ar/documentoCompraImagePreprocess'
import { runDocumentoCompraOcr } from '../fiscal/ar/documentoCompraOcr'
import { extractWithDocumentoCompraTemplates } from '../fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplateExtractResult } from '../fiscal/ar/documentoCompraTemplateTypes'
import { isDocumentoCompraImageFile } from '../lib/documentoCompraMedia'

/** @en Minimum template confidence to accept OCR-based extraction (#277 AC photos ≥ 0.6). */
export const DOCUMENTO_COMPRA_TIER3_MIN_CONFIDENCE = 0.6

/** @en Discount applied to field confidence when source is OCR (less reliable than digital text). */
export const DOCUMENTO_COMPRA_TIER3_CONFIDENCE_FACTOR = 0.85

export type DocumentoCompraTier3ExtractResult = DocumentoCompraTemplateExtractResult & {
  source: 'ocr_template'
  ocrTextLength: number
}

/**
 * @en Tier 3 — image preprocess + Tesseract OCR + YAML templates (#277 Phase D).
 * @es Tier 3 — preproceso imagen + OCR Tesseract + plantillas YAML (#277 Fase D).
 * @pt-BR Tier 3 — pré-processamento imagem + OCR Tesseract + templates YAML (#277 Fase D).
 */
export async function tryExtractDocumentoCompraTier3(
  buffer: Buffer,
  mimeType: string,
  tipoArchivo: string,
  tenantId?: number,
): Promise<DocumentoCompraTier3ExtractResult | null> {
  if (!isDocumentoCompraImageFile(mimeType, tipoArchivo)) return null

  const preprocessed = await preprocessDocumentoCompraImage(buffer)
  const ocrText = await runDocumentoCompraOcr(preprocessed)
  if (!ocrText || ocrText.length < 20) return null

  const extracted = extractWithDocumentoCompraTemplates(ocrText, undefined, tenantId)
  if (!extracted) return null

  const adjustedConfidence =
    Math.round(extracted.confidence * DOCUMENTO_COMPRA_TIER3_CONFIDENCE_FACTOR * 100) / 100

  if (adjustedConfidence < DOCUMENTO_COMPRA_TIER3_MIN_CONFIDENCE) return null

  return {
    ...extracted,
    confidence: adjustedConfidence,
    source: 'ocr_template',
    ocrTextLength: ocrText.length,
  }
}
