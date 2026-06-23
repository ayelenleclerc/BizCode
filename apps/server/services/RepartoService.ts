import { Prisma, type PrismaClient } from '@prisma/client'
import type { RepartoCreateInput, RepartoItemPodInput } from '../createApp.types'
import { assertOrdenNotInActiveReparto } from '../lib/repartoActiveGuard'
import {
  MOTIVO_NO_ENTREGA_VALUES,
  type MotivoNoEntrega,
  type PodMediaPayload,
  itemHasPod,
  isNonEmptyBase64,
  parsePodMediaJson,
  validatePodMediaSizes,
} from '../lib/podMediaValidation'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

export const POD_VIEW_ROLES = ['owner', 'manager', 'logistics_planner'] as const

export const GPS_VIEW_ROLES = ['owner', 'manager', 'logistics_planner'] as const

export const REPARTO_ESTADOS = ['planned', 'on_route', 'completed', 'cancelled'] as const
export type RepartoEstado = (typeof REPARTO_ESTADOS)[number]

export const REPARTO_ITEM_ESTADOS = ['pending', 'delivered', 'not_delivered', 'returned'] as const
export type RepartoItemEstado = (typeof REPARTO_ITEM_ESTADOS)[number]

const repartoInclude = {
  chofer: { select: { id: true, username: true, role: true } },
  items: {
    orderBy: { secuencia: 'asc' as const },
    include: {
      ordenEntrega: {
        include: {
          cliente: { select: { id: true, codigo: true, rsocial: true } },
          zona: { select: { id: true, nombre: true } },
          factura: { select: { id: true, tipo: true, prefijo: true, numero: true } },
        },
      },
    },
  },
} satisfies Prisma.RepartoInclude

export type RepartoRow = Prisma.RepartoGetPayload<{ include: typeof repartoInclude }>

export type RepartoItemRow = RepartoRow['items'][number]

export type RepartoItemPublicRow = Omit<RepartoItemRow, 'podMedia'> & {
  hasPod: boolean
}

export type RepartoListRow = Omit<RepartoRow, 'items'> & {
  items: RepartoItemPublicRow[]
  progress: { total: number; delivered: number; pending: number }
}

export type RepartoItemPodDetail = RepartoItemPublicRow & {
  podMedia: PodMediaPayload | null
}

function sanitizeItem(item: RepartoItemRow): RepartoItemPublicRow {
  const { podMedia: _pod, ...rest } = item
  return { ...rest, hasPod: itemHasPod(item) }
}

function sanitizeReparto(row: RepartoRow): Omit<RepartoListRow, 'progress'> & { items: RepartoItemPublicRow[] } {
  return {
    ...row,
    items: row.items.map(sanitizeItem),
  }
}

export function mapRepartoProgress(items: { estado: string }[]): RepartoListRow['progress'] {
  const total = items.length
  const delivered = items.filter((i) => i.estado === 'delivered').length
  const pending = items.filter((i) => i.estado === 'pending').length
  return { total, delivered, pending }
}

function withProgress(row: RepartoRow): RepartoListRow {
  const base = sanitizeReparto(row)
  return { ...base, progress: mapRepartoProgress(row.items) }
}

/**
 * @en Delivery routes: group orders, start route, close with failed pending OEs (#140).
 * @es Repartos: agrupar OEs, iniciar ruta, cerrar con OEs pendientes en failed (#140).
 * @pt-BR Rotas de entrega: agrupar OEs, iniciar rota, fechar com OEs pendentes em failed (#140).
 */
