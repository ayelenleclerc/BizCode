import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { dispatchSupplierNotification, isSmtpConfigured } from '../channels'
import {
  calendarDaysBetween,
  classifyFacturaPendienteEstado,
  computeComprobanteVencimiento,
  type FacturaPendienteEstado,
} from '../lib/proveedorVencimiento'
import { getLocalHour, getLocalMinute } from '../lib/tenantLocalTime'
import type { AlertaProveedorConfigInput } from '../createApp.types'
import type { NotificationType } from '../notifications'
import { ProveedorCuentaCorrienteService } from './ProveedorCuentaCorrienteService'

const DAILY_JOB_LOCAL_HOUR = 7
const DAILY_JOB_MINUTE_TOLERANCE = 15

export type AlertaProveedorConfigDto = {
  diasPrevioAviso: number
  diasCritico: number
  notifEmail: boolean
  notifInApp: boolean
}

export type FacturaPendienteRow = {
  comprobanteCompraId: number
  proveedorId: number
  proveedorCodigo: number
  proveedorRsocial: string
  facturaRef: string
  fecha: string
  vencimiento: string
  total: string
  pagado: string
  pendiente: string
  estado: FacturaPendienteEstado
  diasHastaVencimiento: number
  diasVencido: number
}

export type FacturasPagarDashboardTotals = {
  vencido: { count: number; total: string }
  proximoVencer: { count: number; total: string }
}

type AlertLogTipo = 'proxima_vencer' | 'vencida_hoy' | 'vencida_critica' | 'limite_credito'

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function formatComprobanteRef(tipo: string, prefijo: string, numero: number): string {
  return `${tipo}-${prefijo}-${numero}`
}

const DEFAULT_CONFIG: AlertaProveedorConfigDto = {
  diasPrevioAviso: 3,
  diasCritico: 7,
  notifEmail: true,
  notifInApp: true,
}

/**
 * @en Supplier payable due-date alerts (#275).
 * @es Alertas de vencimiento de facturas a pagar (#275).
 * @pt-BR Alertas de vencimento de faturas a pagar (#275).
 */
export class ProveedorAlertasService {
  constructor(private readonly prisma: PrismaClient) {}

  private mapConfig(
    row: {
      diasPrevioAviso: number
      diasCritico: number
      notifEmail: boolean
      notifInApp: boolean
    } | null,
  ): AlertaProveedorConfigDto {
    if (!row) return { ...DEFAULT_CONFIG }
    return {
      diasPrevioAviso: row.diasPrevioAviso,
      diasCritico: row.diasCritico,
      notifEmail: row.notifEmail,
      notifInApp: row.notifInApp,
    }
  }

  async getConfig(tenantId: number): Promise<AlertaProveedorConfigDto> {
    const row = await this.prisma.alertaProveedorConfig.findUnique({
      where: { tenantId },
      select: {
        diasPrevioAviso: true,
        diasCritico: true,
        notifEmail: true,
        notifInApp: true,
      },
    })
    return this.mapConfig(row)
  }

