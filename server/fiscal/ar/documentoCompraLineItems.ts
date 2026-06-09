import type { DocumentoCompraItemPreview } from '../../lib/documentoCompraTypes'

const SKIP_LINE =
  /^(total|subtotal|iva|neto|neto gravado|cuit|cae|factura|nota|fecha|vencimiento|importe|condici[oó]n|domicilio|tel[eé]fono)/i

const LINE_ITEM_RE =
  /^(.{3,80}?)\s+(?:x\s*)?(\d+(?:[.,]\d+)?)\s+\$?\s*([\d.,]+)\s+\$?\s*([\d.,]+)\s*$/i

function parseLocalizedAmount(raw: string, decimalSep = ',', thousandsSep = '.'): number | null {
  let normalized = raw.trim()
  if (thousandsSep) {
    normalized = normalized.split(thousandsSep).join('')
  }
  if (decimalSep && decimalSep !== '.') {
    normalized = normalized.replace(decimalSep, '.')
  }
  const n = Number.parseFloat(normalized)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function pushItem(
  items: DocumentoCompraItemPreview[],
  descripcion: string,
  cantidadRaw: string,
  precioRaw: string,
  subtotalRaw: string,
  confianza: number,
): void {
  const descripcionTrim = descripcion.trim()
  if (descripcionTrim.length < 3 || SKIP_LINE.test(descripcionTrim)) return

  const cantidad =
    parseLocalizedAmount(cantidadRaw) ??
    Number.parseFloat(cantidadRaw.replace(',', '.'))
  const precioUnitario = parseLocalizedAmount(precioRaw)
  const subtotal = parseLocalizedAmount(subtotalRaw)
  if (!Number.isFinite(cantidad) || cantidad <= 0) return
  if (precioUnitario == null || subtotal == null) return

  items.push({
    descripcion: descripcionTrim,
    cantidad,
    precioUnitario,
    subtotal,
    articuloId: null,
    confianza,
  })
}

/**
 * @en Parses purchase line items from invoice PDF/OCR plain text (#277 Fase F).
 * @es Parsea líneas de compra desde texto plano de factura PDF/OCR (#277 Fase F).
 * @pt-BR Analisa itens de compra a partir de texto simples de fatura PDF/OCR (#277 Fase F).
 */
export function parseDocumentoCompraLineItemsFromText(
  text: string,
  baseConfidence: number,
): DocumentoCompraItemPreview[] {
  if (!text.trim()) return []

  const items: DocumentoCompraItemPreview[] = []
  const itemConfidence = Math.min(Math.max(baseConfidence * 0.85, 0.35), 0.8)

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.length < 8 || SKIP_LINE.test(line)) continue
    const match = LINE_ITEM_RE.exec(line)
    if (!match) continue
    pushItem(items, match[1], match[2], match[3], match[4], itemConfidence)
  }

  if (items.length === 0) {
    const inlineRe =
      /([A-Za-zÁÉÍÓÚÑáéíóúñ][\w\sÁÉÍÓÚÑáéíóúñ.,\-/()]{2,60}?)\s+(?:x\s*)?(\d+(?:[.,]\d+)?)\s+\$?\s*([\d.,]+)\s+\$?\s*([\d.,]+)/gi
    let inlineMatch: RegExpExecArray | null
    while ((inlineMatch = inlineRe.exec(text)) !== null) {
      pushItem(
        items,
        inlineMatch[1],
        inlineMatch[2],
        inlineMatch[3],
        inlineMatch[4],
        itemConfidence,
      )
      if (items.length >= 40) break
    }
  }

  return items.slice(0, 40)
}
