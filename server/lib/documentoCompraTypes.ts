/**
 * @en Shared types for purchase document import preview (#277).
 * @es Tipos compartidos del preview de importación de documentos de compra (#277).
 * @pt-BR Tipos compartidos do preview de importação de documentos de compra (#277).
 */

export const DOCUMENTO_COMPRA_CONFIDENCE_REVIEW_THRESHOLD = 0.7

export type DocumentoCompraItemPreview = {
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  articuloId: number | null
  confianza: number
}

export type DocumentoCompraPreviewData = {
  proveedorId: number | null
  /** @en CUIT/CNPJ/RUT digits extracted when supplier was not matched (#277 Fase F). */
  cuitExtracted?: string | null
  /** @en Supplier name hint from OCR/LLM when available (#277 Fase F). */
  rsocialExtracted?: string | null
  fecha: string | null
  vencimiento: string | null
  tipo: 'A' | 'B' | 'C' | null
  prefijo: string | null
  numero: number | null
  neto1: number
  neto2: number
  neto3: number
  iva1: number
  iva2: number
  total: number | null
  cae: string | null
  caeVto: string | null
  items: DocumentoCompraItemPreview[]
  fieldConfidence: Record<string, number>
}

export type DocumentoCompraImportEstado =
  | 'procesando'
  | 'pendiente_revision'
  | 'confirmado'
  | 'descartado'

/**
 * @en Empty preview for manual entry (Tier 0 / Phase A).
 * @es Preview vacío para carga manual (Tier 0 / Fase A).
 * @pt-BR Preview vazio para entrada manual (Tier 0 / Fase A).
 */
export function createEmptyDocumentoCompraPreview(): DocumentoCompraPreviewData {
  return {
    proveedorId: null,
    cuitExtracted: null,
    rsocialExtracted: null,
    fecha: null,
    vencimiento: null,
    tipo: null,
    prefijo: null,
    numero: null,
    neto1: 0,
    neto2: 0,
    neto3: 0,
    iva1: 0,
    iva2: 0,
    total: null,
    cae: null,
    caeVto: null,
    items: [],
    fieldConfidence: {},
  }
}