  async upsertConfig(tenantId: number, input: AlertaProveedorConfigInput): Promise<AlertaProveedorConfigDto> {
    const row = await this.prisma.alertaProveedorConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        diasPrevioAviso: input.diasPrevioAviso ?? DEFAULT_CONFIG.diasPrevioAviso,
        diasCritico: input.diasCritico ?? DEFAULT_CONFIG.diasCritico,
        notifEmail: input.notifEmail ?? DEFAULT_CONFIG.notifEmail,
        notifInApp: input.notifInApp ?? DEFAULT_CONFIG.notifInApp,
      },
      update: {
        ...(input.diasPrevioAviso !== undefined ? { diasPrevioAviso: input.diasPrevioAviso } : {}),
        ...(input.diasCritico !== undefined ? { diasCritico: input.diasCritico } : {}),
        ...(input.notifEmail !== undefined ? { notifEmail: input.notifEmail } : {}),
        ...(input.notifInApp !== undefined ? { notifInApp: input.notifInApp } : {}),
      },
      select: {
        diasPrevioAviso: true,
        diasCritico: true,
        notifEmail: true,
        notifInApp: true,
      },
    })
    return this.mapConfig(row)
  }

  private async loadPaidMap(tenantId: number, comprobanteIds: number[]): Promise<Map<number, Decimal>> {
    if (comprobanteIds.length === 0) return new Map()
    const allocations = await this.prisma.reciboPagoFactura.groupBy({
      by: ['comprobanteCompraId'],
      where: {
        comprobanteCompraId: { in: comprobanteIds },
        reciboPago: { tenantId, estado: 'emitido' },
      },
      _sum: { monto: true },
    })
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row.comprobanteCompraId != null && row._sum.monto != null) {
        paidMap.set(row.comprobanteCompraId, row._sum.monto)
      }
    }
    return paidMap
  }

  async listFacturasPendientes(
    tenantId: number,
    filters?: { estado?: FacturaPendienteEstado; proveedorId?: number },
    asOf = new Date(),
  ): Promise<FacturaPendienteRow[]> {
    const config = await this.getConfig(tenantId)
    const where: Prisma.ComprobanteCompraWhereInput = {
      tenantId,
      estado: 'A',
      ...(filters?.proveedorId != null ? { proveedorId: filters.proveedorId } : {}),
    }
    const comprobantes = await this.prisma.comprobanteCompra.findMany({
      where,
      include: {
        proveedor: {
          select: {
            id: true,
            codigo: true,
            rsocial: true,
            plazoHabitual: true,
            condicionPago: true,
          },
        },
      },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })
    if (comprobantes.length === 0) return []

    const paidMap = await this.loadPaidMap(
      tenantId,
      comprobantes.map((c) => c.id),
    )

    const rows: FacturaPendienteRow[] = []
    for (const c of comprobantes) {
      const pagado = paidMap.get(c.id) ?? new Decimal(0)
      const pendiente = c.total.minus(pagado)
      if (pendiente.lessThanOrEqualTo(0)) continue

      const vencimiento = computeComprobanteVencimiento(c, c.proveedor)
      const estado = classifyFacturaPendienteEstado(
        vencimiento,
        asOf,
        config.diasPrevioAviso,
        config.diasCritico,
      )
      if (filters?.estado != null && estado !== filters.estado) continue

      const diasHastaVencimiento = calendarDaysBetween(asOf, vencimiento)
      const diasVencido = diasHastaVencimiento < 0 ? -diasHastaVencimiento : 0

      rows.push({
        comprobanteCompraId: c.id,
        proveedorId: c.proveedorId,
        proveedorCodigo: c.proveedor.codigo,
        proveedorRsocial: c.proveedor.rsocial,
        facturaRef: formatComprobanteRef(c.tipo, c.prefijo, c.numero),
        fecha: c.fecha.toISOString(),
        vencimiento: vencimiento.toISOString(),
        total: decimalToMoneyString(c.total),
        pagado: decimalToMoneyString(pagado),
        pendiente: decimalToMoneyString(pendiente),
        estado,
        diasHastaVencimiento,
        diasVencido,
      })
    }

    return rows.sort((a, b) => new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime())
  }

  async getDashboardTotals(tenantId: number, asOf = new Date()): Promise<FacturasPagarDashboardTotals> {
    const rows = await this.listFacturasPendientes(tenantId, undefined, asOf)
    let vencidoCount = 0
    let vencidoTotal = 0
    let proximoCount = 0
    let proximoTotal = 0

    for (const row of rows) {
      const amount = Number.parseFloat(row.pendiente)
      if (row.estado === 'proxima_vencer') {
        proximoCount += 1
        proximoTotal += amount
      } else if (row.diasHastaVencimiento <= 0) {
        vencidoCount += 1
        vencidoTotal += amount
      }
    }

    return {
      vencido: { count: vencidoCount, total: vencidoTotal.toFixed(2) },
      proximoVencer: { count: proximoCount, total: proximoTotal.toFixed(2) },
    }
  }

  private async alreadySentToday(
    tenantId: number,
    comprobanteCompraId: number,
    tipo: AlertLogTipo,
  ): Promise<boolean> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const count = await this.prisma.alertaProveedorLog.count({
      where: { tenantId, comprobanteCompraId, tipo, enviadoAt: { gte: start } },
    })
    return count > 0
  }

  private notificationTypeForEstado(estado: FacturaPendienteEstado): NotificationType | null {
    switch (estado) {
      case 'proxima_vencer':
        return 'supplier_invoice_due_soon'
      case 'vencida_hoy':
        return 'supplier_invoice_overdue'
      case 'vencida_critica':
        return 'supplier_invoice_overdue_critical'
      default:
        return null
    }
  }

  private logTipoForEstado(estado: FacturaPendienteEstado): AlertLogTipo | null {
    switch (estado) {
      case 'proxima_vencer':
        return 'proxima_vencer'
      case 'vencida_hoy':
        return 'vencida_hoy'
      case 'vencida_critica':
        return 'vencida_critica'
      default:
        return null
    }
  }

  async sendAlertForRow(
    tenantId: number,
    row: FacturaPendienteRow,
    config: AlertaProveedorConfigDto,
  ): Promise<'sent' | 'skipped'> {
    const logTipo = this.logTipoForEstado(row.estado)
    const notifType = this.notificationTypeForEstado(row.estado)
    if (logTipo == null || notifType == null) return 'skipped'
    if (await this.alreadySentToday(tenantId, row.comprobanteCompraId, logTipo)) return 'skipped'

    const useEmail = config.notifEmail && isSmtpConfigured()
    const useInApp = config.notifInApp
    if (!useEmail && !useInApp) return 'skipped'

    await this.prisma.alertaProveedorLog.create({
      data: {
        tenantId,
        comprobanteCompraId: row.comprobanteCompraId,
        tipo: logTipo,
      },
    })

    await dispatchSupplierNotification(this.prisma, tenantId, notifType, {
      proveedorId: row.proveedorId,
      comprobanteCompraId: row.comprobanteCompraId,
      facturaRef: row.facturaRef,
      rsocial: row.proveedorRsocial,
      amount: row.pendiente,
      diasVencido: row.diasVencido,
      diasHastaVencimiento: row.diasHastaVencimiento,
    }, { inApp: useInApp, email: useEmail })

    return 'sent'
  }

  async shouldRunDailyJob(tenantId: number, now = new Date()): Promise<boolean> {
    const empresa = await this.prisma.paramEmpresa.findUnique({
      where: { tenantId },
      select: { timezone: true },
    })
    const tz = empresa?.timezone ?? 'America/Argentina/Buenos_Aires'
    const hour = getLocalHour(now, tz)
    const minute = getLocalMinute(now, tz)
    return hour === DAILY_JOB_LOCAL_HOUR && minute < DAILY_JOB_MINUTE_TOLERANCE
  }

  async runDailyJob(tenantId: number, now = new Date()): Promise<{ sent: number; skipped: number }> {
    if (!(await this.shouldRunDailyJob(tenantId, now))) {
      return { sent: 0, skipped: 0 }
    }
    const config = await this.getConfig(tenantId)
    const rows = await this.listFacturasPendientes(tenantId, undefined, now)
    let sent = 0
    let skipped = 0
    for (const row of rows) {
      if (row.estado === 'pendiente') {
        skipped += 1
        continue
      }
      const result = await this.sendAlertForRow(tenantId, row, config)
      if (result === 'sent') sent += 1
      else skipped += 1
    }
    return { sent, skipped }
  }

  async notifyCreditLimitIfExceeded(tenantId: number, proveedorId: number): Promise<void> {
    const config = await this.getConfig(tenantId)
    const cc = new ProveedorCuentaCorrienteService(this.prisma)
    const saldo = await cc.getSaldo(tenantId, proveedorId)
    if (!saldo || !saldo.excedeLimite) return

    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true, rsocial: true },
    })
    if (!proveedor) return

    const logTipo: AlertLogTipo = 'limite_credito'
    const lastComprobante = await this.prisma.comprobanteCompra.findFirst({
      where: { tenantId, proveedorId, estado: 'A' },
      orderBy: { id: 'desc' },
      select: { id: true },
    })
    if (!lastComprobante) return
    if (await this.alreadySentToday(tenantId, lastComprobante.id, logTipo)) return

    await this.prisma.alertaProveedorLog.create({
      data: {
        tenantId,
        comprobanteCompraId: lastComprobante.id,
        tipo: logTipo,
      },
    })

    const useEmail = config.notifEmail && isSmtpConfigured()
    const useInApp = config.notifInApp
    if (!useEmail && !useInApp) return

    await dispatchSupplierNotification(
      this.prisma,
      tenantId,
      'supplier_credit_limit_exceeded',
      {
        proveedorId: proveedor.id,
        rsocial: proveedor.rsocial,
        amount: saldo.saldo,
        limit: saldo.limiteCredito ?? undefined,
      },
      { inApp: useInApp, email: useEmail },
    )
  }
}
