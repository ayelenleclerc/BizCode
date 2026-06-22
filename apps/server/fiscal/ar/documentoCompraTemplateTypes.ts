import type { DocumentoCompraItemPreview } from '../../lib/documentoCompraTypes'

/**
 * @en YAML template schema for purchase document regex extraction (#277 Tier 2).
 * @es Esquema de plantillas YAML para extracción regex de documentos de compra (#277 Tier 2).
 * @pt-BR Esquema de templates YAML para extração regex de documentos de compra (#277 Tier 2).
 */

export type DocumentoCompraTemplateOptions = {
  currency?: string
  date_formats?: string[]
  decimal_separator?: string
  thousands_separator?: string
}

export type DocumentoCompraTemplate = {
  issuer: string
  keywords: string[]
  fields: Record<string, string>
  options?: DocumentoCompraTemplateOptions
}

export type DocumentoCompraTemplateFieldMatch = {
  field: string
  raw: string
}

export type DocumentoCompraTemplateExtractResult = {
  issuer: string
  matches: DocumentoCompraTemplateFieldMatch[]
  confidence: number
  cuitDigits: string | null
  tipo: 'A' | 'B' | 'C' | null
  prefijo: string | null
  numero: number | null
  fechaIso: string | null
  total: number | null
  cae: string | null
  items?: DocumentoCompraItemPreview[]
  rsocialExtracted?: string | null
}
