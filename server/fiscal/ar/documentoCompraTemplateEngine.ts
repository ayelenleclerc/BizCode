import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { normalizeCuitDigits } from './afipComprobanteCodes'
import type {
  DocumentoCompraTemplate,
  DocumentoCompraTemplateExtractResult,
  DocumentoCompraTemplateFieldMatch,
} from './documentoCompraTemplateTypes'
import type { DocumentoCompraPreviewData } from '../../lib/documentoCompraTypes'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUNDLED_TEMPLATES_DIR = path.join(__dirname, 'documento-compra-templates')

const TIER2_CONFIDENCE_FIELDS = ['vat_id', 'invoice_number', 'date', 'amount', 'cae', 'tipo_letra'] as const

function resolveTenantTemplatesDir(tenantId: number): string {
  const root = process.env.DOCUMENTOS_COMPRA_TEMPLATES_PATH?.trim()
  const base =
    root && root.length > 0
      ? root
      : path.join(process.cwd(), 'data', 'documentos-compra-templates')
  return path.join(base, String(tenantId))
}

function readTemplatesFromDir(dir: string): DocumentoCompraTemplate[] {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    return parseYaml(raw) as DocumentoCompraTemplate
  })
}

/**
 * @en Validates invoice2data-style template shape (#277).
 * @es Valida forma de plantilla estilo invoice2data (#277).
 * @pt-BR Valida formato de template estilo invoice2data (#277).
 */
export function validateDocumentoCompraTemplate(template: DocumentoCompraTemplate): void {
  if (!template.issuer?.trim()) {
    throw new Error('Template issuer is required')
  }
  if (!Array.isArray(template.keywords) || template.keywords.length === 0) {
    throw new Error('Template keywords are required')
  }
  if (!template.fields || typeof template.fields !== 'object' || Object.keys(template.fields).length === 0) {
    throw new Error('Template fields are required')
  }
}

/**
 * @en Loads bundled + optional tenant custom YAML templates (#277).
 * @es Carga plantillas YAML empaquetadas + custom del tenant (#277).
 * @pt-BR Carrega templates YAML embutidos + custom do tenant (#277).
 */
export function loadDocumentoCompraTemplates(tenantId?: number): DocumentoCompraTemplate[] {
  const bundled = readTemplatesFromDir(BUNDLED_TEMPLATES_DIR)
  if (tenantId == null) return bundled
  const custom = readTemplatesFromDir(resolveTenantTemplatesDir(tenantId))
  return [...bundled, ...custom]
}

/**
 * @en Persists a tenant custom YAML template (#277).
 * @es Persiste plantilla YAML custom del tenant (#277).
 * @pt-BR Persiste template YAML custom do tenant (#277).
 */
export function saveTenantDocumentoCompraTemplate(
  tenantId: number,
  yamlContent: string,
): DocumentoCompraTemplate {
  const template = parseYaml(yamlContent) as DocumentoCompraTemplate
  validateDocumentoCompraTemplate(template)
  const dir = resolveTenantTemplatesDir(tenantId)
  fs.mkdirSync(dir, { recursive: true })
  const safeIssuer = template.issuer.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80)
  fs.writeFileSync(path.join(dir, `${safeIssuer}.yaml`), yamlContent, 'utf8')
  return template
}

function templateKeywordsMatch(text: string, template: DocumentoCompraTemplate): boolean {
  const upper = text.toUpperCase()
  return template.keywords.every((kw) => upper.includes(kw.toUpperCase()))
}

function applyFieldRegex(text: string, pattern: string): string | null {
  const re = new RegExp(pattern, 'i')
  const match = re.exec(text)
  return match?.[1]?.trim() ?? null
}

