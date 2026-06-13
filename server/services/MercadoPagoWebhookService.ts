import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { writeAuditEvent } from '../audit'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  fetchMercadoPagoPayment,
  MercadoPagoApiError,
  type MercadoPagoPaymentResult,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import { verifyMercadoPagoWebhookSignature } from '../lib/mercadopagoSignature'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { ReciboCobroService } from './ReciboCobroService'

export type MercadoPagoWebhookPayload = {
  action?: string
  type?: string
  data?: { id?: string | number }
  id?: string | number
}

function formatFacturaRef(factura: { tipo: string; prefijo: string; numero: number }): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

function extractPaymentIdFromPayload(body: MercadoPagoWebhookPayload): string | null {
  const raw = body.data?.id ?? body.id
  if (raw == null) return null
  const id = String(raw).trim()
  return id.length > 0 ? id : null
}

function extractDataIdFromQuery(query: Record<string, unknown>): string | null {
  const raw = query['data.id'] ?? query['data_id']
  if (typeof raw !== 'string' || raw.trim() === '') return null
  return raw.trim()
}

function parseExternalReference(ref: string | null | undefined): { tenantId: number; facturaId: number } | null {
  if (!ref?.trim()) return null
  const [tenantPart, facturaPart] = ref.split(':')
  const tenantId = Number.parseInt(tenantPart ?? '', 10)
  const facturaId = Number.parseInt(facturaPart ?? '', 10)
  if (!Number.isInteger(tenantId) || tenantId < 1 || !Number.isInteger(facturaId) || facturaId < 1) {
    return null
  }
  return { tenantId, facturaId }
}

function mapMpPaymentStatus(status: string): 'approved' | 'rejected' | 'cancelled' | 'pending' | null {
  const normalized = status.toLowerCase()
  if (normalized === 'approved') return 'approved'
  if (normalized === 'rejected') return 'rejected'
  if (normalized === 'cancelled') return 'cancelled'
  if (normalized === 'pending' || normalized === 'in_process') return 'pending'
  return null
}

/**
 * @en Mercado Pago IPN/webhook processing (#176).
 * @es Procesamiento de IPN/webhooks de Mercado Pago (#176).
 * @pt-BR Processamento de IPN/webhooks do Mercado Pago (#176).
 */
export class MercadoPagoWebhookService {
  private readonly reciboCobro: ReciboCobroService

  constructor(private readonly prisma: PrismaClient) {
    this.reciboCobro = new ReciboCobroService(prisma)
  }

  /**
   * @en Resolves tenant by matching webhook signature against configured secrets (#176).
   * @es Resuelve tenant comparando la firma del webhook con secretos configurados (#176).
   * @pt-BR Resolve tenant comparando a assinatura do webhook com segredos configurados (#176).
   */
  async resolveTenantIdBySignature(input: {
    xSignature: string
    xRequestId: string
    dataId: string
  }): Promise<number | null> {
    const configs = await this.prisma.mercadoPagoConfig.findMany({
      where: {
        activo: true,
        webhookSecretEncrypted: { not: null },
      },
      select: { tenantId: true, webhookSecretEncrypted: true },
    })

    for (const cfg of configs) {
      if (!cfg.webhookSecretEncrypted) continue
      const secret = decryptFiscalSecret(cfg.webhookSecretEncrypted)
      if (
        verifyMercadoPagoWebhookSignature({
          secret,
          xSignature: input.xSignature,
          xRequestId: input.xRequestId,
          dataId: input.dataId,
        })
      ) {
        return cfg.tenantId
      }
    }
    return null
  }

