import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { endOfDay } from '../reportesPeriodUtils'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'

export const AGING_BUCKET_LABELS = ['0-30d', '31-60d', '61-90d', '>90d'] as const
export type AgingBucketLabel = (typeof AGING_BUCKET_LABELS)[number]

export type AgingBucket = {
  label: AgingBucketLabel
  count: number
  total: string
}

export type AgingArResult = {
  buckets: AgingBucket[]
  totalDeuda: string
  resumen: {
    deudaVencida: string
    deudaPorVencer: string
    porcentajeMora: string
    clientesSuspendidos: number
  }
}

export type CuentaCorrienteLineType =
  | 'factura'
  | 'cobro'
  | 'saldo_inicial'
  | 'nota_credito'
  | 'retencion'
  | 'percepcion'
  | 'cheque_rechazado'
  | 'ajuste'

export type CuentaCorrienteLine = {
  tipo: CuentaCorrienteLineType
  fecha: string
  referencia: string
  debito: string
  credito: string
  saldo: string
  facturaId?: number
  cobroId?: number
}

export type CuentaCorrienteResult = {
  clienteId: number
  codigo: number
  rsocial: string
  balanceActual: string
  lineas: CuentaCorrienteLine[]
}

export type CobranzasPorFormaPago = {
  formaPagoId: number | null
  descripcion: string
  total: string
}

export type ReporteCobranzasRow = {
  fecha: string
  count: number
  total: string
  porFormaPago: CobranzasPorFormaPago[]
}

/**
 * @en Start of calendar day in local server timezone.
 * @es Inicio del día calendario en la zona horaria del servidor.
 * @pt-BR Início do dia civil no fuso do servidor.
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

/**
 * @en Days past due from invoice date + credit days (0 if not yet due).
 * @es Días de mora desde fecha de factura + días de crédito (0 si no venció).
 * @pt-BR Dias em atraso desde data da fatura + prazo de crédito (0 se não venceu).
 */