function parseArgentineAmount(
  raw: string,
  decimalSep = ',',
  thousandsSep = '.',
): number | null {
  let normalized = raw.trim()
  if (thousandsSep) {
    normalized = normalized.split(thousandsSep).join('')
  }
  if (decimalSep && decimalSep !== '.') {
    normalized = normalized.replace(decimalSep, '.')
  }
  const n = Number.parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

function parseTemplateDate(raw: string, formats: string[]): string | null {
  for (const fmt of formats) {
    if (fmt === '%d/%m/%Y') {
      const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (m) {
        const [, d, mo, y] = m
        return `${y}-${mo}-${d}T12:00:00.000Z`
      }
    }
    if (fmt === '%Y-%m-%d') {
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (m) {
        const [, y, mo, d] = m
        return `${y}-${mo}-${d}T12:00:00.000Z`
      }
    }
  }
  return null
}

function parseInvoiceNumber(raw: string): { prefijo: string; numero: number } | null {
  const match = raw.match(/(\d{4,5})\s*[-–]\s*(\d{1,8})/)
  if (!match) return null
  const prefijo = match[1].padStart(4, '0').slice(-4)
  const numero = Number.parseInt(match[2], 10)
  if (!Number.isFinite(numero) || numero < 1) return null
  return { prefijo, numero }
}

function computeTemplateConfidence(matches: DocumentoCompraTemplateFieldMatch[]): number {
  const found = new Set(matches.map((m) => m.field))
  const hit = TIER2_CONFIDENCE_FIELDS.filter((f) => found.has(f)).length
  return Math.round((hit / TIER2_CONFIDENCE_FIELDS.length) * 100) / 100
}

/**
 * @en Applies invoice2data-style YAML templates to extracted PDF text.
 * @es Aplica plantillas YAML estilo invoice2data sobre texto PDF extraído.
 * @pt-BR Aplica templates YAML estilo invoice2data sobre texto PDF extraído.
 */
export function extractWithDocumentoCompraTemplates(
  text: string,
  templates?: DocumentoCompraTemplate[],
  tenantId?: number,
): DocumentoCompraTemplateExtractResult | null {
  const resolved = templates ?? loadDocumentoCompraTemplates(tenantId)
  for (const template of resolved) {
    if (!templateKeywordsMatch(text, template)) continue

    const matches: DocumentoCompraTemplateFieldMatch[] = []
    for (const [field, pattern] of Object.entries(template.fields)) {
      const raw = applyFieldRegex(text, pattern)
      if (raw) matches.push({ field, raw })
    }

    if (matches.length === 0) continue

    const byField = Object.fromEntries(matches.map((m) => [m.field, m.raw])) as Record<string, string>
    const opts = template.options ?? {}
    const invoiceParts = byField.invoice_number ? parseInvoiceNumber(byField.invoice_number) : null
    const tipoRaw = byField.tipo_letra?.toUpperCase()
    const tipo =
      tipoRaw === 'A' || tipoRaw === 'B' || tipoRaw === 'C' ? tipoRaw : null
    const cuitDigits = byField.vat_id ? normalizeCuitDigits(byField.vat_id) : null
    const fechaIso = byField.date
      ? parseTemplateDate(byField.date, opts.date_formats ?? ['%d/%m/%Y'])
      : null
    const total = byField.amount
      ? parseArgentineAmount(byField.amount, opts.decimal_separator, opts.thousands_separator)
      : null
    const cae = byField.cae?.replace(/\D/g, '').padStart(14, '0').slice(-14) ?? null

    const confidence = computeTemplateConfidence(matches)
    if (confidence < 0.5) continue

    return {
      issuer: template.issuer,
      matches,
      confidence,
      cuitDigits: cuitDigits && cuitDigits.length >= 10 ? cuitDigits : null,
      tipo,
      prefijo: invoiceParts?.prefijo ?? null,
      numero: invoiceParts?.numero ?? null,
      fechaIso,
      total,
      cae,
    }
  }

  return null
}

function estimateVatFromTotal(
  tipo: 'A' | 'B' | 'C',
  total: number,
): Pick<DocumentoCompraPreviewData, 'neto1' | 'neto2' | 'neto3' | 'iva1' | 'iva2'> {
  if (tipo === 'C') {
    return { neto1: total, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }
  }
  if (tipo === 'B') {
    const neto = Math.round((total / 1.21) * 100) / 100
    const iva = Math.round((total - neto) * 100) / 100
    return { neto1: neto, neto2: 0, neto3: 0, iva1: iva, iva2: 0 }
  }
  return { neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }
}

/**
 * @en Maps Tier 2 template extraction to editable purchase preview.
 * @es Mapea extracción Tier 2 a preview editable de compra.
 * @pt-BR Mapeia extração Tier 2 para preview editável de compra.
 */
export function mapTemplateExtractToDocumentoCompraPreview(
  extracted: DocumentoCompraTemplateExtractResult,
  proveedorId: number | null,
): DocumentoCompraPreviewData {
  const tipo = extracted.tipo
  const total = extracted.total
  const amounts =
    tipo != null && total != null && total > 0
      ? estimateVatFromTotal(tipo, total)
      : { neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0 }

  const fieldConfidence: Record<string, number> = {
    proveedorId: proveedorId != null ? extracted.confidence : 0,
    fecha: extracted.fechaIso ? extracted.confidence : 0,
    tipo: tipo ? extracted.confidence : 0,
    prefijo: extracted.prefijo ? extracted.confidence : 0,
    numero: extracted.numero != null ? extracted.confidence : 0,
    total: total != null ? extracted.confidence : 0,
    cae: extracted.cae ? extracted.confidence : 0,
    neto1: tipo === 'B' || tipo === 'C' ? Math.min(extracted.confidence, 0.75) : 0.3,
    iva1: tipo === 'B' ? Math.min(extracted.confidence, 0.75) : 0.3,
  }

  return {
    proveedorId,
    fecha: extracted.fechaIso,
    vencimiento: null,
    tipo,
    prefijo: extracted.prefijo,
    numero: extracted.numero,
    ...amounts,
    total,
    cae: extracted.cae,
    caeVto: null,
    items: [],
    fieldConfidence,
  }
}
