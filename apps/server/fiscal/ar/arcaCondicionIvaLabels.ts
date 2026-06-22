import type { CondicionIvaCode } from './arcaFiscalPdfTypes'

/** @en Spanish labels for PDF only (AR fiscal printout). */
const CONDICION_IVA_LABELS: Record<CondicionIvaCode, string> = {
  RI: 'IVA Responsable Inscripto',
  Mono: 'Monotributo',
  CF: 'Consumidor Final',
  Exento: 'IVA Exento',
}

/**
 * @en Resolves VAT condition label for PDF; unknown codes returned as-is.
 * @es Etiqueta de condición IVA para PDF.
 * @pt-BR Rótulo de condição IVA para PDF.
 */
export function condicionIvaPdfLabel(code: string | null | undefined): string {
  if (!code) return '—'
  const key = code as CondicionIvaCode
  return CONDICION_IVA_LABELS[key] ?? code
}
