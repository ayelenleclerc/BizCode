/**
 * @en Parses API money (number or decimal string) to number.
 * @es Parsea montos de API (número o string decimal) a number.
 * @pt-BR Converte valores da API (número ou string decimal) para number.
 */
export function parseMoney(value: number | string | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * @en Formats a money amount for display (es-AR style, two decimals).
 * @es Formatea un monto para mostrar (estilo es-AR, dos decimales).
 * @pt-BR Formata um valor monetário para exibição (estilo es-AR, duas casas).
 */
export function formatMoney(value: number | string | null | undefined, locale = 'es-AR'): string {
  const n = parseMoney(value)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
