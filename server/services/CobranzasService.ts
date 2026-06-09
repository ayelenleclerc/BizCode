import type { PrismaClient } from '@prisma/client'
import { dispatchNotification } from '../channels'
import {
  type CobranzasReminderSettings,
  reminderSettingsFromParamEmpresa,
} from '../lib/cobranzasReminderDefaults'
import {
  getLocalHour,
  getLocalMinute,
  isWithinHourRange,
} from '../lib/tenantLocalTime'
import { computeDaysPastDue } from './ReportesFinancierosService'
import type { ServiceResult } from './serviceResults'

export type { CobranzasReminderSettings }

export type FacturaVencidaRow = {
  facturaId: number
  clienteId: number
  rsocial: string
  total: string
  fecha: string
  diasMora: number
}

const DAILY_JOB_LOCAL_HOUR = 8
const DAILY_JOB_MINUTE_TOLERANCE = 15

/**
 * @en Overdue invoice reminders (#134).
 * @es Recordatorios de facturas vencidas (#134).
 * @pt-BR Lembretes de faturas vencidas (#134).
 */
export class CobranzasService {
  constructor(private readonly prisma: PrismaClient) {}

  private async getReminderSettings(tenantId: number): Promise<CobranzasReminderSettings> {
    const row = await this.prisma.paramEmpresa.findUnique({
      where: { tenantId },
      select: {
        recordatorioDiasGracia: true,
        timezone: true,
        recordatorioHoraInicio: true,
        recordatorioHoraFin: true,
      },
    })
    return reminderSettingsFromParamEmpresa(row)
  }

  async listVencidas(tenantId: number, asOf = new Date()): Promise<FacturaVencidaRow[]> {
    const { recordatorioDiasGracia: grace } = await this.getReminderSettings(tenantId)

    const facturas = await this.prisma.factura.findMany({
      where: { tenantId, estado: 'A' },
      select: {
        id: true,
        clienteId: true,
        total: true,
        fecha: true,
        cliente: { select: { rsocial: true, creditDays: true } },
      },
    })

    const rows: FacturaVencidaRow[] = []
    for (const inv of facturas) {
      const dias = computeDaysPastDue(inv.fecha, inv.cliente.creditDays, asOf) - grace
      if (dias > 0) {
        rows.push({
          facturaId: inv.id,
          clienteId: inv.clienteId,
          rsocial: inv.cliente.rsocial,
          total: inv.total.toString(),
          fecha: inv.fecha.toISOString(),
          diasMora: dias,
        })
      }
    }
    return rows.sort((a, b) => b.diasMora - a.diasMora)
  }

  private async alreadySentToday(tenantId: number, facturaId: number): Promise<boolean> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const count = await this.prisma.cobroRecordatorio.count({
      where: { tenantId, facturaId, enviadoAt: { gte: start } },
    })
    return count > 0
  }

  /** @en True when tenant-local hour is within configured business window (job only). */
  isWithinBusinessWindow(now: Date, settings: CobranzasReminderSettings): boolean {
    return isWithinHourRange(
      now,
      settings.timezone,
      settings.recordatorioHoraInicio,
      settings.recordatorioHoraFin,
    )
  }

  /** @en True when tenant-local time is the 08:00 daily slot (minute &lt; 15 for hourly cron). */
  shouldRunDailyJob(now: Date, settings: CobranzasReminderSettings): boolean {
    const hour = getLocalHour(now, settings.timezone)
    const minute = getLocalMinute(now, settings.timezone)
    return hour === DAILY_JOB_LOCAL_HOUR && minute < DAILY_JOB_MINUTE_TOLERANCE
  }

  async sendReminder(
    tenantId: number,
    facturaId: number,
    canal: string,
  ): Promise<ServiceResult<{ id: number }>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId, estado: 'A' },
      include: { cliente: { select: { rsocial: true, creditDays: true } } },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    const settings = await this.getReminderSettings(tenantId)
    const dias =
      computeDaysPastDue(factura.fecha, factura.cliente.creditDays, new Date()) -
      settings.recordatorioDiasGracia
    if (dias <= 0) {
      return { ok: false, status: 422, error: 'FACTURA_NOT_OVERDUE' }
    }

    if (await this.alreadySentToday(tenantId, facturaId)) {
      return { ok: false, status: 409, error: 'REMINDER_ALREADY_SENT_TODAY' }
    }

    const row = await this.prisma.cobroRecordatorio.create({
      data: { tenantId, facturaId, canal },
    })

    await dispatchNotification(this.prisma, tenantId, 'invoice_overdue', {
      clienteId: factura.clienteId,
      rsocial: factura.cliente.rsocial,
      facturaId,
      amount: factura.total.toString(),
      diasMora: dias,
    })

    return { ok: true, data: { id: row.id } }
  }

  async runDailyJob(tenantId: number, canal = 'email', now = new Date()): Promise<{ sent: number; skipped: number }> {
    const settings = await this.getReminderSettings(tenantId)
    if (!this.shouldRunDailyJob(now, settings)) {
      return { sent: 0, skipped: 0 }
    }
    if (!this.isWithinBusinessWindow(now, settings)) {
      return { sent: 0, skipped: 0 }
    }
    const vencidas = await this.listVencidas(tenantId, now)
    let sent = 0
    let skipped = 0
    for (const row of vencidas) {
      if (await this.alreadySentToday(tenantId, row.facturaId)) {
        skipped += 1
        continue
      }
      const result = await this.sendReminder(tenantId, row.facturaId, canal)
      if (result.ok) sent += 1
      else skipped += 1
    }
    return { sent, skipped }
  }
}