export class RepartoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: { fecha?: Date; choferId?: number; estado?: RepartoEstado },
    take: number,
    skip: number,
  ): Promise<{ total: number; repartos: RepartoListRow[] }> {
    const where: Prisma.RepartoWhereInput = { tenantId }
    if (filters.estado !== undefined) {
      where.estado = filters.estado
    }
    if (filters.choferId !== undefined) {
      where.choferId = filters.choferId
    }
    if (filters.fecha !== undefined) {
      const start = new Date(filters.fecha)
      start.setHours(0, 0, 0, 0)
      const end = new Date(filters.fecha)
      end.setHours(23, 59, 59, 999)
      where.fecha = { gte: start, lte: end }
    }

    const [total, rows] = await Promise.all([
      this.prisma.reparto.count({ where }),
      this.prisma.reparto.findMany({
        where,
        include: repartoInclude,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, repartos: rows.map(withProgress) }
  }

  async getById(tenantId: number, id: number): Promise<RepartoListRow | null> {
    const row = await this.prisma.reparto.findFirst({
      where: { id, tenantId },
      include: repartoInclude,
    })
    return row ? withProgress(row) : null
  }

  async create(tenantId: number, input: RepartoCreateInput): Promise<ServiceResult<RepartoListRow>> {
    const fecha = facturaFechaToPrismaDate(input.fecha)
    const chofer = await this.prisma.appUser.findFirst({
      where: { id: input.choferId, tenantId, role: 'driver', active: true },
      select: { id: true },
    })
    if (!chofer) {
      return { ok: false, status: 400, error: 'choferId must be an active driver for this tenant' }
    }

    const uniqueIds = [...new Set(input.ordenEntregaIds)]
    if (uniqueIds.length === 0) {
      return { ok: false, status: 400, error: 'ordenEntregaIds must contain at least one id' }
    }

    const ordenes = await this.prisma.ordenEntrega.findMany({
      where: { tenantId, id: { in: uniqueIds } },
      select: { id: true, estado: true, fecha: true },
    })
    if (ordenes.length !== uniqueIds.length) {
      return { ok: false, status: 400, error: 'INVALID_LINE_ITEM' }
    }

    for (const oe of ordenes) {
      if (oe.estado !== 'ready') {
        return { ok: false, status: 422, error: 'INVALID_LINE_ITEM' }
      }
    }

    const guard = await assertOrdenNotInActiveReparto(this.prisma, tenantId, uniqueIds)
    if (!guard.ok) {
      return { ok: false, status: 422, error: 'ORDEN_ALREADY_IN_ACTIVE_REPARTO' }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      const reparto = await tx.reparto.create({
        data: {
          tenantId,
          fecha,
          choferId: input.choferId,
          estado: 'planned',
          vehiculo: input.vehiculo ?? null,
          observaciones: input.observaciones ?? null,
          items: {
            create: uniqueIds.map((ordenEntregaId, index) => ({
              ordenEntregaId,
              secuencia: index + 1,
              estado: 'pending',
            })),
          },
        },
        include: repartoInclude,
      })

      await tx.ordenEntrega.updateMany({
        where: { tenantId, id: { in: uniqueIds } },
        data: { estado: 'assigned', driverId: input.choferId },
      })

      return reparto
    })

    return { ok: true, data: withProgress(row) }
  }

  async iniciar(tenantId: number, id: number): Promise<ServiceResult<RepartoListRow>> {
    const existing = await this.prisma.reparto.findFirst({
      where: { id, tenantId },
      include: { items: { where: { estado: 'pending' }, select: { ordenEntregaId: true } } },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (existing.estado !== 'planned') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const oeIds = existing.items.map((i) => i.ordenEntregaId)

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.reparto.update({
        where: { id },
        data: { estado: 'on_route' },
        include: repartoInclude,
      })
      if (oeIds.length > 0) {
        const now = new Date()
        await tx.ordenEntrega.updateMany({
          where: { tenantId, id: { in: oeIds }, estado: 'assigned' },
          data: {
            estado: 'in_transit',
            dispatchedAt: now,
            dispatchTimestampSource: 'event',
          },
        })
      }
      return updated
    })

    return { ok: true, data: withProgress(row) }
  }

  async cerrar(
    tenantId: number,
    id: number,
  ): Promise<
    ServiceResult<{
      reparto: RepartoListRow
      summary: { pendingClosed: number; delivered: number; notDelivered: number; returned: number }
    }>
  > {
    const existing = await this.prisma.reparto.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (existing.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const pendingItems = existing.items.filter((i) => i.estado === 'pending')
    const pendingOeIds = pendingItems.map((i) => i.ordenEntregaId)
    const now = new Date()

    const row = await this.prisma.$transaction(async (tx) => {
      if (pendingItems.length > 0) {
        await tx.repartoItem.updateMany({
          where: { id: { in: pendingItems.map((i) => i.id) } },
          data: { estado: 'not_delivered' },
        })
        await tx.ordenEntrega.updateMany({
          where: { tenantId, id: { in: pendingOeIds } },
          data: { estado: 'failed' },
        })
      }

      return tx.reparto.update({
        where: { id },
        data: { estado: 'completed', closedAt: now },
        include: repartoInclude,
      })
    })

    const summary = {
      pendingClosed: pendingItems.length,
      delivered: row.items.filter((i) => i.estado === 'delivered').length,
      notDelivered: row.items.filter((i) => i.estado === 'not_delivered').length,
      returned: row.items.filter((i) => i.estado === 'returned').length,
    }

    return { ok: true, data: { reparto: withProgress(row), summary } }
  }

  async updateItemPod(
    tenantId: number,
    repartoId: number,
    itemId: number,
    input: RepartoItemPodInput,
    actor: { userId: number; role: string },
  ): Promise<ServiceResult<{ item: RepartoItemPublicRow; auditSigned: boolean }>> {
    const reparto = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      select: { id: true, estado: true, choferId: true },
    })
    if (!reparto) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (reparto.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }
    if (actor.role === 'driver' && reparto.choferId !== actor.userId) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }

    const item = await this.prisma.repartoItem.findFirst({
      where: { id: itemId, repartoId, reparto: { tenantId } },
      include: { ordenEntrega: repartoInclude.items.include.ordenEntrega },
    })
    if (!item) {
      return { ok: false, status: 404, error: 'REPARTO_ITEM_NOT_FOUND' }
    }
    if (item.estado !== 'pending') {
      return { ok: false, status: 422, error: 'REPARTO_ITEM_INVALID_STATE' }
    }

    const podMedia: PodMediaPayload = {}
    if (input.firmaBase64?.trim()) {
      podMedia.firmaBase64 = input.firmaBase64.trim()
    }
    if (input.fotoBase64?.trim()) {
      podMedia.fotoBase64 = input.fotoBase64.trim()
    }

    if (input.outcome === 'delivered') {
      if (!isNonEmptyBase64(podMedia.firmaBase64)) {
        return { ok: false, status: 422, error: 'POD_FIRMA_REQUIRED' }
      }
      const sizeErr = validatePodMediaSizes(podMedia)
      if (sizeErr) {
        return { ok: false, status: 422, error: sizeErr }
      }
    } else {
      const motivo = input.motivoNoEntrega
      if (motivo == null || !MOTIVO_NO_ENTREGA_VALUES.includes(motivo as MotivoNoEntrega)) {
        return { ok: false, status: 422, error: 'INVALID_MOTIVO_NO_ENTREGA' }
      }
      if (isNonEmptyBase64(podMedia.firmaBase64)) {
        return { ok: false, status: 422, error: 'POD_FIRMA_NOT_ALLOWED' }
      }
    }

    const itemEstado = input.outcome === 'delivered' ? 'delivered' : 'not_delivered'
    const oeEstado = input.outcome === 'delivered' ? 'delivered' : 'failed'
    const now = new Date()

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.repartoItem.update({
        where: { id: itemId },
        data: {
          estado: itemEstado,
          entregadoAt: now,
          receptorNombre: input.outcome === 'delivered' ? (input.receptorNombre?.trim() ?? null) : null,
          receptorDni: input.outcome === 'delivered' ? (input.receptorDni?.trim() || null) : null,
          notasEntrega: input.notasEntrega?.trim() || null,
          motivoNoEntrega: input.outcome === 'not_delivered' ? input.motivoNoEntrega! : null,
          podMedia:
            input.outcome === 'delivered' && Object.keys(podMedia).length > 0
              ? (podMedia as Prisma.InputJsonValue)
              : Prisma.DbNull,
        },
        include: { ordenEntrega: repartoInclude.items.include.ordenEntrega },
      })
      await tx.ordenEntrega.update({
        where: { id: row.ordenEntregaId },
        data: { estado: oeEstado },
      })
      return row
    })

    const fullItem = { ...updated, ordenEntrega: item.ordenEntrega } as RepartoItemRow
    const auditSigned = input.outcome === 'delivered' && isNonEmptyBase64(podMedia.firmaBase64)
    return { ok: true, data: { item: sanitizeItem(fullItem), auditSigned } }
  }

  async getItemPod(
    tenantId: number,
    repartoId: number,
    itemId: number,
    actorRole: string,
  ): Promise<ServiceResult<RepartoItemPodDetail>> {
    if (!POD_VIEW_ROLES.includes(actorRole as (typeof POD_VIEW_ROLES)[number])) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }

    const item = await this.prisma.repartoItem.findFirst({
      where: { id: itemId, repartoId, reparto: { tenantId } },
      include: {
        ordenEntrega: repartoInclude.items.include.ordenEntrega,
      },
    })
    if (!item) {
      return { ok: false, status: 404, error: 'REPARTO_ITEM_NOT_FOUND' }
    }

    const publicRow = sanitizeItem(item as RepartoItemRow)
    const media = parsePodMediaJson(item.podMedia)
    return {
      ok: true,
      data: { ...publicRow, podMedia: media },
    }
  }
}
