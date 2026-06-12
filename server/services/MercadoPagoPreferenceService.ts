import type { Factura, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  createMercadoPagoPreference,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import { MP_PREFERENCE_TTL_HOURS } from '../lib/mercadopagoPreferenceConstants'
import {
  resolveMercadoPagoBackUrls,
  resolveMercadoPagoNotificationUrl,
} from '../lib/publicUrls'
import { MercadoPagoConfigService } from './MercadoPagoConfigService'
import type { ServiceResult } from './serviceResults'

export type MercadoPagoFacturaEstado =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired'

export type MercadoPagoFacturaPaymentDto = {
  estado: MercadoPagoFacturaEstado
  preferenceId?: string
  paymentLink?: string
  expiresAt?: string
  pagadoAt?: string
  amount?: string
  facturaRef?: string
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

  private deriveEstado(
    mpEstado: string | null | undefined,
    expiresAt: Date | null | undefined,
    now = new Date(),
  ): MercadoPagoFacturaEstado {
    if (!mpEstado) return 'none'
    if (mpEstado === 'approved') return 'approved'
    if (mpEstado === 'rejected') return 'rejected'
    if (mpEstado === 'cancelled') return 'cancelled'
    if (mpEstado === 'pending' && expiresAt && expiresAt.getTime() <= now.getTime()) {
      return 'expired'
    }
    if (mpEstado === 'pending') return 'pending'
    return 'none'
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

  private mapToDto(
    factura: Pick<
      Factura,
      'tipo' | 'prefijo' | 'numero' | 'mpPreferenceId' | 'mpPaymentLink' | 'mpEstado' | 'mpPagadoAt' | 'mpPreferenceExpiresAt'
    >,
    pendiente: Decimal,
    now = new Date(),
  ): MercadoPagoFacturaPaymentDto {
    const estado = this.deriveEstado(factura.mpEstado, factura.mpPreferenceExpiresAt, now)
    return {
      estado,
      preferenceId: factura.mpPreferenceId ?? undefined,
      paymentLink: estado === 'expired' ? undefined : factura.mpPaymentLink ?? undefined,
      expiresAt: toIsoOrUndefined(factura.mpPreferenceExpiresAt),
      pagadoAt: toIsoOrUndefined(factura.mpPagadoAt),
      amount: decimalToMoneyString(pendiente),
      facturaRef: formatFacturaRef(factura),
    }
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
      },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    const pendiente = await this.computePendiente(tenantId, factura.clienteId, factura)
    return { ok: true, data: this.mapToDto(factura, pendiente) }
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
    if (
      factura.mpEstado === 'pending' &&
      factura.mpPreferenceExpiresAt &&
      factura.mpPreferenceExpiresAt.getTime() > now.getTime()
    ) {
      return { ok: false, status: 409, error: 'MP_PREFERENCE_ALREADY_ACTIVE' }
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
        },
      })

      return { ok: true, data: this.mapToDto(updated, pendiente, now) }
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        return { ok: false, status: 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to create Mercado Pago preference' }
    }
  }
}
