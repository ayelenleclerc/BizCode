/** @en Allowed purchase-history period lengths in days (#272). */
export const PROVEEDOR_HISTORIAL_PERIODOS = [30, 90, 180, 365] as const

export type ProveedorHistorialPeriodoDias = (typeof PROVEEDOR_HISTORIAL_PERIODOS)[number]

const PERIODO_SET = new Set<number>(PROVEEDOR_HISTORIAL_PERIODOS)

/**
 * @en Parses and validates historial period query (defaults to 90 days).
 * @es Parsea y valida el período de historial (por defecto 90 días).
 * @pt-BR Analisa e valida o período do histórico (padrão 90 dias).
 */
export function parseProveedorHistorialPeriodo(value: unknown): ProveedorHistorialPeriodoDias | null {
  if (value === undefined || value === null || value === '') {
    return 90
  }
  const n = Number.parseInt(String(value), 10)
  if (!PERIODO_SET.has(n)) return null
  return n as ProveedorHistorialPeriodoDias
}

/**
 * @en Returns UTC start date for a rolling period ending at `asOf`.
 * @es Devuelve fecha UTC de inicio para un período móvil que termina en `asOf`.
 * @pt-BR Retorna data UTC inicial para período móvel terminando em `asOf`.
 */
export function historialPeriodStart(asOf: Date, dias: ProveedorHistorialPeriodoDias): Date {
  const start = new Date(asOf.getTime())
  start.setUTCDate(start.getUTCDate() - dias)
  start.setUTCHours(0, 0, 0, 0)
  return start
}
