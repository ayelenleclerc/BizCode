import type { ComprobanteCompra, Proveedor } from '@prisma/client'

export type ProveedorCondicionPago = 'contado' | '15dias' | '30dias' | '60dias' | 'otro'

export type FacturaPendienteEstado =
  | 'pendiente'
  | 'proxima_vencer'
  | 'vencida_hoy'
  | 'vencida_critica'

const CONDICION_PAGO_DAYS: Record<string, number> = {
  contado: 0,
  '15dias': 15,
  '30dias': 30,
  '60dias': 60,
  otro: 0,
}

/**
 * @en Resolves payment term days from supplier commercial fields (#275).
 * @es Resuelve días de plazo desde campos comerciales del proveedor (#275).
 * @pt-BR Resolve dias de prazo a partir dos campos comerciais do fornecedor (#275).
 */
export function resolvePlazoDias(proveedor: Pick<Proveedor, 'plazoHabitual' | 'condicionPago'>): number {
  if (proveedor.plazoHabitual != null && proveedor.plazoHabitual >= 0) {
    return proveedor.plazoHabitual
  }
  if (proveedor.condicionPago && proveedor.condicionPago in CONDICION_PAGO_DAYS) {
    return CONDICION_PAGO_DAYS[proveedor.condicionPago] ?? 0
  }
  return 0
}

/**
 * @en Computes payable due date for a purchase voucher (#275).
 * @es Calcula fecha de vencimiento de comprobante de compra (#275).
 * @pt-BR Calcula data de vencimento do comprovante de compra (#275).
 */
export function computeComprobanteVencimiento(
  comprobante: Pick<ComprobanteCompra, 'fecha' | 'vencimiento'>,
  proveedor: Pick<Proveedor, 'plazoHabitual' | 'condicionPago'>,
): Date {
  if (comprobante.vencimiento != null) {
    return comprobante.vencimiento
  }
  const due = new Date(comprobante.fecha)
  due.setDate(due.getDate() + resolvePlazoDias(proveedor))
  return due
}

export function calendarDaysBetween(from: Date, to: Date): number {
  const msPerDay = 86_400_000
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((utcTo - utcFrom) / msPerDay)
}

/**
 * @en Classifies unpaid voucher alert state relative to due date (#275).
 * @es Clasifica estado de alerta de comprobante impago vs vencimiento (#275).
 * @pt-BR Classifica estado de alerta de comprovante em aberto vs vencimento (#275).
 */
export function classifyFacturaPendienteEstado(
  vencimiento: Date,
  asOf: Date,
  diasPrevioAviso: number,
  diasCritico: number,
): FacturaPendienteEstado {
  const daysUntilDue = calendarDaysBetween(asOf, vencimiento)
  if (daysUntilDue > diasPrevioAviso) return 'pendiente'
  if (daysUntilDue > 0) return 'proxima_vencer'
  if (daysUntilDue === 0) return 'vencida_hoy'
  const daysOverdue = -daysUntilDue
  if (daysOverdue >= diasCritico) return 'vencida_critica'
  return 'vencida_hoy'
}