  async processPaymentNotification(
    tenantId: number,
    paymentId: string,
    ipAddress?: string | null,
  ): Promise<void> {
    const existing = await this.prisma.mercadoPagoProcessedPayment.findUnique({
      where: { tenantId_mpPaymentId: { tenantId, mpPaymentId: paymentId } },
    })
    if (existing) {
      return
    }

    const mpRow = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: {
        activo: true,
        accessTokenEncrypted: true,
        webhookSecretEncrypted: true,
      },
    })
    if (!mpRow?.activo || !mpRow.webhookSecretEncrypted) {
      return
    }

    let payment: MercadoPagoPaymentResult
    try {
      const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
      payment = await fetchMercadoPagoPayment(accessToken, paymentId)
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        console.warn(
          '[mercadopago-webhook] mp_error',
          'tenant',
          tenantId,
          'payment',
          sanitizeLogField(paymentId),
          'status',
          err.status,
        )
      }
      return
    }

    const mapped = mapMpPaymentStatus(payment.status)
    if (!mapped) {
      return
    }

    const ext = parseExternalReference(payment.external_reference)
    if (!ext || ext.tenantId !== tenantId) {
      const byPreference =
        payment.preference_id != null
          ? await this.prisma.factura.findFirst({
              where: { tenantId, mpPreferenceId: payment.preference_id },
              select: { id: true, clienteId: true, tipo: true, prefijo: true, numero: true, total: true },
            })
          : null
      if (!byPreference) {
        console.warn(
          '[mercadopago-webhook] factura_not_found',
          'tenant',
          tenantId,
          'payment',
          sanitizeLogField(paymentId),
        )
        return
      }
      await this.applyPaymentOutcome({
        tenantId,
        paymentId,
        mapped,
        factura: byPreference,
        transactionAmount: payment.transaction_amount ?? 0,
        ipAddress,
      })
      return
    }

    const factura = await this.prisma.factura.findFirst({
      where: { id: ext.facturaId, tenantId, estado: 'A' },
      select: {
        id: true,
        clienteId: true,
        tipo: true,
        prefijo: true,
        numero: true,
        total: true,
        mpPreferenceId: true,
      },
    })
    if (!factura) {
      console.warn(
        '[mercadopago-webhook] factura_missing',
        'tenant',
        tenantId,
        'payment',
        sanitizeLogField(paymentId),
        'facturaId',
        ext.facturaId,
      )
      return
    }

    await this.applyPaymentOutcome({
      tenantId,
      paymentId,
      mapped,
      factura,
      transactionAmount: payment.transaction_amount ?? 0,
      ipAddress,
    })
  }

  private async computePendiente(
    tenantId: number,
    clienteId: number,
    facturaId: number,
    total: Decimal,
  ): Promise<Decimal> {
    const allocations = await this.prisma.reciboCobroImputacion.groupBy({
      by: ['facturaId'],
      where: {
        facturaId,
        reciboCobro: { tenantId, clienteId, estado: 'emitido' },
      },
      _sum: { importe: true },
    })
    const pagado = allocations[0]?._sum.importe ?? new Decimal(0)
    return total.minus(pagado)
  }

  private async applyPaymentOutcome(input: {
    tenantId: number
    paymentId: string
    mapped: 'approved' | 'rejected' | 'cancelled' | 'pending'
    factura: {
      id: number
      clienteId: number
      tipo: string
      prefijo: string
      numero: number
      total: Decimal
    }
    transactionAmount: number
    ipAddress?: string | null
  }): Promise<void> {
    const { tenantId, paymentId, mapped, factura, transactionAmount, ipAddress } = input
    const facturaRef = formatFacturaRef(factura)
    const usuarioId = resolveSystemUserId()
    let reciboCobroId: number | null = null

    if (mapped === 'approved') {
      const pendiente = await this.computePendiente(
        tenantId,
        factura.clienteId,
        factura.id,
        factura.total,
      )
      if (pendiente.lessThanOrEqualTo(0)) {
        await this.prisma.mercadoPagoProcessedPayment.create({
          data: {
            tenantId,
            mpPaymentId: paymentId,
            facturaId: factura.id,
            estado: mapped,
            reciboCobroId: null,
          },
        })
        await this.prisma.factura.update({
          where: { id: factura.id },
          data: { mpEstado: 'approved', mpPagadoAt: new Date() },
        })
        return
      }

      const importe = Math.min(transactionAmount, pendiente.toNumber())
      if (importe <= 0) {
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      const reciboResult = await this.reciboCobro.create(tenantId, factura.clienteId, usuarioId, {
        fecha: today,
        totalCobrado: importe,
        concepto: `Pago Mercado Pago #${paymentId}`,
        formas: [{ tipo: 'mercadopago', importe, referencia: paymentId }],
        imputaciones: [{ facturaId: factura.id, importe }],
        fifo: false,
      })

      if (!reciboResult.ok) {
        console.warn(
          '[mercadopago-webhook] recibo_error',
          'tenant',
          tenantId,
          'payment',
          sanitizeLogField(paymentId),
          'error',
          reciboResult.error,
        )
        return
      }

      reciboCobroId = reciboResult.data.id

      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { mpEstado: 'approved', mpPagadoAt: new Date() },
      })

      const cliente = await this.prisma.cliente.findFirst({
        where: { id: factura.clienteId, tenantId },
        select: { rsocial: true },
      })

      await notifyManagers(this.prisma, tenantId, 'mercadopago_payment_received', {
        clienteId: factura.clienteId,
        facturaId: factura.id,
        facturaRef,
        rsocial: cliente?.rsocial,
        amount: importe.toFixed(2),
      })
    } else if (mapped === 'rejected' || mapped === 'cancelled') {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { mpEstado: mapped },
      })

      const cliente = await this.prisma.cliente.findFirst({
        where: { id: factura.clienteId, tenantId },
        select: { rsocial: true },
      })

      await notifyManagers(this.prisma, tenantId, 'mercadopago_payment_failed', {
        clienteId: factura.clienteId,
        facturaId: factura.id,
        facturaRef,
        rsocial: cliente?.rsocial,
        amount: transactionAmount > 0 ? transactionAmount.toFixed(2) : undefined,
      })
    } else {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { mpEstado: 'pending' },
      })
    }

    try {
      await this.prisma.mercadoPagoProcessedPayment.create({
        data: {
          tenantId,
          mpPaymentId: paymentId,
          facturaId: factura.id,
          estado: mapped,
          reciboCobroId,
        },
      })
    } catch {
      // Unique constraint race — idempotent no-op.
      return
    }

    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId: usuarioId,
      action: 'mercadopago_webhook_processed',
      resource: 'mercadopago_payment',
      resourceId: paymentId,
      ipAddress: ipAddress ?? null,
      metadata: {
        facturaId: factura.id,
        estado: mapped,
        reciboCobroId,
      },
    })
  }
}

export { extractPaymentIdFromPayload, extractDataIdFromQuery }
