import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { ContratoInput } from '@bizcode/types'
import { calculateInvoice, calculateItemSubtotal } from '../../web/src/lib/invoice'
import { computeNextBillingDate, type BillingFrecuencia } from '../lib/computeNextBillingDate'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { FacturaService } from './FacturaService'

export type ContratoBillingSummary = {
  processed: number
  invoicesCreated: number
  adjustmentsApplied: number
  skipped: number
  errors: number
}

const EMPTY_SUMMARY: ContratoBillingSummary = {
  processed: 0,
  invoicesCreated: 0,
  adjustmentsApplied: 0,
  skipped: 0,
  errors: 0,
}

const billingContratoInclude = {
  cliente: { select: { condIva: true } },
  items: true,
  ajuste: true,
} satisfies Prisma.ContratoInclude

type BillingContrato = Prisma.ContratoGetPayload<{ include: typeof billingContratoInclude }>

function utcDayStart(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

function utcNextDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + 1))
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function addSummary(target: ContratoBillingSummary, value: ContratoBillingSummary): void {
  target.processed += value.processed
  target.invoicesCreated += value.invoicesCreated
  target.adjustmentsApplied += value.adjustmentsApplied
  target.skipped += value.skipped
  target.errors += value.errors
}

/**
 * @en Generates due recurring invoices and applies scheduled fixed adjustments.
 * @es Genera facturas recurrentes vencidas y aplica ajustes fijos programados.
 * @pt-BR Gera faturas recorrentes vencidas e aplica reajustes fixos programados.
 */
