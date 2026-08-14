import type { UnidadBase } from '@bizcode/types'

/**
 * @en Converts spoken qty when unitHint is caja and the SKU stores base units via factorConversion (#266).
 * @es Convierte qty hablada si unitHint es caja y el SKU usa factorConversion hacia unidad base (#266).
 * @pt-BR Converte qty falada se unitHint for caixa e o SKU usar factorConversion para unidade base (#266).
 */
export function applySpokenUnitConversion(
  qty: number,
  unitHint: UnidadBase | null,
  item: { unidadBase?: string | null; factorConversion?: number | string | null },
): number {
  if (!Number.isFinite(qty) || qty <= 0) return qty
  if (unitHint !== 'caja') return qty
  const base = item.unidadBase ?? 'unidad'
  if (base === 'caja') return qty
  const factor = Number(item.factorConversion ?? 1)
  if (!Number.isFinite(factor) || factor <= 0) return qty
  return qty * factor
}
