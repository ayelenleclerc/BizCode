import { extractText, getDocumentProxy } from 'unpdf'

/**
 * @en Extracts plain text from a digital PDF buffer (Tier 2 input; no OCR).
 * @es Extrae texto plano de un buffer PDF digital (entrada Tier 2; sin OCR).
 * @pt-BR Extrai texto simples de um buffer PDF digital (entrada Tier 2; sem OCR).
 */
export async function extractPdfPlainText(buffer: Buffer): Promise<string | null> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true as const })
    const merged = Array.isArray(text) ? text.join('\n') : text
    const normalized = merged.replace(/\s+/g, ' ').trim()
    return normalized.length > 0 ? normalized : null
  } catch {
    return null
  }
}
