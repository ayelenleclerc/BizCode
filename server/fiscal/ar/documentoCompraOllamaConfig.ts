/** @en Default Ollama model for structured invoice extraction (#277 Tier 4). */
export const DOCUMENTO_COMPRA_OLLAMA_DEFAULT_MODEL = 'nuextract'

/** @en Request timeout when probing or calling Ollama (ms). */
export const DOCUMENTO_COMPRA_OLLAMA_TIMEOUT_MS = 45_000

/**
 * @en Resolved Ollama base URL when `OLLAMA_URL` is set (optional Tier 4).
 * @es URL base de Ollama cuando `OLLAMA_URL` está definida (Tier 4 opcional).
 * @pt-BR URL base do Ollama quando `OLLAMA_URL` está definida (Tier 4 opcional).
 */
export function getDocumentoCompraOllamaBaseUrl(): string | null {
  const raw = process.env.OLLAMA_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/+$/, '')
}

export function getDocumentoCompraOllamaModel(): string {
  const raw = process.env.OLLAMA_MODEL?.trim()
  return raw && raw.length > 0 ? raw : DOCUMENTO_COMPRA_OLLAMA_DEFAULT_MODEL
}
