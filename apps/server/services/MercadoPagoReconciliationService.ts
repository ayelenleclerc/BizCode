import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  MercadoPagoApiError,
  searchMercadoPagoPayments,
  type MercadoPagoPaymentResult,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import {
  computeFacturaPendiente,
  mercadoPagoAmountsMatchExact,
} from '../lib/mercadopagoFacturaPendiente'
import { normalizeMercadoPagoIdentification } from '../lib/mercadopagoIdentification'
import {
  MP_RECONCILIATION_DAILY_JOB_LOCAL_HOUR,
  MP_RECONCILIATION_DAILY_JOB_MINUTE_TOLERANCE,
  MP_RECONCILIATION_LOOKBACK_DAYS,
  MP_RECONCILIATION_SEARCH_PAGE_SIZE,
} from '../lib/mercadopagoReconciliationConstants'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { getLocalHour, getLocalMinute } from '../lib/tenantLocalTime'
import { resolveSystemUserId } from '../lib/systemUserId'
import { ReciboCobroService } from './ReciboCobroService'
import {
  applyApprovedMercadoPagoPaymentOnce,
  isProcessedPaymentComplete,
} from './mercadoPagoPaymentIdempotency'
import type { ServiceResult } from './serviceResults'

export type MercadoPagoReconciliationEntryDto = {
  mpPaymentId: string
  transactionAmount: string
  currencyId: string
  paymentDate: string
  payerName: string | null
  payerEmail: string | null
  payerIdentification: string | null
  preferenceId: string | null
  externalReference: string | null
  createdAt: string
}

export type MercadoPagoReconciliationJobSummary = {
  processed: number
  autoReconciled: number
  queued: number
  skipped: number
}

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function payerDisplayName(payment: MercadoPagoPaymentResult): string | null {
  const payer = payment.payer
  if (!payer) return null
  const fullName = [payer.first_name, payer.last_name].filter(Boolean).join(' ').trim()
  return fullName.length > 0 ? fullName : null
}

