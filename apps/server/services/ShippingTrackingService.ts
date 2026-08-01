import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  EstadoEnvio,
  OrdenEntregaTrackingAssignInput,
  OrdenEntregaTrackingView,
  ShippingTrackingEvent,
  ShippingTransportista,
} from '@bizcode/types'
import { getShippingCarrierProvider } from '../logistics/shipping/registry'
import type { ShippingFetch } from '../logistics/shipping/types'
import { notifyManagers } from '../notifications'
import type { ServiceResult } from './serviceResults'
import {
  ShippingCarrierConfigService,
  type ShippingApiCarrier,
} from './ShippingCarrierConfigService'

/** @en Tracking cache TTL (30 minutes) per #193. */
export const SHIPPING_TRACKING_CACHE_TTL_MS = 30 * 60 * 1000

const API_CARRIERS = new Set<string>(['andreani', 'correo_argentino'])

function parseEvents(value: Prisma.JsonValue | null | undefined): ShippingTrackingEvent[] {
  if (!Array.isArray(value)) return []
  const out: ShippingTrackingEvent[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (typeof row.at !== 'string' || typeof row.status !== 'string') continue
    out.push({
      at: row.at,
      status: row.status,
      description: typeof row.description === 'string' ? row.description : undefined,
      location: typeof row.location === 'string' ? row.location : undefined,
    })
  }
  return out
}

function isCacheFresh(ultimoEventoAt: Date | null): boolean {
  if (!ultimoEventoAt) return false
  return Date.now() - ultimoEventoAt.getTime() < SHIPPING_TRACKING_CACHE_TTL_MS
}

/**
 * @en Assigns and refreshes carrier tracking on delivery orders (#193).
 * @es Asigna y refresca tracking de transportistas en órdenes de entrega (#193).
 * @pt-BR Atribui e atualiza rastreio de transportadoras em ordens de entrega (#193).
 */
export class ShippingTrackingService {
  private readonly configs: ShippingCarrierConfigService

  constructor(
    private readonly prisma: PrismaClient,
    private readonly fetchImpl?: ShippingFetch,
  ) {
    this.configs = new ShippingCarrierConfigService(prisma)
  }

