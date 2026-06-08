import { normalizeCuitDigits } from './arcaComprobanteCodes'
import {
  DOCUMENTO_COMPRA_OLLAMA_TIMEOUT_MS,
  getDocumentoCompraOllamaBaseUrl,
  getDocumentoCompraOllamaModel,
} from './documentoCompraOllamaConfig'
import type { DocumentoCompraTemplateExtractResult } from './documentoCompraTemplateTypes'

export type DocumentoCompraOllamaFields = {
  proveedor_cuit?: string | null
  tipo_comprobante?: string | null
  prefijo?: string | null
  numero?: number | null
  fecha_emision?: string | null
  total?: number | null
  cae?: string | null
  neto?: number | null
  iva?: number | null
  confianza?: number | null
}

const OLLAMA_JSON_SCHEMA = {
  type: 'object',
  properties: {
    proveedor_cuit: { type: ['string', 'null'] },
    tipo_comprobante: { type: ['string', 'null'] },
    prefijo: { type: ['string', 'null'] },
    numero: { type: ['integer', 'null'] },
    fecha_emision: { type: ['string', 'null'] },
    total: { type: ['number', 'null'] },
    cae: { type: ['string', 'null'] },
    neto: { type: ['number', 'null'] },
    iva: { type: ['number', 'null'] },
    confianza: { type: ['number', 'null'] },
  },
  additionalProperties: false,
}

/**
 * @en Whether Ollama URL is configured (Tier 4 optional; no network probe).
 * @es Si la URL de Ollama está configurada (Tier 4 opcional).
 * @pt-BR Se a URL do Ollama está configurada (Tier 4 opcional).
 */
export function isDocumentoCompraOllamaConfigured(): boolean {
  return getDocumentoCompraOllamaBaseUrl() != null
}

/**
 * @en Probes Ollama `/api/tags` when configured (#277 Tier 4).
 * @es Sondea `/api/tags` de Ollama si está configurado (#277 Tier 4).
 * @pt-BR Sonda `/api/tags` do Ollama quando configurado (#277 Tier 4).
 */
export async function isDocumentoCompraOllamaAvailable(): Promise<boolean> {
  const base = getDocumentoCompraOllamaBaseUrl()
  if (!base) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${base}/api/tags`, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

function parseIsoDateFromLlm(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return `${trimmed.slice(0, 10)}T12:00:00.000Z`
  }
  const slash = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) {
    return `${slash[3]}-${slash[2]}-${slash[1]}T12:00:00.000Z`
  }
  return null
}

function mapTipoLetter(raw: string | null | undefined): 'A' | 'B' | 'C' | null {
  const t = raw?.trim().toUpperCase()
  if (t === 'A' || t === 'B' || t === 'C') return t
  return null
}

function computeOllamaConfidence(fields: DocumentoCompraOllamaFields): number {
  if (typeof fields.confianza === 'number' && Number.isFinite(fields.confianza)) {
    return Math.min(0.69, Math.max(0.3, fields.confianza))
  }
  let score = 0
  if (fields.proveedor_cuit) score += 1
  if (fields.tipo_comprobante) score += 1
  if (fields.numero != null) score += 1
  if (fields.fecha_emision) score += 1
  if (fields.total != null) score += 1
  if (fields.cae) score += 1
  return Math.round((score / 6) * 0.65 * 100) / 100
}

export function mapOllamaFieldsToTemplateExtract(
  fields: DocumentoCompraOllamaFields,
): DocumentoCompraTemplateExtractResult | null {
  const cuitDigits = fields.proveedor_cuit
    ? normalizeCuitDigits(fields.proveedor_cuit)
    : null
  const tipo = mapTipoLetter(fields.tipo_comprobante)
  const numero =
    fields.numero != null && Number.isFinite(fields.numero) && fields.numero > 0
      ? Math.trunc(fields.numero)
      : null
  const prefijo = fields.prefijo?.trim() || null
  const total =
    fields.total != null && Number.isFinite(fields.total) && fields.total > 0
      ? fields.total
      : null
  const caeRaw = fields.cae?.replace(/\D/g, '') ?? ''
  const cae = caeRaw.length > 0 ? caeRaw.padStart(14, '0').slice(-14) : null
  const fechaIso = parseIsoDateFromLlm(fields.fecha_emision)
  const confidence = computeOllamaConfidence(fields)

  if (total == null && numero == null && cuitDigits == null) return null
  if (confidence < 0.3) return null

  return {
    issuer: 'ollama-local',
    matches: [],
    confidence,
    cuitDigits: cuitDigits && cuitDigits.length >= 10 ? cuitDigits : null,
    tipo,
    prefijo,
    numero,
    fechaIso,
    total,
    cae,
  }
}

function parseOllamaGenerateBody(raw: string): DocumentoCompraOllamaFields | null {
  try {
    const outer = JSON.parse(raw) as { response?: string }
    const inner = outer.response?.trim()
    if (!inner) return null
    return JSON.parse(inner) as DocumentoCompraOllamaFields
  } catch {
    return null
  }
}

/**
 * @en Tier 4 — optional local Ollama structured extraction (no cloud APIs).
 * @es Tier 4 — extracción estructurada opcional con Ollama local (sin APIs en la nube).
 * @pt-BR Tier 4 — extração estruturada opcional com Ollama local (sem APIs na nuvem).
 */
export async function extractDocumentoCompraWithOllama(
  text: string,
): Promise<DocumentoCompraTemplateExtractResult | null> {
  const base = getDocumentoCompraOllamaBaseUrl()
  if (!base || text.trim().length < 30) return null

  const model = getDocumentoCompraOllamaModel()
  const prompt =
    'Extract purchase invoice fields from the text below. Return JSON only with keys: ' +
    'proveedor_cuit, tipo_comprobante (A|B|C), prefijo, numero, fecha_emision (YYYY-MM-DD), ' +
    'total, cae, neto, iva, confianza (0-1). Use null when unknown.\n\n' +
    text.slice(0, 12_000)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DOCUMENTO_COMPRA_OLLAMA_TIMEOUT_MS)

  try {
    const res = await fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: OLLAMA_JSON_SCHEMA,
        options: { temperature: 0 },
      }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const body = await res.text()
    const fields = parseOllamaGenerateBody(body)
    if (!fields) return null
    return mapOllamaFieldsToTemplateExtract(fields)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
