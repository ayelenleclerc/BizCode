import type { MercadoPagoRefund, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { writeAuditEvent } from '../audit'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  createMercadoPagoRefund,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import { mercadoPagoAmountsMatchExact } from '../lib/mercadopagoFacturaPendiente'
import type { ServiceResult } from './serviceResults'
import { FacturaService } from './FacturaService'
import { ReciboCobroService } from './ReciboCobroService'

export type MercadoPagoRefundDto = {
  id: number
  facturaId: number
  mpPaymentId: string
  mpRefundId: string | null
  monto: string
  motivo: string
  estado: 'iniciado' | 'procesando' | 'completado' | 'fallido'
  notaCreditoId: number | null
  reciboCobroId: number | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type MercadoPagoRefundStatusDto = {
  originalPaymentAmount: string
  refundableBalance: string
  refunds: MercadoPagoRefundDto[]
}

function mapRefund(row: MercadoPagoRefund): MercadoPagoRefundDto {
  return {
    id: row.id,
    facturaId: row.facturaId,
    mpPaymentId: row.mpPaymentId,
    mpRefundId: row.mpRefundId,
    monto: row.monto.toFixed(2),
    motivo: row.motivo,
    estado: row.estado as MercadoPagoRefundDto['estado'],
    notaCreditoId: row.notaCreditoId,
    reciboCobroId: row.reciboCobroId,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

type ProcessedPaymentContext = {
  mpPaymentId: string
  reciboCobroId: number
  reciboCobro: {
    id: number
    totalCobrado: Decimal
    estado: string
    clienteId: number
    numero: number
  }
  originalPaymentAmount: number
  refundedSoFar: number
  refundableBalance: number
}

/**
 * @en Mercado Pago refund orchestration — total (#179) and partial (#344).
 * @es Orquestación de reembolso Mercado Pago — total (#179) y parcial (#344).
 * @pt-BR Orquestração de reembolso Mercado Pago — total (#179) e parcial (#344).
 */
export class MercadoPagoRefundService {
  private readonly reciboCobro: ReciboCobroService
  private readonly factura: FacturaService

  constructor(private readonly prisma: PrismaClient) {
    this.reciboCobro = new ReciboCobroService(prisma)
    this.factura = new FacturaService(prisma)
  }

  async getStatusByFactura(tenantId: number, facturaId: number): Promise<MercadoPagoRefundStatusDto> {
    const context = await this.resolveProcessedPayment(tenantId, facturaId)
    const refunds = await this.prisma.mercadoPagoRefund.findMany({
      where: { tenantId, facturaId },
      orderBy: { id: 'desc' },
    })

    if (!context) {
      return {
        originalPaymentAmount: '0.00',
        refundableBalance: '0.00',
        refunds: refunds.map(mapRefund),
      }
    }

    return {
      originalPaymentAmount: context.originalPaymentAmount.toFixed(2),
      refundableBalance: context.refundableBalance.toFixed(2),
      refunds: refunds.map(mapRefund),
    }
  }

  /** @deprecated Use getStatusByFactura — kept for backward-compatible callers. */
  async getByFactura(tenantId: number, facturaId: number): Promise<MercadoPagoRefundDto | null> {
    const row = await this.prisma.mercadoPagoRefund.findFirst({
      where: { tenantId, facturaId },
      orderBy: { id: 'desc' },
    })
    return row ? mapRefund(row) : null
  }

  private async resolveProcessedPayment(
    tenantId: number,
    facturaId: number,
  ): Promise<ProcessedPaymentContext | null> {
    const processed = await this.prisma.mercadoPagoProcessedPayment.findFirst({
      where: { tenantId, facturaId, estado: 'approved', reciboCobroId: { not: null } },
      orderBy: { id: 'desc' },
      include: {
        reciboCobro: {
          select: { id: true, totalCobrado: true, estado: true, clienteId: true, numero: true },
        },
      },
    })
    if (!processed?.reciboCobro || processed.reciboCobro.estado !== 'emitido') {
      return null
    }

    const originalPaymentAmount = processed.reciboCobro.totalCobrado.toNumber()
    const refundedAgg = await this.prisma.mercadoPagoRefund.aggregate({
      where: { tenantId, facturaId, estado: 'completado' },
      _sum: { monto: true },
    })
    const refundedSoFar = refundedAgg._sum.monto?.toNumber() ?? 0
    const refundableBalance = Math.max(0, originalPaymentAmount - refundedSoFar)

    return {
      mpPaymentId: processed.mpPaymentId,
      reciboCobroId: processed.reciboCobroId!,
      reciboCobro: processed.reciboCobro,
      originalPaymentAmount,
      refundedSoFar,
      refundableBalance,
    }
  }

  async refundTotal(
    tenantId: number,
    facturaId: number,
    userId: number,
    input: { motivo: string; monto?: number; ipAddress?: string | null },
  ): Promise<ServiceResult<MercadoPagoRefundDto>> {
    const motivo = input.motivo.trim()
    if (motivo.length < 10) {
      return { ok: false, status: 422, error: 'motivo must be at least 10 characters' }
    }

    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: {
        id: true,
        estado: true,
        mpEstado: true,
        clienteId: true,
        total: true,
      },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }
    if (factura.estado !== 'A') {
      return { ok: false, status: 409, error: 'Factura is not active' }
    }
    if (factura.mpEstado !== 'approved') {
      return { ok: false, status: 422, error: 'Invoice has no approved Mercado Pago payment' }
    }

    const inProgress = await this.prisma.mercadoPagoRefund.findFirst({
      where: {
        tenantId,
        facturaId,
        estado: { in: ['iniciado', 'procesando'] },
      },
    })
    if (inProgress) {
      return { ok: false, status: 409, error: 'Refund already in progress' }
    }

    const context = await this.resolveProcessedPayment(tenantId, facturaId)
    if (!context) {
      return { ok: false, status: 422, error: 'No active Mercado Pago receipt found for invoice' }
    }

    const requestedMonto = input.monto ?? context.refundableBalance
    if (requestedMonto <= 0) {
      return { ok: false, status: 422, error: 'Refund amount must be positive' }
    }
    if (requestedMonto > context.refundableBalance) {
      return { ok: false, status: 422, error: 'exceeds_refundable_balance' }
    }

    const isFullRefund = mercadoPagoAmountsMatchExact(
      requestedMonto,
      new Decimal(context.refundableBalance),
    )

    const mpConfig = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: { activo: true, accessTokenEncrypted: true },
    })
    if (!mpConfig?.activo) {
      return { ok: false, status: 422, error: 'Mercado Pago integration is not active' }
    }

    const refundRow = await this.prisma.mercadoPagoRefund.create({
      data: {
        tenantId,
        facturaId,
        mpPaymentId: context.mpPaymentId,
        monto: new Decimal(requestedMonto),
        motivo,
        estado: 'iniciado',
        reciboCobroId: context.reciboCobroId,
        createdByUserId: userId,
      },
    })

    let mpRefundId: string
    try {
      const accessToken = decryptFiscalSecret(mpConfig.accessTokenEncrypted)
      const mpResult = await createMercadoPagoRefund(accessToken, context.mpPaymentId, {
        amount: requestedMonto,
      })
      mpRefundId = String(mpResult.id)
    } catch (err: unknown) {
      const message =
        err instanceof MercadoPagoApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Mercado Pago refund failed'
      await this.prisma.mercadoPagoRefund.update({
        where: { id: refundRow.id },
        data: { estado: 'fallido', errorMessage: message.slice(0, 500) },
      })
      await writeAuditEvent({
        prisma: this.prisma,
        tenantId,
        userId,
        action: 'mercadopago_refund',
        resource: 'mercadopago_refund',
        resourceId: String(refundRow.id),
        ipAddress: input.ipAddress ?? null,
        metadata: {
          facturaId,
          estado: 'fallido',
          monto: requestedMonto,
          motivo,
          partial: !isFullRefund,
          error: message,
        },
      })
      return { ok: false, status: 502, error: message }
    }

    await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRow.id },
      data: { estado: 'procesando', mpRefundId },
    })

    if (isFullRefund) {
      return this.completeFullRefund(
        tenantId,
        facturaId,
        factura.clienteId,
        userId,
        refundRow.id,
        context,
        mpRefundId,
        motivo,
        requestedMonto,
        input.ipAddress ?? null,
      )
    }

    return this.completePartialRefund(
      tenantId,
      facturaId,
      factura.clienteId,
      userId,
      refundRow.id,
      context,
      mpRefundId,
      motivo,
      requestedMonto,
      input.ipAddress ?? null,
    )
  }

  private async completeFullRefund(
    tenantId: number,
    facturaId: number,
    clienteId: number,
    userId: number,
    refundRowId: number,
    context: ProcessedPaymentContext,
    mpRefundId: string,
    motivo: string,
    monto: number,
    ipAddress: string | null,
  ): Promise<ServiceResult<MercadoPagoRefundDto>> {
    const voidRecibo = await this.reciboCobro.voidRecibo(
      tenantId,
      clienteId,
      context.reciboCobro.id,
      userId,
      `Reembolso MP: ${motivo}`,
    )
    if (!voidRecibo.ok) {
      return this.failRefund(refundRowId, tenantId, userId, facturaId, mpRefundId, ipAddress, {
        error: `MP refund OK but receipt void failed: ${voidRecibo.error}`,
        status: voidRecibo.status,
        partial: false,
      })
    }

    const voidFactura = await this.factura.void(tenantId, facturaId, motivo, {
      userId,
      ipAddress,
    })
    if (!voidFactura.ok) {
      return this.failRefund(refundRowId, tenantId, userId, facturaId, mpRefundId, ipAddress, {
        error: `MP refund OK but invoice void failed: ${voidFactura.error}`,
        status: voidFactura.status,
        partial: false,
      })
    }

    await this.prisma.factura.update({
      where: { id: facturaId },
      data: { mpEstado: 'refunded' },
    })

    const completed = await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRowId },
      data: {
        estado: 'completado',
        notaCreditoId: voidFactura.data.notaCredito.id,
      },
    })

    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId,
      action: 'mercadopago_refund',
      resource: 'mercadopago_refund',
      resourceId: String(completed.id),
      ipAddress,
      metadata: {
        facturaId,
        mpPaymentId: context.mpPaymentId,
        mpRefundId,
        monto,
        motivo,
        partial: false,
        notaCreditoId: voidFactura.data.notaCredito.id,
        reciboCobroId: context.reciboCobroId,
      },
    })

    return { ok: true, data: mapRefund(completed) }
  }

  private async completePartialRefund(
    tenantId: number,
    facturaId: number,
    clienteId: number,
    userId: number,
    refundRowId: number,
    context: ProcessedPaymentContext,
    mpRefundId: string,
    motivo: string,
    monto: number,
    ipAddress: string | null,
  ): Promise<ServiceResult<MercadoPagoRefundDto>> {
    const reversal = await this.reciboCobro.recordPartialRefundReversal(
      tenantId,
      clienteId,
      context.reciboCobro.id,
      userId,
      new Decimal(monto),
      motivo,
      refundRowId,
    )
    if (!reversal.ok) {
      return this.failRefund(refundRowId, tenantId, userId, facturaId, mpRefundId, ipAddress, {
        error: `MP refund OK but receipt reversal failed: ${reversal.error}`,
        status: reversal.status,
        partial: true,
      })
    }

    const partialNc = await this.factura.createPartialCreditNote(
      tenantId,
      facturaId,
      new Decimal(monto),
      motivo,
      { userId, ipAddress },
    )
    if (!partialNc.ok) {
      return this.failRefund(refundRowId, tenantId, userId, facturaId, mpRefundId, ipAddress, {
        error: `MP refund OK but partial credit note failed: ${partialNc.error}`,
        status: partialNc.status,
        partial: true,
      })
    }

    const completed = await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRowId },
      data: {
        estado: 'completado',
        notaCreditoId: partialNc.data.notaCredito.id,
      },
    })

    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId,
      action: 'mercadopago_refund',
      resource: 'mercadopago_refund',
      resourceId: String(completed.id),
      ipAddress,
      metadata: {
        facturaId,
        mpPaymentId: context.mpPaymentId,
        mpRefundId,
        monto,
        motivo,
        partial: true,
        notaCreditoId: partialNc.data.notaCredito.id,
        reciboCobroId: context.reciboCobroId,
      },
    })

    return { ok: true, data: mapRefund(completed) }
  }

  private async failRefund(
    refundRowId: number,
    tenantId: number,
    userId: number,
    facturaId: number,
    mpRefundId: string,
    ipAddress: string | null,
    params: { error: string; status: number; partial: boolean },
  ): Promise<ServiceResult<MercadoPagoRefundDto>> {
    const failed = await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRowId },
      data: {
        estado: 'fallido',
        errorMessage: params.error.slice(0, 500),
      },
    })
    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId,
      action: 'mercadopago_refund',
      resource: 'mercadopago_refund',
      resourceId: String(failed.id),
      ipAddress,
      metadata: {
        facturaId,
        estado: 'fallido',
        mpRefundId,
        partial: params.partial,
        error: params.error,
      },
    })
    return { ok: false, status: params.status, error: params.error }
  }
}