  async assignTracking(
    tenantId: number,
    ordenEntregaId: number,
    input: OrdenEntregaTrackingAssignInput,
  ): Promise<ServiceResult<OrdenEntregaTrackingView>> {
    const provider = getShippingCarrierProvider(input.transportista)
    if (!provider) {
      return { ok: false, status: 400, error: 'Unknown transportista' }
    }
    const nro = input.nroSeguimiento.trim()
    if (!nro) {
      return { ok: false, status: 400, error: 'nroSeguimiento is required' }
    }

    const existing = await this.prisma.ordenEntrega.findFirst({
      where: { id: ordenEntregaId, tenantId },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Orden de entrega not found' }
    }

    const estadoEnvio: EstadoEnvio = input.estadoEnvio ?? existing.estadoEnvio as EstadoEnvio ?? 'pending'
    const updated = await this.prisma.ordenEntrega.update({
      where: { id: existing.id },
      data: {
        transportista: input.transportista,
        nroSeguimiento: nro,
        estadoEnvio,
        ultimoEventoAt: existing.ultimoEventoAt ?? new Date(),
      },
    })

    return {
      ok: true,
      data: this.toView(updated, provider.buildPublicPortalUrl(nro), true, false),
    }
  }

  async getTracking(
    tenantId: number,
    ordenEntregaId: number,
    options?: { forceRefresh?: boolean },
  ): Promise<ServiceResult<OrdenEntregaTrackingView>> {
    const row = await this.prisma.ordenEntrega.findFirst({
      where: { id: ordenEntregaId, tenantId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Orden de entrega not found' }
    }
    if (!row.transportista || !row.nroSeguimiento) {
      return {
        ok: true,
        data: {
          ordenEntregaId: row.id,
          transportista: null,
          nroSeguimiento: null,
          estadoEnvio: null,
          ultimoEventoAt: null,
          trackingEventos: [],
          portalUrl: null,
          fromCache: true,
          refreshed: false,
        },
      }
    }

    const provider = getShippingCarrierProvider(row.transportista)
    const portalUrl = provider?.buildPublicPortalUrl(row.nroSeguimiento) ?? null
    const fresh = isCacheFresh(row.ultimoEventoAt)
    if (!options?.forceRefresh && fresh) {
      return {
        ok: true,
        data: this.toView(row, portalUrl, true, false),
      }
    }

    const refreshed = await this.refreshOne(row)
    if (!refreshed.ok) {
      return {
        ok: true,
        data: this.toView(row, portalUrl, true, false),
      }
    }
    return {
      ok: true,
      data: this.toView(refreshed.data, portalUrl, false, refreshed.didCallCarrier),
    }
  }

  /**
   * @en Job entry: refresh in-flight shipments for one tenant (#193).
   */
  async refreshInTransitForTenant(tenantId: number): Promise<{
    scanned: number
    refreshed: number
    deliveredNotified: number
    errors: number
  }> {
    const rows = await this.prisma.ordenEntrega.findMany({
      where: {
        tenantId,
        nroSeguimiento: { not: null },
        transportista: { in: ['andreani', 'correo_argentino'] },
        OR: [
          { estadoEnvio: null },
          { estadoEnvio: { in: ['pending', 'in_transit'] } },
        ],
      },
      take: 200,
    })
    let refreshed = 0
    let deliveredNotified = 0
    let errors = 0
    for (const row of rows) {
      const result = await this.refreshOne(row)
      if (!result.ok) {
        errors += 1
        continue
      }
      if (result.didCallCarrier) refreshed += 1
      if (result.notifiedDelivered) deliveredNotified += 1
    }
    return { scanned: rows.length, refreshed, deliveredNotified, errors }
  }

  private async refreshOne(row: {
    id: number
    tenantId: number
    clienteId: number
    transportista: string | null
    nroSeguimiento: string | null
    estadoEnvio: string | null
    ultimoEventoAt: Date | null
    trackingEventos: Prisma.JsonValue | null
  }): Promise<
    | {
        ok: true
        data: {
          id: number
          transportista: string | null
          nroSeguimiento: string | null
          estadoEnvio: string | null
          ultimoEventoAt: Date | null
          trackingEventos: Prisma.JsonValue | null
        }
        didCallCarrier: boolean
        notifiedDelivered: boolean
      }
    | { ok: false; error: string }
  > {
    if (!row.transportista || !row.nroSeguimiento) {
      return { ok: false, error: 'missing tracking' }
    }
    const provider = getShippingCarrierProvider(row.transportista)
    if (!provider) {
      return { ok: false, error: 'unknown carrier' }
    }

    let credentials = null
    if (API_CARRIERS.has(row.transportista)) {
      credentials = await this.configs.getActiveCredentials(
        row.tenantId,
        row.transportista as ShippingApiCarrier,
      )
    }

    let carrierResult
    try {
      carrierResult = await provider.fetchTracking(
        row.nroSeguimiento,
        credentials,
        this.fetchImpl,
      )
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'carrier fetch failed',
      }
    }

    if (!carrierResult) {
      return {
        ok: true,
        data: row,
        didCallCarrier: false,
        notifiedDelivered: false,
      }
    }

    const previous = row.estadoEnvio
    const updated = await this.prisma.ordenEntrega.update({
      where: { id: row.id },
      data: {
        estadoEnvio: carrierResult.estadoEnvio,
        ultimoEventoAt: new Date(),
        trackingEventos: carrierResult.events as unknown as Prisma.InputJsonValue,
      },
    })

    let notifiedDelivered = false
    if (previous !== 'delivered' && carrierResult.estadoEnvio === 'delivered') {
      await notifyManagers(this.prisma, row.tenantId, 'shipment_delivered', {
        clienteId: row.clienteId,
        ordenEntregaId: row.id,
        transportista: row.transportista,
        nroSeguimiento: row.nroSeguimiento,
      })
      notifiedDelivered = true
    }

    return {
      ok: true,
      data: updated,
      didCallCarrier: true,
      notifiedDelivered,
    }
  }

  private toView(
    row: {
      id: number
      transportista: string | null
      nroSeguimiento: string | null
      estadoEnvio: string | null
      ultimoEventoAt: Date | null
      trackingEventos: Prisma.JsonValue | null
    },
    portalUrl: string | null,
    fromCache: boolean,
    refreshed: boolean,
  ): OrdenEntregaTrackingView {
    return {
      ordenEntregaId: row.id,
      transportista: (row.transportista as ShippingTransportista | null) ?? null,
      nroSeguimiento: row.nroSeguimiento,
      estadoEnvio: (row.estadoEnvio as EstadoEnvio | null) ?? null,
      ultimoEventoAt: row.ultimoEventoAt?.toISOString() ?? null,
      trackingEventos: parseEvents(row.trackingEventos),
      portalUrl,
      fromCache,
      refreshed,
    }
  }
}
