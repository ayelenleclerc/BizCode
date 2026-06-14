import type { MercadoPagoChargeback, Prisma, PrismaClient } from '@prisma/client'
import { writeAuditEvent } from '../audit'
import { notifyManagers } from '../notifications'
import type { ServiceResult } from './serviceResults'

export type MercadoPagoChargebackDto = {
  id: number
  mpChargebackId: string
  mpPaymentId: string | null
  facturaId: number | null
  estado: 'pendiente' | 'resuelto' | 'ignorado'
  notifiedAt: string | null
  resolvedAt: string | null
  createdAt: string
}

function mapChargeback(row: MercadoPagoChargeback): MercadoPagoChargebackDto {
  return {
    id: row.id,
    mpChargebackId: row.mpChargebackId,
    mpPaymentId: row.mpPaymentId,
    facturaId: row.facturaId,
    estado: row.estado as MercadoPagoChargebackDto['estado'],
    notifiedAt: row.notifiedAt?.toISOString() ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

function formatFacturaRef(factura: { tipo: string; prefijo: string; numero: number }): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

/**
 * @en Mercado Pago chargeback queue (#179).
 * @es Cola de contracargos Mercado Pago (#179).
 * @pt-BR Fila de chargebacks Mercado Pago (#179).
 */
export class MercadoPagoChargebackService {
  constructor(private readonly prisma: PrismaClient) {}

  async listPending(tenantId: number): Promise<MercadoPagoChargebackDto[]> {
    const rows = await this.prisma.mercadoPagoChargeback.findMany({
      where: { tenantId, estado: 'pendiente' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })
    return rows.map(mapChargeback)
  }

  async updateEstado(
    tenantId: number,
    id: number,
    userId: number,
    estado: 'resuelto' | 'ignorado',
  ): Promise<ServiceResult<MercadoPagoChargebackDto>> {
    const row = await this.prisma.mercadoPagoChargeback.findFirst({
      where: { id, tenantId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Chargeback not found' }
    }
    if (row.estado !== 'pendiente') {
      return { ok: false, status: 409, error: 'Chargeback already resolved' }
    }

    const updated = await this.prisma.mercadoPagoChargeback.update({
      where: { id },
      data: {
        estado,
        resolvedByUserId: userId,
        resolvedAt: new Date(),
      },
    })
    return { ok: true, data: mapChargeback(updated) }
  }

  async processChargebackNotification(
    tenantId: number,
    chargebackId: string,
    payload: Prisma.InputJsonValue,
    ipAddress?: string | null,
  ): Promise<void> {
    const mpChargebackId = chargebackId.trim()
    if (!mpChargebackId) return

    const existing = await this.prisma.mercadoPagoChargeback.findUnique({
      where: { tenantId_mpChargebackId: { tenantId, mpChargebackId } },
    })
    if (existing) return

    let mpPaymentId: string | null = null
    let facturaId: number | null = null
    let facturaRef: string | undefined
    let rsocial: string | undefined
    let amount: string | undefined

    if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
      const rawPayment =
        (payload as Record<string, unknown>).payment_id ??
        (payload as Record<string, unknown>).paymentId
      if (rawPayment != null) {
        mpPaymentId = String(rawPayment).trim() || null
      }
    }

    if (mpPaymentId) {
      const processed = await this.prisma.mercadoPagoProcessedPayment.findUnique({
        where: { tenantId_mpPaymentId: { tenantId, mpPaymentId } },
        include: {
          factura: {
            select: {
              id: true,
              tipo: true,
              prefijo: true,
              numero: true,
              total: true,
              cliente: { select: { rsocial: true } },
            },
          },
        },
      })
      if (processed?.factura) {
        facturaId = processed.factura.id
        facturaRef = formatFacturaRef(processed.factura)
        rsocial = processed.factura.cliente.rsocial
        amount = processed.factura.total.toFixed(2)
      }
    }

    const row = await this.prisma.mercadoPagoChargeback.create({
      data: {
        tenantId,
        mpChargebackId,
        mpPaymentId,
        facturaId,
        estado: 'pendiente',
        payload,
        notifiedAt: new Date(),
      },
    })

    await notifyManagers(this.prisma, tenantId, 'mercadopago_chargeback', {
      facturaId: facturaId ?? undefined,
      facturaRef,
      rsocial,
      amount,
      mpPaymentId: mpPaymentId ?? undefined,
      mpChargebackId,
    })

    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId: null,
      action: 'mercadopago_chargeback_received',
      resource: 'mercadopago_chargeback',
      resourceId: String(row.id),
      ipAddress: ipAddress ?? null,
      metadata: { mpChargebackId, mpPaymentId, facturaId },
    })
  }
}
