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

/**
 * @en Mercado Pago total refund orchestration (#179).
 * @es Orquestación de reembolso total Mercado Pago (#179).
 * @pt-BR Orquestração de reembolso total Mercado Pago (#179).
 */
export class MercadoPagoRefundService {
  private readonly reciboCobro: ReciboCobroService
  private readonly factura: FacturaService

  constructor(private readonly prisma: PrismaClient) {
    this.reciboCobro = new ReciboCobroService(prisma)
    this.factura = new FacturaService(prisma)
  }

  async getByFactura(tenantId: number, facturaId: number): Promise<MercadoPagoRefundDto | null> {
    const row = await this.prisma.mercadoPagoRefund.findFirst({
      where: { tenantId, facturaId },
      orderBy: { id: 'desc' },
    })
    return row ? mapRefund(row) : null
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

    const existingRefund = await this.prisma.mercadoPagoRefund.findFirst({
      where: {
        tenantId,
        facturaId,
        estado: { in: ['iniciado', 'procesando', 'completado'] },
      },
    })
    if (existingRefund) {
      return { ok: false, status: 409, error: 'Refund already in progress or completed' }
    }

    const processed = await this.prisma.mercadoPagoProcessedPayment.findFirst({
      where: { tenantId, facturaId, estado: 'approved', reciboCobroId: { not: null } },
      orderBy: { id: 'desc' },
      include: {
        reciboCobro: { select: { id: true, totalCobrado: true, estado: true, clienteId: true } },
      },
    })
    if (!processed?.reciboCobro || processed.reciboCobro.estado !== 'emitido') {
      return { ok: false, status: 422, error: 'No active Mercado Pago receipt found for invoice' }
    }

    const refundableTotal = processed.reciboCobro.totalCobrado.toNumber()
    const requestedMonto = input.monto ?? refundableTotal

    if (requestedMonto > refundableTotal) {
      return { ok: false, status: 422, error: 'Refund amount exceeds original payment' }
    }
    if (!mercadoPagoAmountsMatchExact(requestedMonto, processed.reciboCobro.totalCobrado)) {
      return {
        ok: false,
        status: 422,
        error: 'partial_refund_not_supported',
      }
    }

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
        mpPaymentId: processed.mpPaymentId,
        monto: new Decimal(refundableTotal),
        motivo,
        estado: 'iniciado',
        reciboCobroId: processed.reciboCobroId,
        createdByUserId: userId,
      },
    })

    let mpRefundId: string
    try {
      const accessToken = decryptFiscalSecret(mpConfig.accessTokenEncrypted)
      const mpResult = await createMercadoPagoRefund(accessToken, processed.mpPaymentId, {
        amount: refundableTotal,
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
        metadata: { facturaId, estado: 'fallido', monto: refundableTotal, motivo, error: message },
      })
      return { ok: false, status: 502, error: message }
    }

    await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRow.id },
      data: { estado: 'procesando', mpRefundId },
    })

    const voidRecibo = await this.reciboCobro.voidRecibo(
      tenantId,
      factura.clienteId,
      processed.reciboCobro.id,
      userId,
      `Reembolso MP: ${motivo}`,
    )
    if (!voidRecibo.ok) {
      const failed = await this.prisma.mercadoPagoRefund.update({
        where: { id: refundRow.id },
        data: {
          estado: 'fallido',
          errorMessage: `MP refund OK but receipt void failed: ${voidRecibo.error}`.slice(0, 500),
        },
      })
      await writeAuditEvent({
        prisma: this.prisma,
        tenantId,
        userId,
        action: 'mercadopago_refund',
        resource: 'mercadopago_refund',
        resourceId: String(failed.id),
        ipAddress: input.ipAddress ?? null,
        metadata: {
          facturaId,
          estado: 'fallido',
          mpRefundId,
          error: voidRecibo.error,
        },
      })
      return { ok: false, status: voidRecibo.status, error: voidRecibo.error }
    }

    const voidFactura = await this.factura.void(tenantId, facturaId, motivo, {
      userId,
      ipAddress: input.ipAddress ?? null,
    })
    if (!voidFactura.ok) {
      const failed = await this.prisma.mercadoPagoRefund.update({
        where: { id: refundRow.id },
        data: {
          estado: 'fallido',
          errorMessage: `MP refund OK but invoice void failed: ${voidFactura.error}`.slice(0, 500),
        },
      })
      await writeAuditEvent({
        prisma: this.prisma,
        tenantId,
        userId,
        action: 'mercadopago_refund',
        resource: 'mercadopago_refund',
        resourceId: String(failed.id),
        ipAddress: input.ipAddress ?? null,
        metadata: {
          facturaId,
          estado: 'fallido',
          mpRefundId,
          error: voidFactura.error,
        },
      })
      return { ok: false, status: voidFactura.status, error: voidFactura.error }
    }

    await this.prisma.factura.update({
      where: { id: facturaId },
      data: { mpEstado: 'refunded' },
    })

    const completed = await this.prisma.mercadoPagoRefund.update({
      where: { id: refundRow.id },
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
      ipAddress: input.ipAddress ?? null,
      metadata: {
        facturaId,
        mpPaymentId: processed.mpPaymentId,
        mpRefundId,
        monto: refundableTotal,
        motivo,
        notaCreditoId: voidFactura.data.notaCredito.id,
        reciboCobroId: processed.reciboCobroId,
      },
    })

    return { ok: true, data: mapRefund(completed) }
  }
}
