import { Prisma, type PrismaClient } from '@prisma/client'
import { GPS_VIEW_ROLES, mapRepartoProgress, type RepartoListRow } from './RepartoService'
import type { ServiceResult } from './serviceResults'

export const UBICACION_RETENTION_DAYS = 7

const activosInclude = {
  chofer: { select: { id: true, username: true, role: true } },
  items: {
    orderBy: { secuencia: 'asc' as const },
    include: {
      ordenEntrega: {
        include: {
          cliente: { select: { id: true, codigo: true, rsocial: true, domicilio: true } },
          zona: { select: { id: true, nombre: true } },
        },
      },
    },
  },
} satisfies Prisma.RepartoInclude

export type RepartoUbicacionPoint = {
  lat: number
  lng: number
  recordedAt: Date
}

export type RepartoActivoRow = {
  id: number
  tenantId: number
  fecha: Date
  choferId: number
  estado: string
  vehiculo: string | null
  observaciones: string | null
  chofer: { id: number; username: string; role: string }
  progress: RepartoListRow['progress']
  ultimaUbicacion: RepartoUbicacionPoint | null
  currentStop: {
    secuencia: number
    cliente: { id: number; codigo: number; rsocial: string; domicilio: string | null }
    zona: { id: number; nombre: string } | null
  } | null
}

function isGpsViewer(role: string): boolean {
  return GPS_VIEW_ROLES.includes(role as (typeof GPS_VIEW_ROLES)[number])
}

function decimalToNumber(value: Prisma.Decimal): number {
  return Number(value.toString())
}

function mapUbicacion(row: { lat: Prisma.Decimal; lng: Prisma.Decimal; recordedAt: Date }): RepartoUbicacionPoint {
  return {
    lat: decimalToNumber(row.lat),
    lng: decimalToNumber(row.lng),
    recordedAt: row.recordedAt,
  }
}

function mapActivoRow(
  reparto: Prisma.RepartoGetPayload<{ include: typeof activosInclude }>,
  ultima: RepartoUbicacionPoint | null,
): RepartoActivoRow {
  const pendingItem = reparto.items.find((i) => i.estado === 'pending')
  return {
    id: reparto.id,
    tenantId: reparto.tenantId,
    fecha: reparto.fecha,
    choferId: reparto.choferId,
    estado: reparto.estado,
    vehiculo: reparto.vehiculo,
    observaciones: reparto.observaciones,
    chofer: reparto.chofer,
    progress: mapRepartoProgress(reparto.items),
    ultimaUbicacion: ultima,
    currentStop: pendingItem
      ? {
          secuencia: pendingItem.secuencia,
          cliente: {
            id: pendingItem.ordenEntrega.cliente.id,
            codigo: pendingItem.ordenEntrega.cliente.codigo,
            rsocial: pendingItem.ordenEntrega.cliente.rsocial,
            domicilio: pendingItem.ordenEntrega.cliente.domicilio,
          },
          zona: pendingItem.ordenEntrega.zona,
        }
      : null,
  }
}

/**
 * @en GPS location tracking for delivery routes (#144).
 * @es Seguimiento GPS de repartos (#144).
 * @pt-BR Rastreamento GPS de repartos (#144).
 */
export class RepartoUbicacionService {
  constructor(private readonly prisma: PrismaClient) {}

  private retentionCutoff(): Date {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - UBICACION_RETENTION_DAYS)
    return cutoff
  }

  async purgeOlderThanRetention(tenantId?: number): Promise<number> {
    const cutoff = this.retentionCutoff()
    const result = await this.prisma.repartoUbicacion.deleteMany({
      where: {
        recordedAt: { lt: cutoff },
        ...(tenantId !== undefined ? { tenantId } : {}),
      },
    })
    return result.count
  }

  async recordLocation(
    tenantId: number,
    repartoId: number,
    userId: number,
    input: { lat: number; lng: number },
  ): Promise<ServiceResult<RepartoUbicacionPoint>> {
    if (input.lat < -90 || input.lat > 90 || input.lng < -180 || input.lng > 180) {
      return { ok: false, status: 400, error: 'Invalid coordinates' }
    }

    const reparto = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      select: { id: true, choferId: true, estado: true },
    })
    if (!reparto) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (reparto.choferId !== userId) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }
    if (reparto.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const row = await this.prisma.repartoUbicacion.create({
      data: {
        tenantId,
        repartoId,
        lat: new Prisma.Decimal(input.lat),
        lng: new Prisma.Decimal(input.lng),
      },
    })

    await this.purgeOlderThanRetention(tenantId)

    return { ok: true, data: mapUbicacion(row) }
  }

  async getUltima(
    tenantId: number,
    repartoId: number,
    actor: { role: string; userId: number },
  ): Promise<ServiceResult<RepartoUbicacionPoint | null>> {
    const reparto = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      select: { id: true, choferId: true },
    })
    if (!reparto) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }

    if (actor.role === 'driver') {
      if (reparto.choferId !== actor.userId) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
    } else if (!isGpsViewer(actor.role)) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }

    const ultima = await this.prisma.repartoUbicacion.findFirst({
      where: { tenantId, repartoId },
      orderBy: { recordedAt: 'desc' },
    })

    return { ok: true, data: ultima ? mapUbicacion(ultima) : null }
  }

  async listActivos(tenantId: number, actorRole: string): Promise<ServiceResult<RepartoActivoRow[]>> {
    if (!isGpsViewer(actorRole)) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }

    const repartos = await this.prisma.reparto.findMany({
      where: { tenantId, estado: 'on_route' },
      include: activosInclude,
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    })

    const ids = repartos.map((r) => r.id)
    if (ids.length === 0) {
      return { ok: true, data: [] }
    }

    const ubicaciones = await this.prisma.repartoUbicacion.findMany({
      where: { tenantId, repartoId: { in: ids } },
      orderBy: { recordedAt: 'desc' },
    })

    const ultimaByReparto = new Map<number, RepartoUbicacionPoint>()
    for (const u of ubicaciones) {
      if (!ultimaByReparto.has(u.repartoId)) {
        ultimaByReparto.set(u.repartoId, mapUbicacion(u))
      }
    }

    return {
      ok: true,
      data: repartos.map((r) => mapActivoRow(r, ultimaByReparto.get(r.id) ?? null)),
    }
  }
}
