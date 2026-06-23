import type { Factura, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  createMercadoPagoPreference,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import {
  deriveMercadoPagoChannel,
  deriveMercadoPagoEstado,
  isActivePreference,
  isActiveQr,
  type MercadoPagoFacturaEstado,
  type MercadoPagoFacturaPaymentDto,
  type MercadoPagoPaymentChannel,
} from '../lib/mercadopagoFacturaState'
import { MP_PREFERENCE_TTL_HOURS } from '../lib/mercadopagoPreferenceConstants'
import { mercadoPagoQrPayloadToBase64 } from '../lib/mercadopagoQrImage'
import {
  resolveMercadoPagoBackUrls,
  resolveMercadoPagoNotificationUrl,
} from '../lib/publicUrls'
import { MercadoPagoConfigService } from './MercadoPagoConfigService'
import type { ServiceResult } from './serviceResults'

export type {
  MercadoPagoFacturaEstado,
  MercadoPagoFacturaPaymentDto,
  MercadoPagoPaymentChannel,
}

function formatFacturaRef(factura: Pick<Factura, 'tipo' | 'prefijo' | 'numero'>): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

function decimalToMoneyString(value: Decimal): string {
  return value.toFixed(2)
}

function toIsoOrUndefined(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined
}

type FacturaMpFields = Pick<
  Factura,
  | 'tipo'
  | 'prefijo'
  | 'numero'
  | 'mpPreferenceId'
  | 'mpPaymentLink'
  | 'mpEstado'
  | 'mpPagadoAt'
  | 'mpPreferenceExpiresAt'
  | 'mpQrData'
  | 'mpQrOrderId'
  | 'mpQrExpiresAt'
>

/**
 * @en Mercado Pago checkout preference per invoice (#175).
 * @es Preference de checkout Mercado Pago por factura (#175).
 * @pt-BR Preference de checkout Mercado Pago por fatura (#175).
 */
export class MercadoPagoPreferenceService {
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

  private async mapToDto(
    factura: FacturaMpFields,
    pendiente: Decimal,
    now = new Date(),
  ): Promise<MercadoPagoFacturaPaymentDto> {
    const estado = deriveMercadoPagoEstado(
      factura.mpEstado,
      factura.mpPreferenceExpiresAt,
      factura.mpQrExpiresAt,
      now,
    )
    const channel = deriveMercadoPagoChannel(factura, estado, now)
    const dto: MercadoPagoFacturaPaymentDto = {
      estado,
      channel,
      preferenceId: factura.mpPreferenceId ?? undefined,
      paymentLink:
        channel === 'link' && estado !== 'expired' ? factura.mpPaymentLink ?? undefined : undefined,
      expiresAt: toIsoOrUndefined(factura.mpPreferenceExpiresAt),
      pagadoAt: toIsoOrUndefined(factura.mpPagadoAt),
      amount: decimalToMoneyString(pendiente),
      facturaRef: formatFacturaRef(factura),
      qrExpiresAt: toIsoOrUndefined(factura.mpQrExpiresAt),
      qrOrderId: factura.mpQrOrderId ?? undefined,
    }

    if (channel === 'qr' && estado !== 'expired' && factura.mpQrData) {
      dto.qrData = factura.mpQrData
      try {
        dto.qrImageBase64 = await mercadoPagoQrPayloadToBase64(factura.mpQrData)
      } catch {
        // QR payload present but image render failed — still return qrData.
      }
    }

    return dto
  }

  async getStatus(
    tenantId: number,
    facturaId: number,
  ): Promise<ServiceResult<MercadoPagoFacturaPaymentDto>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: {
        id: true,
        clienteId: true,
        tipo: true,
        prefijo: true,
        numero: true,
        total: true,
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
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    const pendiente = await this.computePendiente(tenantId, factura.clienteId, factura)
    return { ok: true, data: await this.mapToDto(factura, pendiente) }
  }

  async createPreference(
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

    const mpRow = await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    if (!mpRow) {
      return { ok: false, status: 404, error: 'Mercado Pago is not configured for this tenant' }
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    })
    if (!tenant?.slug) {
      return { ok: false, status: 500, error: 'Tenant slug not found' }
    }

    const expiresAt = new Date(now.getTime() + MP_PREFERENCE_TTL_HOURS * 60 * 60 * 1000)
    const facturaRef = formatFacturaRef(factura)
    const description = `Factura ${facturaRef} — ${factura.cliente.rsocial}`

    try {
      const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
      const preference = await createMercadoPagoPreference(accessToken, {
        items: [
          {
            title: description.slice(0, 256),
            quantity: 1,
            unit_price: pendiente.toNumber(),
            currency_id: 'ARS',
          },
        ],
        back_urls: resolveMercadoPagoBackUrls(tenant.slug),
        notification_url: resolveMercadoPagoNotificationUrl(),
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: expiresAt.toISOString(),
        external_reference: `${tenantId}:${facturaId}`,
      })

      const paymentLink = mpRow.sandboxMode
        ? (preference.sandbox_init_point ?? preference.init_point)
        : preference.init_point

      const updated = await this.prisma.factura.update({
        where: { id: facturaId },
        data: {
          mpPreferenceId: preference.id,
          mpPaymentLink: paymentLink,
          mpEstado: 'pending',
          mpPagadoAt: null,
          mpPreferenceExpiresAt: expiresAt,
          mpQrData: null,
          mpQrOrderId: null,
          mpQrExpiresAt: null,
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

      return { ok: true, data: await this.mapToDto(updated, pendiente, now) }
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        return { ok: false, status: 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to create Mercado Pago preference' }
    }
  }
}