function paymentDateFromResult(payment: MercadoPagoPaymentResult): Date {
  if (payment.date_created) {
    const parsed = new Date(payment.date_created)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

function buildSearchDateRange(lookbackDays: number): { beginDate: string; endDate: string } {
  return {
    beginDate: `NOW-${lookbackDays}DAYS`,
    endDate: 'NOW',
  }
}

/**
 * @en Mercado Pago payment reconciliation with open invoices (#178).
 * @es Reconciliación de pagos Mercado Pago con facturas abiertas (#178).
 * @pt-BR Reconciliação de pagamentos Mercado Pago com faturas em aberto (#178).
 */
export class MercadoPagoReconciliationService {
  private readonly reciboCobro: ReciboCobroService

  constructor(private readonly prisma: PrismaClient) {
    this.reciboCobro = new ReciboCobroService(prisma)
  }

  private shouldRunDailyJob(now: Date, timezone: string): boolean {
    const hour = getLocalHour(now, timezone)
    const minute = getLocalMinute(now, timezone)
    return hour === MP_RECONCILIATION_DAILY_JOB_LOCAL_HOUR && minute < MP_RECONCILIATION_DAILY_JOB_MINUTE_TOLERANCE
  }

  private mapEntry(row: {
    mpPaymentId: string
    transactionAmount: Decimal
    currencyId: string
    paymentDate: Date
    payerName: string | null
    payerEmail: string | null
    payerIdentification: string | null
    preferenceId: string | null
    externalReference: string | null
    createdAt: Date
  }): MercadoPagoReconciliationEntryDto {
    return {
      mpPaymentId: row.mpPaymentId,
      transactionAmount: decimalToMoneyString(row.transactionAmount),
      currencyId: row.currencyId,
      paymentDate: row.paymentDate.toISOString(),
      payerName: row.payerName,
      payerEmail: row.payerEmail,
      payerIdentification: row.payerIdentification,
      preferenceId: row.preferenceId,
      externalReference: row.externalReference,
      createdAt: row.createdAt.toISOString(),
    }
  }

  async listPending(tenantId: number): Promise<MercadoPagoReconciliationEntryDto[]> {
    const rows = await this.prisma.mercadoPagoReconciliationEntry.findMany({
      where: { tenantId, estado: 'pending' },
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
    })
    return rows.map((row) => this.mapEntry(row))
  }

  private async isPaymentAlreadyReconciled(tenantId: number, mpPaymentId: string): Promise<boolean> {
    const processed = await this.prisma.mercadoPagoProcessedPayment.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
      select: { reciboCobroId: true, estado: true },
    })
    // Finished processed rows (including approved with null recibo when balance was 0) (#446).
    if (processed && isProcessedPaymentComplete(processed)) return true

    const entry = await this.prisma.mercadoPagoReconciliationEntry.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
      select: { estado: true },
    })
    return entry?.estado === 'reconciled' || entry?.estado === 'ignored'
  }

  private async findUniqueAutoMatchFactura(
    tenantId: number,
    payerIdentification: string | null,
    transactionAmount: number,
  ): Promise<{ id: number; clienteId: number; tipo: string; prefijo: string; numero: number; total: Decimal } | null> {
    const normalizedId = normalizeMercadoPagoIdentification(payerIdentification)
    if (!normalizedId) return null

    const clientes = await this.prisma.cliente.findMany({
      where: { tenantId, activo: true, cuit: { not: null } },
      select: { id: true, cuit: true },
    })
    const matchingClientes = clientes.filter(
      (cliente) => normalizeMercadoPagoIdentification(cliente.cuit) === normalizedId,
    )
    if (matchingClientes.length !== 1) return null

    const clienteId = matchingClientes[0].id
    const facturas = await this.prisma.factura.findMany({
      where: { tenantId, clienteId, estado: 'A' },
      select: { id: true, clienteId: true, tipo: true, prefijo: true, numero: true, total: true },
    })

    const exactMatches: Array<{
      id: number
      clienteId: number
      tipo: string
      prefijo: string
      numero: number
      total: Decimal
    }> = []

    for (const factura of facturas) {
      const pendiente = await computeFacturaPendiente(this.prisma, {
        tenantId,
        clienteId,
        facturaId: factura.id,
        total: factura.total,
      })
      if (pendiente.lessThanOrEqualTo(0)) continue
      if (mercadoPagoAmountsMatchExact(transactionAmount, pendiente)) {
        exactMatches.push(factura)
      }
    }

    return exactMatches.length === 1 ? exactMatches[0] : null
  }

  private async applyApprovedPaymentOnce(input: {
    tenantId: number
    userId: number
    mpPaymentId: string
    factura: { id: number; clienteId: number; tipo: string; prefijo: string; numero: number; total: Decimal }
    transactionAmount: number
  }): Promise<ServiceResult<{ reciboCobroId: number | null; skipped: boolean }>> {
    const applied = await applyApprovedMercadoPagoPaymentOnce(this.prisma, this.reciboCobro, {
      tenantId: input.tenantId,
      mpPaymentId: input.mpPaymentId,
      factura: input.factura,
      transactionAmount: input.transactionAmount,
      usuarioId: input.userId,
      notifyOnApply: true,
    })
    if (!applied.ok) {
      const status = applied.error === 'Invoice has no open balance' ? 409 : 422
      return { ok: false, status, error: applied.error }
    }
    return {
      ok: true,
      data: { reciboCobroId: applied.reciboCobroId, skipped: applied.skipped },
    }
  }

  private async markPaymentReconciled(input: {
    tenantId: number
    payment: MercadoPagoPaymentResult
    facturaId: number
    reciboCobroId: number | null
    autoMatched: boolean
    userId: number | null
  }): Promise<void> {
    const mpPaymentId = String(input.payment.id)
    const paymentDate = paymentDateFromResult(input.payment)
    const amount = new Decimal(input.payment.transaction_amount ?? 0)

    await this.prisma.mercadoPagoReconciliationEntry.upsert({
      where: { tenantId_mpPaymentId: { tenantId: input.tenantId, mpPaymentId } },
      create: {
        tenantId: input.tenantId,
        mpPaymentId,
        estado: 'reconciled',
        transactionAmount: amount,
        currencyId: input.payment.currency_id ?? 'ARS',
        paymentDate,
        payerName: payerDisplayName(input.payment),
        payerEmail: input.payment.payer?.email ?? null,
        payerIdentification: input.payment.payer?.identification?.number ?? null,
        preferenceId: input.payment.preference_id ?? null,
        externalReference: input.payment.external_reference ?? null,
        facturaId: input.facturaId,
        reciboCobroId: input.reciboCobroId,
        autoMatched: input.autoMatched,
        reconciledByUserId: input.userId,
        reconciledAt: new Date(),
      },
      update: {
        estado: 'reconciled',
        facturaId: input.facturaId,
        reciboCobroId: input.reciboCobroId,
        autoMatched: input.autoMatched,
        reconciledByUserId: input.userId,
        reconciledAt: new Date(),
      },
    })
  }

  private async queuePendingPayment(tenantId: number, payment: MercadoPagoPaymentResult): Promise<void> {
    const mpPaymentId = String(payment.id)
    const paymentDate = paymentDateFromResult(payment)
    const amount = new Decimal(payment.transaction_amount ?? 0)

    await this.prisma.mercadoPagoReconciliationEntry.upsert({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
      create: {
        tenantId,
        mpPaymentId,
        estado: 'pending',
        transactionAmount: amount,
        currencyId: payment.currency_id ?? 'ARS',
        paymentDate,
        payerName: payerDisplayName(payment),
        payerEmail: payment.payer?.email ?? null,
        payerIdentification: payment.payer?.identification?.number ?? null,
        preferenceId: payment.preference_id ?? null,
        externalReference: payment.external_reference ?? null,
      },
      update: {
        transactionAmount: amount,
        currencyId: payment.currency_id ?? 'ARS',
        paymentDate,
        payerName: payerDisplayName(payment),
        payerEmail: payment.payer?.email ?? null,
        payerIdentification: payment.payer?.identification?.number ?? null,
        preferenceId: payment.preference_id ?? null,
        externalReference: payment.external_reference ?? null,
      },
    })
  }

  private async processPayment(
    tenantId: number,
    payment: MercadoPagoPaymentResult,
    systemUserId: number,
  ): Promise<'autoReconciled' | 'queued' | 'skipped'> {
    if (payment.status.toLowerCase() !== 'approved') return 'skipped'

    const mpPaymentId = String(payment.id)
    if (await this.isPaymentAlreadyReconciled(tenantId, mpPaymentId)) return 'skipped'

    const transactionAmount = payment.transaction_amount ?? 0
    const autoFactura = await this.findUniqueAutoMatchFactura(
      tenantId,
      payment.payer?.identification?.number ?? null,
      transactionAmount,
    )

    if (autoFactura) {
      const applied = await this.applyApprovedPaymentOnce({
        tenantId,
        userId: systemUserId,
        mpPaymentId,
        factura: autoFactura,
        transactionAmount,
      })
      if (applied.ok) {
        await this.markPaymentReconciled({
          tenantId,
          payment,
          facturaId: autoFactura.id,
          reciboCobroId: applied.data.reciboCobroId,
          autoMatched: true,
          userId: null,
        })
        return 'autoReconciled'
      }
    }

    await this.queuePendingPayment(tenantId, payment)
    return 'queued'
  }

  async runDailyJob(
    tenantId: number,
    now = new Date(),
    options?: { force?: boolean },
  ): Promise<MercadoPagoReconciliationJobSummary> {
    const summary: MercadoPagoReconciliationJobSummary = {
      processed: 0,
      autoReconciled: 0,
      queued: 0,
      skipped: 0,
    }

    const empresa = await this.prisma.paramEmpresa.findUnique({
      where: { tenantId },
      select: { timezone: true },
    })
    const timezone = empresa?.timezone?.trim() || 'America/Argentina/Buenos_Aires'

    if (!options?.force && !this.shouldRunDailyJob(now, timezone)) {
      return summary
    }

    const mpRow = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: { activo: true, accessTokenEncrypted: true },
    })
    if (!mpRow?.activo) return summary

    let payments: MercadoPagoPaymentResult[] = []
    try {
      const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
      const range = buildSearchDateRange(MP_RECONCILIATION_LOOKBACK_DAYS)
      let offset = 0
      for (;;) {
        const page = await searchMercadoPagoPayments(accessToken, {
          beginDate: range.beginDate,
          endDate: range.endDate,
          offset,
          limit: MP_RECONCILIATION_SEARCH_PAGE_SIZE,
        })
        payments = payments.concat(page.results)
        const nextOffset = offset + page.results.length
        if (nextOffset >= page.paging.total || page.results.length === 0) break
        offset = nextOffset
      }
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        console.warn(
          '[mercadopago-reconciliation] search_error',
          'tenant',
          tenantId,
          'status',
          err.status,
        )
      }
      return summary
    }

    const systemUserId = resolveSystemUserId()
    for (const payment of payments) {
      summary.processed += 1
      const outcome = await this.processPayment(tenantId, payment, systemUserId)
      if (outcome === 'autoReconciled') summary.autoReconciled += 1
      else if (outcome === 'queued') summary.queued += 1
      else summary.skipped += 1
    }

    return summary
  }

  async reconcileManual(
    tenantId: number,
    userId: number,
    input: { mpPaymentId: string; facturaId: number },
  ): Promise<ServiceResult<MercadoPagoReconciliationEntryDto>> {
    const mpPaymentId = input.mpPaymentId.trim()
    if (!mpPaymentId) {
      return { ok: false, status: 422, error: 'mpPaymentId is required' }
    }

    if (await this.isPaymentAlreadyReconciled(tenantId, mpPaymentId)) {
      return { ok: false, status: 409, error: 'Payment already reconciled or ignored' }
    }

    const entry = await this.prisma.mercadoPagoReconciliationEntry.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
    })
    if (!entry || entry.estado !== 'pending') {
      return { ok: false, status: 404, error: 'Pending reconciliation entry not found' }
    }

    const factura = await this.prisma.factura.findFirst({
      where: { id: input.facturaId, tenantId, estado: 'A' },
      select: { id: true, clienteId: true, tipo: true, prefijo: true, numero: true, total: true },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Invoice not found' }
    }

    const pendiente = await computeFacturaPendiente(this.prisma, {
      tenantId,
      clienteId: factura.clienteId,
      facturaId: factura.id,
      total: factura.total,
    })
    if (!mercadoPagoAmountsMatchExact(entry.transactionAmount.toNumber(), pendiente)) {
      return { ok: false, status: 422, error: 'Payment amount does not match invoice balance' }
    }

    const applied = await this.applyApprovedPaymentOnce({
      tenantId,
      userId,
      mpPaymentId,
      factura,
      transactionAmount: entry.transactionAmount.toNumber(),
    })
    if (!applied.ok) {
      return { ok: false, status: applied.status, error: applied.error }
    }

    const paymentStub: MercadoPagoPaymentResult = {
      id: Number.parseInt(mpPaymentId, 10) || 0,
      status: 'approved',
      external_reference: entry.externalReference,
      transaction_amount: entry.transactionAmount.toNumber(),
      preference_id: entry.preferenceId,
      currency_id: entry.currencyId,
      date_created: entry.paymentDate.toISOString(),
      payer: {
        email: entry.payerEmail,
        first_name: entry.payerName,
        identification: entry.payerIdentification
          ? { number: entry.payerIdentification }
          : null,
      },
    }

    await this.markPaymentReconciled({
      tenantId,
      payment: paymentStub,
      facturaId: factura.id,
      reciboCobroId: applied.data.reciboCobroId,
      autoMatched: false,
      userId,
    })

    const updated = await this.prisma.mercadoPagoReconciliationEntry.findUniqueOrThrow({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
    })
    return { ok: true, data: this.mapEntry(updated) }
  }

  async ignore(
    tenantId: number,
    userId: number,
    mpPaymentIdRaw: string,
  ): Promise<ServiceResult<{ mpPaymentId: string }>> {
    const mpPaymentId = mpPaymentIdRaw.trim()
    if (!mpPaymentId) {
      return { ok: false, status: 422, error: 'mpPaymentId is required' }
    }

    const entry = await this.prisma.mercadoPagoReconciliationEntry.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
    })
    if (!entry || entry.estado !== 'pending') {
      return { ok: false, status: 404, error: 'Pending reconciliation entry not found' }
    }

    await this.prisma.mercadoPagoReconciliationEntry.update({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
      data: {
        estado: 'ignored',
        ignoredByUserId: userId,
        ignoredAt: new Date(),
      },
    })

    console.info(
      '[mercadopago-reconciliation] ignored',
      'tenant',
      tenantId,
      'payment',
      sanitizeLogField(mpPaymentId),
    )

    return { ok: true, data: { mpPaymentId } }
  }
}
