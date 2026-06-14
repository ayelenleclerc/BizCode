import type { Factura, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  createMercadoPagoInstoreQr,
  fetchMercadoPagoUserMe,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import {
  isActivePreference,
  isActiveQr,
  type MercadoPagoFacturaPaymentDto,
} from '../lib/mercadopagoFacturaState'
import { MP_QR_TTL_MINUTES } from '../lib/mercadopagoQrConstants'
import { mercadoPagoQrPayloadToBase64 } from '../lib/mercadopagoQrImage'
import { resolveMercadoPagoNotificationUrl } from '../lib/publicUrls'
import { MercadoPagoConfigService } from './MercadoPagoConfigService'
import type { ServiceResult } from './serviceResults'

export type MercadoPagoStaticQrDto = {
  qrData: string
  qrImageBase64: string
}

function formatFacturaRef(factura: Pick<Factura, 'tipo' | 'prefijo' | 'numero'>): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

/**
 * @en Mercado Pago instore QR payments per invoice (#177).
 * @es Pagos con QR instore de Mercado Pago por factura (#177).
 * @pt-BR Pagamentos com QR instore do Mercado Pago por fatura (#177).
 */
export class MercadoPagoQrService {
  private readonly mpConfig: MercadoPagoConfigService

  constructor(private readonly prisma: PrismaClient) {
    this.mpConfig = new MercadoPagoConfigService(prisma)
  }

  private async computePendiente(
    tenantId: number,
    clienteId: number,
    factura: Pick<Factura, 'id' | 'total'>,
  ): Promise<Decimal> {
    const allocations = await this.prisma.reciboCobroImputacion.groupBy({
      by: ['facturaId'],
      where: {
        facturaId: factura.id,
        reciboCobro: { tenantId, clienteId, estado: 'emitido' },
      },
      _sum: { importe: true },
    })
    const pagado = allocations[0]?._sum.importe ?? new Decimal(0)
    return factura.total.minus(pagado)
  }

  private async resolveCollectorAndPos(
    tenantId: number,
    accessToken: string,
    mpRow: {
      collectorId: string | null
      externalPosId: string | null
    },
  ): Promise<ServiceResult<{ collectorId: string; externalPosId: string }>> {
    let collectorId = mpRow.collectorId?.trim() ?? ''
    let externalPosId = mpRow.externalPosId?.trim() ?? ''

    if (!collectorId) {
      try {
        const profile = await fetchMercadoPagoUserMe(accessToken)
        if (profile.id == null) {
          return { ok: false, status: 422, error: 'Mercado Pago collector id not available' }
        }
        collectorId = String(profile.id)
        await this.prisma.mercadoPagoConfig.update({
          where: { tenantId },
          data: { collectorId },
        })
      } catch (err: unknown) {
        if (err instanceof MercadoPagoApiError) {
          return { ok: false, status: 422, error: err.message }
        }
        return { ok: false, status: 500, error: 'Failed to resolve Mercado Pago collector' }
      }
    }

    if (!externalPosId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { slug: true },
      })
      if (!tenant?.slug) {
        return { ok: false, status: 500, error: 'Tenant slug not found' }
      }
      externalPosId = `bizcode-${tenant.slug}`.slice(0, 60)
      await this.prisma.mercadoPagoConfig.update({
        where: { tenantId },
        data: { externalPosId },
      })
    }

    return { ok: true, data: { collectorId, externalPosId } }
  }

  async getStaticQr(tenantId: number): Promise<ServiceResult<MercadoPagoStaticQrDto>> {
    const configured = await this.mpConfig.isConfiguredAndActive(tenantId)
    if (!configured) {
      return { ok: false, status: 404, error: 'Mercado Pago is not configured for this tenant' }
    }

    const row = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: { staticQrData: true },
    })
    const qrData = row?.staticQrData?.trim()
    if (!qrData) {
      return { ok: false, status: 404, error: 'MP_STATIC_QR_NOT_CONFIGURED' }
    }

    try {
      const qrImageBase64 = await mercadoPagoQrPayloadToBase64(qrData)
      return { ok: true, data: { qrData, qrImageBase64 } }
    } catch {
      return { ok: false, status: 500, error: 'Failed to render static QR image' }
    }
  }

  async createDynamicQr(
    tenantId: number,
    facturaId: number,
  ): Promise<ServiceResult<MercadoPagoFacturaPaymentDto>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      include: { cliente: { select: { rsocial: true } } },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (factura.estado !== 'A') {
      return { ok: false, status: 422, error: 'FACTURA_NOT_ACTIVE' }
    }

    if (factura.mpEstado === 'approved') {
      return { ok: false, status: 422, error: 'FACTURA_ALREADY_PAID_MP' }
    }

    const now = new Date()
    if (isActivePreference(factura, now)) {
      return { ok: false, status: 409, error: 'MP_PREFERENCE_ALREADY_ACTIVE' }
    }

    if (isActiveQr(factura, now)) {
      return { ok: false, status: 409, error: 'MP_QR_ALREADY_ACTIVE' }
    }

    const pendiente = await this.computePendiente(tenantId, factura.clienteId, factura)
    if (pendiente.lessThanOrEqualTo(0)) {
      return { ok: false, status: 422, error: 'FACTURA_ALREADY_PAID' }
    }

    const configured = await this.mpConfig.isConfiguredAndActive(tenantId)
    if (!configured) {
      return { ok: false, status: 404, error: 'Mercado Pago is not configured for this tenant' }
    }

    const mpRow = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: {
        accessTokenEncrypted: true,
        collectorId: true,
        externalPosId: true,
      },
    })
    if (!mpRow) {
      return { ok: false, status: 404, error: 'Mercado Pago is not configured for this tenant' }
    }

    const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
    const posResult = await this.resolveCollectorAndPos(tenantId, accessToken, mpRow)
    if (!posResult.ok) {
      return posResult
    }

    const facturaRef = formatFacturaRef(factura)
    const amount = pendiente.toNumber()
    const expiresAt = new Date(now.getTime() + MP_QR_TTL_MINUTES * 60 * 1000)
    const description = `Factura ${facturaRef} — ${factura.cliente.rsocial}`.slice(0, 256)

    try {
      const qr = await createMercadoPagoInstoreQr(
        accessToken,
        posResult.data.collectorId,
        posResult.data.externalPosId,
        {
          external_reference: `${tenantId}:${facturaId}`,
          title: `Factura ${facturaRef}`.slice(0, 120),
          description,
          notification_url: resolveMercadoPagoNotificationUrl(),
          total_amount: amount,
          items: [
            {
              title: description.slice(0, 120),
              description,
              unit_price: amount,
              quantity: 1,
              unit_measure: 'unit',
              total_amount: amount,
            },
          ],
        },
      )

      const qrImageBase64 = await mercadoPagoQrPayloadToBase64(qr.qr_data)

      const updated = await this.prisma.factura.update({
        where: { id: facturaId },
        data: {
          mpQrData: qr.qr_data,
          mpQrOrderId: qr.in_store_order_id,
          mpQrExpiresAt: expiresAt,
          mpEstado: 'pending',
          mpPagadoAt: null,
          mpPreferenceId: null,
          mpPaymentLink: null,
          mpPreferenceExpiresAt: null,
        },
        select: {
          tipo: true,
          prefijo: true,
          numero: true,
          mpPreferenceId: true,
          mpPaymentLink: true,
          mpEstado: true,
          mpPagadoAt: true,
          mpPreferenceExpiresAt: true,
          mpQrData: true,
          mpQrOrderId: true,
          mpQrExpiresAt: true,
        },
      })

      return {
        ok: true,
        data: {
          estado: 'pending',
          channel: 'qr',
          qrData: updated.mpQrData ?? undefined,
          qrImageBase64,
          qrExpiresAt: expiresAt.toISOString(),
          qrOrderId: updated.mpQrOrderId ?? undefined,
          amount: pendiente.toFixed(2),
          facturaRef,
        },
      }
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        return { ok: false, status: 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to create Mercado Pago QR' }
    }
  }
}
