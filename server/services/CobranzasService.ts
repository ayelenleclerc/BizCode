import type { PrismaClient } from '@prisma/client'
import { dispatchNotification } from '../channels'
import { computeDaysPastDue } from './ReportesFinancierosService'
import type { ServiceResult } from './serviceResults'

export type FacturaVencidaRow = {
  facturaId: number
  clienteId: number
  rsocial: string
  total: string
  fecha: string
  diasMora: number
}

/**
 * @en Overdue invoice reminders (#134).
 * @es Recordatorios de facturas vencidas (#134).
 * @pt-BR Lembretes de faturas vencidas (#134).
 */
export class CobranzasService {
  constructor(private readonly prisma: PrismaClient) {}

  async listVencidas(tenantId: number, asOf = new Date()): Promise<FacturaVencidaRow[]> {
    const empresa = await this.prisma.paramEmpresa.findUnique({
      where: { tenantId },
      select: { recordatorioDiasGracia: true },
    })
    const grace = empresa?.recordatorioDiasGracia ?? 0

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

  /** @en True when local hour is within configured business window (job only). */
  isWithinBusinessWindow(now: Date): boolean {
    const start = Number(process.env.BIZCODE_COBRANZAS_HORA_INICIO ?? 8)
    const end = Number(process.env.BIZCODE_COBRANZAS_HORA_FIN ?? 18)
    const hour = now.getHours()
    return hour >= start && hour < end
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

    const empresa = await this.prisma.paramEmpresa.findUnique({
      where: { tenantId },
      select: { recordatorioDiasGracia: true },
    })
    const grace = empresa?.recordatorioDiasGracia ?? 0
    const dias =
      computeDaysPastDue(factura.fecha, factura.cliente.creditDays, new Date()) - grace
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
    })

    return { ok: true, data: { id: row.id } }
  }

  async runDailyJob(tenantId: number, canal = 'email', now = new Date()): Promise<{ sent: number; skipped: number }> {
    if (!this.isWithinBusinessWindow(now)) {
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
