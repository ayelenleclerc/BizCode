import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { calendarDaysBetween } from '../lib/proveedorVencimiento'
import { notifyFinanceStakeholders } from '../notifications'

const DUE_SOON_DAYS = 3

export type ChequePorVencerRow = {
  id: number
  numero: string
  banco: string
  monto: string
  fechaVencimiento: string
  diasHastaVencimiento: number
  clienteId: number | null
  clienteRsocial: string | null
}

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

/**
 * @en Check due-date alerts (#231).
 * @es Alertas de vencimiento de cheques (#231).
 * @pt-BR Alertas de vencimento de cheques (#231).
 */
export class ChequeAlertasService {
  constructor(private readonly prisma: PrismaClient) {}

  async listPorVencer(tenantId: number, asOf = new Date(), withinDays = DUE_SOON_DAYS): Promise<ChequePorVencerRow[]> {
    const limit = new Date(asOf)
    limit.setDate(limit.getDate() + withinDays)

    const rows = await this.prisma.cheque.findMany({
      where: {
        tenantId,
        estado: 'en_cartera',
        fechaVencimiento: { gte: asOf, lte: limit },
      },
      include: { cliente: { select: { id: true, rsocial: true } } },
      orderBy: { fechaVencimiento: 'asc' },
    })

    return rows.map((r) => ({
      id: r.id,
      numero: r.numero,
      banco: r.banco,
      monto: decimalToMoneyString(r.monto),
      fechaVencimiento: r.fechaVencimiento.toISOString(),
      diasHastaVencimiento: calendarDaysBetween(asOf, r.fechaVencimiento),
      clienteId: r.clienteId,
      clienteRsocial: r.cliente?.rsocial ?? null,
    }))
  }

  private async alreadyNotifiedToday(tenantId: number, chequeId: number): Promise<boolean> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const rows = await this.prisma.notification.findMany({
      where: { tenantId, type: 'cheque_due_soon', createdAt: { gte: start } },
      select: { payload: true },
    })
    return rows.some((row) => {
      const payload = row.payload as { chequeId?: number }
      return payload.chequeId === chequeId
    })
  }

  async runDailyJob(tenantId: number, asOf = new Date()): Promise<{ sent: number; skipped: number }> {
    const rows = await this.listPorVencer(tenantId, asOf, DUE_SOON_DAYS)
    let sent = 0
    let skipped = 0

    for (const row of rows) {
      if (await this.alreadyNotifiedToday(tenantId, row.id)) {
        skipped += 1
        continue
      }
      await notifyFinanceStakeholders(this.prisma, tenantId, 'cheque_due_soon', {
        chequeId: row.id,
        chequeNumero: row.numero,
        banco: row.banco,
        amount: row.monto,
        clienteId: row.clienteId ?? undefined,
        rsocial: row.clienteRsocial ?? undefined,
        diasHastaVencimiento: row.diasHastaVencimiento,
      })
      sent += 1
    }

    return { sent, skipped }
  }
}
