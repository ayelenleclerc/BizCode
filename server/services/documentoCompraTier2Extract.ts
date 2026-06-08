import { extractPdfPlainText } from '../fiscal/ar/documentoCompraPdfText'
import { extractWithDocumentoCompraTemplates } from '../fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplateExtractResult } from '../fiscal/ar/documentoCompraTemplateTypes'
import { isDocumentoCompraPdfFile } from '../lib/documentoCompraMedia'

export const DOCUMENTO_COMPRA_TIER2_MIN_CONFIDENCE = 0.7

export type DocumentoCompraTier2ExtractResult = DocumentoCompraTemplateExtractResult & {
  source: 'pdf_text_template'
}

/**
 * @en Tier 2 — digital PDF text + YAML regex templates (#277 Phase C).
 * @es Tier 2 — texto PDF digital + plantillas YAML regex (#277 Fase C).
 * @pt-BR Tier 2 — texto PDF digital + templates YAML regex (#277 Fase C).
 */
export async function tryExtractDocumentoCompraTier2(
  buffer: Buffer,
  mimeType: string,
  tipoArchivo: string,
  tenantId?: number,
): Promise<DocumentoCompraTier2ExtractResult | null> {
  if (!isDocumentoCompraPdfFile(mimeType, tipoArchivo)) return null

  const text = await extractPdfPlainText(buffer)
  if (!text) return null

  const extracted = extractWithDocumentoCompraTemplates(text, undefined, tenantId)
  if (!extracted || extracted.confidence < DOCUMENTO_COMPRA_TIER2_MIN_CONFIDENCE) {
    return null
  }

  return { ...extracted, source: 'pdf_text_template' }
}