export function computeDaysPastDue(invoiceDate: Date, creditDays: number, asOf: Date): number {
  const due = startOfDay(invoiceDate)
  due.setDate(due.getDate() + creditDays)
  const today = startOfDay(asOf)
  const diffMs = today.getTime() - due.getTime()
  if (diffMs <= 0) return 0
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * @en Maps days past due to AR aging bucket label.
 * @es Asigna días de mora al bucket de aging.
 * @pt-BR Mapeia dias em atraso para o bucket de aging.
 */
export function bucketLabelForDaysPastDue(daysPastDue: number): AgingBucketLabel {
  if (daysPastDue <= 30) return '0-30d'
  if (daysPastDue <= 60) return '31-60d'
  if (daysPastDue <= 90) return '61-90d'
  return '>90d'
}

type InvoiceForAging = {
  total: Decimal
  fecha: Date
  cliente: { creditDays: number }
}

/**
 * @en Builds aging buckets from active invoices (full invoice total per bucket; see OpenAPI).
 * @es Arma buckets de aging desde facturas activas (total por factura; ver OpenAPI).
 * @pt-BR Monta buckets de aging a partir de faturas ativas (total por fatura; ver OpenAPI).
 */
export function buildAgingFromInvoices(
  invoices: InvoiceForAging[],
  asOf: Date,
): Pick<AgingArResult, 'buckets' | 'totalDeuda' | 'resumen'> {
  const bucketTotals = new Map<AgingBucketLabel, { count: number; total: number }>()
  for (const label of AGING_BUCKET_LABELS) {
    bucketTotals.set(label, { count: 0, total: 0 })
  }

  let deudaVencida = 0
  let deudaPorVencer = 0

  for (const inv of invoices) {
    const amount = inv.total.toNumber()
    const days = computeDaysPastDue(inv.fecha, inv.cliente.creditDays, asOf)
    const label = bucketLabelForDaysPastDue(days)
    const bucket = bucketTotals.get(label)!
    bucket.count += 1
    bucket.total += amount
    if (days > 0) {
      deudaVencida += amount
    } else {
      deudaPorVencer += amount
    }
  }

  const buckets: AgingBucket[] = AGING_BUCKET_LABELS.map((label) => {
    const b = bucketTotals.get(label)!
    return { label, count: b.count, total: b.total.toFixed(2) }
  })

  const totalDeudaNum = deudaVencida + deudaPorVencer
  const porcentajeMora =
    totalDeudaNum > 0 ? ((deudaVencida / totalDeudaNum) * 100).toFixed(2) : '0.00'

  return {
    buckets,
    totalDeuda: totalDeudaNum.toFixed(2),
    resumen: {
      deudaVencida: deudaVencida.toFixed(2),
      deudaPorVencer: deudaPorVencer.toFixed(2),
      porcentajeMora,
      clientesSuspendidos: 0,
    },
  }
}

/**
 * @en Financial reports (AR aging, customer statement).
 * @es Reportes financieros (aging de CxC, cuenta corriente).
 * @pt-BR Relatórios financeiros (aging de CR, conta corrente).
 */
export class ReportesFinancierosService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAgingAr(tenantId: number, asOf: Date = new Date()): Promise<AgingArResult> {
    const [invoices, suspendedCount] = await Promise.all([
      this.prisma.factura.findMany({
        where: { tenantId, estado: 'A' },
        select: {
          total: true,
          fecha: true,
          cliente: { select: { creditDays: true } },
        },
      }),
      this.prisma.cliente.count({
        where: { tenantId, suspended: true, activo: true },
      }),
    ])

    const built = buildAgingFromInvoices(invoices, asOf)
    return {
      ...built,
      resumen: { ...built.resumen, clientesSuspendidos: suspendedCount },
    }
  }

  async getCuentaCorriente(tenantId: number, clienteId: number): Promise<CuentaCorrienteResult | null> {
    const ccService = new ClienteCuentaCorrienteService(this.prisma)
    return ccService.getLegacyCuentaCorriente(tenantId, clienteId)
  }

  /**
   * @en Collections grouped by calendar day and payment method.
   * @es Cobranzas agrupadas por día calendario y forma de pago.
   * @pt-BR Recebimentos agrupados por dia civil e forma de pagamento.
   */
  async getCobranzasPorPeriodo(
    tenantId: number,
    from: Date,
    to: Date,
  ): Promise<ReporteCobranzasRow[]> {
    const rangeEnd = endOfDay(to)
    const cobros = await this.prisma.cobro.findMany({
      where: {
        tenantId,
        fecha: { gte: from, lte: rangeEnd },
      },
      select: {
        fecha: true,
        monto: true,
        formaPagoId: true,
        formaPago: { select: { id: true, descripcion: true } },
      },
    })

    type DayBucket = {
      count: number
      total: number
      byForma: Map<string, { formaPagoId: number | null; descripcion: string; total: number }>
    }

    const byDay = new Map<string, DayBucket>()

    for (const c of cobros) {
      const day = startOfDay(c.fecha)
      const y = day.getFullYear()
      const m = String(day.getMonth() + 1).padStart(2, '0')
      const d = String(day.getDate()).padStart(2, '0')
      const fechaKey = `${y}-${m}-${d}`

      const bucket = byDay.get(fechaKey) ?? { count: 0, total: 0, byForma: new Map() }
      bucket.count += 1
      const amount = c.monto.toNumber()
      bucket.total += amount

      const fpKey =
        c.formaPagoId === null ? 'null' : String(c.formaPagoId)
      const fpRow = bucket.byForma.get(fpKey) ?? {
        formaPagoId: c.formaPagoId,
        descripcion: c.formaPago?.descripcion ?? '—',
        total: 0,
      }
      fpRow.total += amount
      bucket.byForma.set(fpKey, fpRow)

      byDay.set(fechaKey, bucket)
    }

    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, bucket]) => ({
        fecha,
        count: bucket.count,
        total: bucket.total.toFixed(2),
        porFormaPago: [...bucket.byForma.values()]
          .sort((a, b) => (a.formaPagoId ?? 0) - (b.formaPagoId ?? 0))
          .map((fp) => ({
            formaPagoId: fp.formaPagoId,
            descripcion: fp.descripcion,
            total: fp.total.toFixed(2),
          })),
      }))
  }
}
