import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

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

export type CuentaCorrienteLineType = 'factura' | 'cobro' | 'saldo_inicial'

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

function decimalToMoneyString(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toNumber() : value
  return n.toFixed(2)
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
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: {
        id: true,
        codigo: true,
        rsocial: true,
        balance: true,
        balanceInicial: true,
      },
    })
    if (!cliente) return null

    const [facturas, cobros] = await Promise.all([
      this.prisma.factura.findMany({
        where: { tenantId, clienteId, estado: 'A' },
        select: {
          id: true,
          fecha: true,
          tipo: true,
          prefijo: true,
          numero: true,
          total: true,
        },
      }),
      this.prisma.cobro.findMany({
        where: { tenantId, clienteId },
        select: {
          id: true,
          fecha: true,
          monto: true,
          referencia: true,
        },
      }),
    ])

    type Sortable = {
      sortKey: number
      tieId: number
      line: Omit<CuentaCorrienteLine, 'saldo'>
    }

    const items: Sortable[] = []

    const balanceInicial = cliente.balanceInicial.toNumber()
    if (balanceInicial !== 0) {
      items.push({
        sortKey: 0,
        tieId: 0,
        line: {
          tipo: 'saldo_inicial',
          fecha: '',
          referencia: 'balance_inicial',
          debito: balanceInicial > 0 ? balanceInicial.toFixed(2) : '0.00',
          credito: balanceInicial < 0 ? Math.abs(balanceInicial).toFixed(2) : '0.00',
        },
      })
    }

    for (const f of facturas) {
      items.push({
        sortKey: f.fecha.getTime(),
        tieId: f.id,
        line: {
          tipo: 'factura',
          fecha: f.fecha.toISOString(),
          referencia: `${f.tipo}-${f.prefijo}-${f.numero}`,
          debito: decimalToMoneyString(f.total),
          credito: '0.00',
          facturaId: f.id,
        },
      })
    }

    for (const c of cobros) {
      items.push({
        sortKey: c.fecha.getTime(),
        tieId: c.id,
        line: {
          tipo: 'cobro',
          fecha: c.fecha.toISOString(),
          referencia: c.referencia?.trim() || `cobro-${c.id}`,
          debito: '0.00',
          credito: decimalToMoneyString(c.monto),
          cobroId: c.id,
        },
      })
    }

    items.sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey
      return a.tieId - b.tieId
    })

    let running = 0
    const lineas: CuentaCorrienteLine[] = items.map((item) => {
      const debit = Number.parseFloat(item.line.debito)
      const credit = Number.parseFloat(item.line.credito)
      running += debit - credit
      return { ...item.line, saldo: running.toFixed(2) }
    })

    return {
      clienteId: cliente.id,
      codigo: cliente.codigo,
      rsocial: cliente.rsocial,
      balanceActual: decimalToMoneyString(cliente.balance),
      lineas,
    }
  }
}