export class ContratoBillingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly facturaService: FacturaService = new FacturaService(prisma),
  ) {}

  async runDailyJob(tenantId?: number, now = new Date()): Promise<ContratoBillingSummary> {
    if (tenantId !== undefined) {
      return this.runForTenant(tenantId, now)
    }

    const rows = await this.prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summary = { ...EMPTY_SUMMARY }
    for (const row of rows) {
      try {
        addSummary(summary, await this.runForTenant(row.tenantId, now))
      } catch {
        summary.errors += 1
      }
    }
    return summary
  }

  private async runForTenant(tenantId: number, now: Date): Promise<ContratoBillingSummary> {
    const todayEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
    )
    const contratos = await this.prisma.contrato.findMany({
      where: {
        tenantId,
        estado: 'activo',
        proximaFact: { lte: todayEnd },
      },
      include: billingContratoInclude,
      orderBy: { proximaFact: 'asc' },
    })
    const summary = { ...EMPTY_SUMMARY }
    for (const contrato of contratos) {
      if (contrato.fechaFin && contrato.fechaFin.getTime() < contrato.proximaFact.getTime()) {
        continue
      }
      summary.processed += 1
      try {
        await this.processContrato(contrato, todayEnd, now, summary)
      } catch {
        summary.errors += 1
      }
    }
    return summary
  }

  private async processContrato(
    contrato: BillingContrato,
    todayEnd: Date,
    now: Date,
    summary: ContratoBillingSummary,
  ): Promise<void> {
    let billingPeriod = contrato.proximaFact
    while (billingPeriod.getTime() <= todayEnd.getTime()) {
      if (contrato.fechaFin && billingPeriod.getTime() > contrato.fechaFin.getTime()) break
      const nextBillingDate = computeNextBillingDate(
        contrato.diaDelMes,
        billingPeriod,
        contrato.frecuencia as BillingFrecuencia,
      )
      const existing = await this.prisma.factura.findFirst({
        where: {
          tenantId: contrato.tenantId,
          contratoId: contrato.id,
          fecha: { gte: utcDayStart(billingPeriod), lt: utcNextDay(billingPeriod) },
        },
        select: { id: true },
      })
      if (existing) {
        summary.skipped += 1
      } else {
        await this.createInvoice(contrato, billingPeriod)
        summary.invoicesCreated += 1
      }
      await this.prisma.contrato.update({
        where: { id: contrato.id },
        data: { proximaFact: nextBillingDate },
      })
      billingPeriod = nextBillingDate
    }

    if (
      contrato.ajuste?.tipo === 'porcentaje_fijo' &&
      contrato.ajuste.porcentaje !== null &&
      contrato.ajuste.proximoAjuste.getTime() <= now.getTime()
    ) {
      await this.applyFixedAdjustment(contrato)
      summary.adjustmentsApplied += 1
    }
  }

  private async createInvoice(contrato: BillingContrato, billingPeriod: Date): Promise<void> {
    const last = await this.prisma.factura.findFirst({
      where: {
        tenantId: contrato.tenantId,
        tipo: contrato.tipoFactura,
        prefijo: contrato.prefijo,
      },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const items = contrato.items.map((item) => ({
      articuloId: item.articuloId,
      descripcion: item.descripcion,
      condIva: item.condIva as '1' | '2' | '3',
      unidadServicio: item.unidadServicio as ContratoInput['items'][number]['unidadServicio'],
      cantidad: item.cantidad,
      precio: item.precioUnit.toNumber(),
      dscto: item.dscto.toNumber(),
      subtotal: calculateItemSubtotal(
        item.cantidad,
        item.precioUnit.toNumber(),
        item.dscto.toNumber(),
      ),
    }))
    const totals = calculateInvoice(
      items.map((item) => ({
        cantidad: item.cantidad,
        precio: item.precio,
        dscto: item.dscto,
        articuloIva: item.condIva,
      })),
      contrato.cliente.condIva,
    )
    const result = await this.facturaService.create(
      contrato.tenantId,
      {
        fecha: toDateOnly(billingPeriod),
        tipo: contrato.tipoFactura as 'A' | 'B',
        prefijo: contrato.prefijo,
        numero: (last?.numero ?? 0) + 1,
        clienteId: contrato.clienteId,
        ...totals,
        items,
      },
      resolveSystemUserId(),
      {
        contratoId: contrato.id,
        skipArcaCae: contrato.modoEmision === 'revision',
      },
    )
    if (!result.ok) {
      throw new Error(result.error)
    }
    await notifyManagers(this.prisma, contrato.tenantId, 'contract_invoice_generated', {
      contratoId: contrato.id,
      contratoNumero: contrato.numero,
      facturaId: result.data.factura.id,
    })
  }

  private async applyFixedAdjustment(contrato: BillingContrato): Promise<void> {
    const ajuste = contrato.ajuste
    if (!ajuste || ajuste.porcentaje === null) return
    const factor = new Decimal(1).plus(ajuste.porcentaje.dividedBy(100))
    const nextAdjustment = computeNextBillingDate(
      ajuste.proximoAjuste.getUTCDate(),
      ajuste.proximoAjuste,
      ajuste.frecuenciaAjuste as BillingFrecuencia,
    )
    const adjustedItems = contrato.items.map((item) => ({
      id: item.id,
      cantidad: item.cantidad,
      dscto: item.dscto,
      precioUnit: item.precioUnit.mul(factor).toDecimalPlaces(2),
    }))
    const montoBase = adjustedItems.reduce(
      (sum, item) =>
        sum.plus(
          item.precioUnit
            .mul(item.cantidad)
            .mul(new Decimal(1).minus(item.dscto.dividedBy(100))),
        ),
      new Decimal(0),
    ).toDecimalPlaces(2)
    await this.prisma.$transaction(async (tx) => {
      for (const item of adjustedItems) {
        await tx.contratoItem.update({
          where: { id: item.id },
          data: { precioUnit: item.precioUnit },
        })
      }
      await tx.contrato.update({
        where: { id: contrato.id },
        data: { montoBase },
      })
      await tx.contratoAjuste.update({
        where: { contratoId: contrato.id },
        data: { proximoAjuste: nextAdjustment },
      })
    })
    await notifyManagers(this.prisma, contrato.tenantId, 'contract_adjustment_due', {
      contratoId: contrato.id,
      contratoNumero: contrato.numero,
    })
  }
}
