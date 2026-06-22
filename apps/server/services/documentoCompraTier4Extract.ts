import { collectDocumentoCompraRawText } from '../fiscal/ar/documentoCompraRawText'
import { extractDocumentoCompraWithOllama } from '../fiscal/ar/documentoCompraOllamaExtract'
import type { DocumentoCompraTemplateExtractResult } from '../fiscal/ar/documentoCompraTemplateTypes'

export type DocumentoCompraTier4ExtractResult = DocumentoCompraTemplateExtractResult & {
  source: 'ollama_local'
}

/**
 * @en Tier 4 — optional Ollama LLM when tiers 1–3 fail (#277 Phase E).
 * @es Tier 4 — Ollama LLM opcional cuando fallan tiers 1–3 (#277 Fase E).
 * @pt-BR Tier 4 — Ollama LLM opcional quando tiers 1–3 falham (#277 Fase E).
 */
export async function tryExtractDocumentoCompraTier4(
  buffer: Buffer,
  mimeType: string,
  tipoArchivo: string,
  existingText?: string | null,
): Promise<DocumentoCompraTier4ExtractResult | null> {
  const text =
    existingText?.trim() ||
    (await collectDocumentoCompraRawText(buffer, mimeType, tipoArchivo))
  if (!text || text.length < 30) return null

  const extracted = await extractDocumentoCompraWithOllama(text)
  if (!extracted) return null

  return { ...extracted, source: 'ollama_local' }
}
