import { Prisma, type PrismaClient } from '@prisma/client'
import type { RepartoCreateInput, RepartoItemPodInput } from '@bizcode/types'
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
import { notifyLogisticsPlannersForRepartoConflict } from './logisticsPlannerNotify'
import { notifyDriverForRepartoEvent } from './driverPushNotify'
import { optimizeStopOrder, type RouteStopCoord } from './repartoRouteOptimizeMath'

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
          cliente: {
            select: {
              id: true,
              codigo: true,
              rsocial: true,
              domicilio: true,
              localidad: true,
              telef: true,
              latitud: true,
              longitud: true,
              balance: true,
            },
          },
          zona: { select: { id: true, nombre: true } },
          factura: {
            select: {
              id: true,
              tipo: true,
              prefijo: true,
              numero: true,
              items: {
                select: {
                  id: true,
                  cantidad: true,
                  articulo: { select: { id: true, codigo: true, descripcion: true } },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.RepartoInclude

export type RepartoRow = Prisma.RepartoGetPayload<{ include: typeof repartoInclude }>

export type RepartoItemRow = RepartoRow['items'][number]

export type RepartoClienteDeudaSnapshot = {
  saldo: string
  facturasPendientes: {
    facturaId: number
    facturaRef: string
    fecha: string
    total: string
    pagado: string
    pendiente: string
  }[]
}

export type RepartoClientePublic = {
  id: number
  codigo: number
  rsocial: string
  domicilio: string | null
  localidad: string | null
  telef: string | null
  latitud: number | null
  longitud: number | null
  balance: string
  deuda: RepartoClienteDeudaSnapshot | null
}

export type RepartoOrdenEntregaPublic = Omit<RepartoItemRow['ordenEntrega'], 'cliente' | 'factura'> & {
  items: { id: number; cantidad: number; articulo: { id: number; codigo: number; descripcion: string } }[]
  cliente: RepartoClientePublic
  factura: { id: number; tipo: string; prefijo: string; numero: number } | null
}

export type RepartoItemPublicRow = Omit<RepartoItemRow, 'podMedia' | 'ordenEntrega'> & {
  hasPod: boolean
  ordenEntrega: RepartoOrdenEntregaPublic
}

export type RepartoListRow = Omit<RepartoRow, 'items'> & {
  items: RepartoItemPublicRow[]
  progress: { total: number; delivered: number; pending: number }
}

export type RepartoItemPodDetail = RepartoItemPublicRow & {
  podMedia: PodMediaPayload | null
}

function dayBounds(fecha: Date): { start: Date; end: Date } {
  const start = new Date(fecha)
  start.setHours(0, 0, 0, 0)
  const end = new Date(fecha)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function toCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    const n = (value as { toNumber: () => number }).toNumber()
    return Number.isFinite(n) ? n : null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toMoneyString(value: unknown): string {
  if (value == null) return '0.00'
  if (typeof value === 'object' && value !== null && 'toFixed' in value) {
    return (value as { toFixed: (digits: number) => string }).toFixed(2)
  }
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function formatFacturaRef(factura: { tipo: string; prefijo: string; numero: number }): string {
  return `${factura.tipo} ${factura.prefijo}-${factura.numero}`
}

function mapLineItems(
  factura: RepartoItemRow['ordenEntrega']['factura'],
): { id: number; cantidad: number; articulo: { id: number; codigo: number; descripcion: string } }[] {
  const facturaItems = factura && 'items' in factura ? factura.items : undefined
  if (!facturaItems?.length) return []
  return facturaItems
    .filter(
      (item): item is typeof item & { articulo: NonNullable<typeof item.articulo> } => item.articulo != null,
    )
    .map((item) => ({
      id: item.id,
      cantidad: Number(item.cantidad),
      articulo: item.articulo,
    }))
}

function mapCliente(cliente: RepartoItemRow['ordenEntrega']['cliente']): RepartoClientePublic {
  return {
    id: cliente.id,
    codigo: cliente.codigo,
    rsocial: cliente.rsocial,
    domicilio: cliente.domicilio ?? null,
    localidad: cliente.localidad ?? null,
    telef: cliente.telef ?? null,
    latitud: toCoord(cliente.latitud),
    longitud: toCoord(cliente.longitud),
    balance: toMoneyString(cliente.balance),
    deuda: null,
  }
}

function mapOrdenEntrega(oe: RepartoItemRow['ordenEntrega']): RepartoOrdenEntregaPublic {
  const { cliente: _cliente, factura, ...rest } = oe
  return {
    ...rest,
    items: mapLineItems(factura),
    cliente: mapCliente(oe.cliente),
    factura: factura
      ? { id: factura.id, tipo: factura.tipo, prefijo: factura.prefijo, numero: factura.numero }
      : null,
  }
}

function sanitizeItem(item: RepartoItemRow): RepartoItemPublicRow {
  const { podMedia: _pod, ...rest } = item
  return { ...rest, hasPod: itemHasPod(item), ordenEntrega: mapOrdenEntrega(item.ordenEntrega) }
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
    if (!row) return null
    return this.withDebtSnapshot(withProgress(row))
  }

  private async findMineRow(tenantId: number, choferId: number, fecha: Date): Promise<RepartoRow | null> {
    const { start, end } = dayBounds(fecha)
    const dateWhere = { tenantId, choferId, fecha: { gte: start, lte: end } }
    const onRoute = await this.prisma.reparto.findFirst({
      where: { ...dateWhere, estado: 'on_route' },
      include: repartoInclude,
      orderBy: { id: 'desc' },
    })
    return (
      onRoute ??
      (await this.prisma.reparto.findFirst({
        where: { ...dateWhere, estado: 'planned' },
        include: repartoInclude,
        orderBy: { id: 'desc' },
      }))
    )
  }

  /**
   * @en Driver's own route for a calendar day: prefer `on_route`, else latest `planned` (#160).
   * @es Ruta del chofer en un día: prioriza `on_route`; si no, el `planned` más reciente (#160).
   * @pt-BR Rota do motorista no dia: prefere `on_route`; senão o `planned` mais recente (#160).
   */
  async getMine(tenantId: number, choferId: number, fecha: Date): Promise<RepartoListRow | null> {
    const row = await this.findMineRow(tenantId, choferId, fecha)
    if (!row) return null
    return this.withDebtSnapshot(withProgress(row))
  }

  /**
   * @en True when `clienteId` is a stop on the driver's `getMine` route for that day (#162).
   * @es True si `clienteId` es una parada de la ruta `getMine` del chofer ese día (#162).
   * @pt-BR True se `clienteId` é uma parada da rota `getMine` do motorista nesse dia (#162).
   */
  async clienteOnMine(tenantId: number, choferId: number, clienteId: number, fecha: Date): Promise<boolean> {
    const row = await this.findMineRow(tenantId, choferId, fecha)
    if (!row) return false
    return row.items.some((item) => item.ordenEntrega.clienteId === clienteId)
  }

  private async withDebtSnapshot(reparto: RepartoListRow): Promise<RepartoListRow> {
    const clienteIds = [
      ...new Set(
        reparto.items
          .map((item) => item.ordenEntrega.clienteId)
          .filter((id): id is number => typeof id === 'number' && id > 0),
      ),
    ]
    if (clienteIds.length === 0) return reparto

    const facturas = await this.prisma.factura.findMany({
      where: { tenantId: reparto.tenantId, clienteId: { in: clienteIds }, estado: 'A' },
      orderBy: { fecha: 'asc' },
      select: { id: true, clienteId: true, tipo: true, prefijo: true, numero: true, fecha: true, total: true },
    })
    const facturaIds = facturas.map((f) => f.id)
    const allocations =
      facturaIds.length === 0
        ? []
        : await this.prisma.reciboCobroImputacion.groupBy({
            by: ['facturaId'],
            where: {
              facturaId: { in: facturaIds },
              reciboCobro: { tenantId: reparto.tenantId, estado: 'emitido' },
            },
            _sum: { importe: true },
          })
    const paidMap = new Map<number, string>()
    for (const row of allocations) {
      if (row._sum.importe != null) {
        paidMap.set(row.facturaId, toMoneyString(row._sum.importe))
      }
    }

    const pendientesByCliente = new Map<
      number,
      {
        facturaId: number
        facturaRef: string
        fecha: string
        total: string
        pagado: string
        pendiente: string
      }[]
    >()
    for (const f of facturas) {
      const pagadoRaw = paidMap.get(f.id)
      const totalN = Number(toMoneyString(f.total))
      const pagadoN = pagadoRaw != null ? Number(pagadoRaw) : 0
      const pendienteN = totalN - pagadoN
      if (pendienteN <= 0) continue
      const list = pendientesByCliente.get(f.clienteId) ?? []
      list.push({
        facturaId: f.id,
        facturaRef: formatFacturaRef(f),
        fecha: f.fecha.toISOString(),
        total: toMoneyString(f.total),
        pagado: toMoneyString(pagadoN),
        pendiente: toMoneyString(pendienteN),
      })
      pendientesByCliente.set(f.clienteId, list)
    }

    return {
      ...reparto,
      items: reparto.items.map((item) => {
        const cliente = item.ordenEntrega.cliente
        if (!cliente) return item
        const facturasPendientes = pendientesByCliente.get(item.ordenEntrega.clienteId) ?? []
        return {
          ...item,
          ordenEntrega: {
            ...item.ordenEntrega,
            cliente: {
              ...cliente,
              deuda: {
                saldo: cliente.balance ?? '0.00',
                facturasPendientes,
              },
            },
          },
        }
      }),
    }
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

    await notifyDriverForRepartoEvent(this.prisma, tenantId, input.choferId, 'reparto_assigned', {
      repartoId: row.id,
      stopCount: uniqueIds.length,
    }).catch(() => {
      /* push must not break create */
    })

    return { ok: true, data: withProgress(row) }
  }

  async addItems(
    tenantId: number,
    repartoId: number,
    ordenEntregaIds: number[],
  ): Promise<ServiceResult<RepartoListRow>> {
    const uniqueIds = [...new Set(ordenEntregaIds)]
    if (uniqueIds.length === 0) {
      return { ok: false, status: 400, error: 'ordenEntregaIds must contain at least one id' }
    }

    const existing = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      include: { items: { select: { secuencia: true } } },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (existing.estado !== 'planned' && existing.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const ordenes = await this.prisma.ordenEntrega.findMany({
      where: { tenantId, id: { in: uniqueIds } },
      select: { id: true, estado: true },
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

    const maxSecuencia = existing.items.reduce((max, item) => Math.max(max, item.secuencia), 0)
    const onRoute = existing.estado === 'on_route'
    const now = new Date()

    const row = await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < uniqueIds.length; index++) {
        const ordenEntregaId = uniqueIds[index]!
        await tx.repartoItem.create({
          data: {
            repartoId,
            ordenEntregaId,
            secuencia: maxSecuencia + index + 1,
            estado: 'pending',
          },
        })
      }

      await tx.ordenEntrega.updateMany({
        where: { tenantId, id: { in: uniqueIds } },
        data: onRoute
          ? {
              estado: 'in_transit',
              driverId: existing.choferId,
              dispatchedAt: now,
              dispatchTimestampSource: 'event',
            }
          : { estado: 'assigned', driverId: existing.choferId },
      })

      return tx.reparto.findFirstOrThrow({
        where: { id: repartoId, tenantId },
        include: repartoInclude,
      })
    })

    const lastItem = row.items[row.items.length - 1]
    await notifyDriverForRepartoEvent(this.prisma, tenantId, row.choferId, 'reparto_stop_added', {
      repartoId: row.id,
      itemId: lastItem?.id,
      addedCount: uniqueIds.length,
    }).catch(() => {
      /* push must not break addItems */
    })

    return { ok: true, data: withProgress(row) }
  }

  async removeItem(
    tenantId: number,
    repartoId: number,
    itemId: number,
  ): Promise<ServiceResult<RepartoListRow>> {
    const existing = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      select: { id: true, estado: true, choferId: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (existing.estado !== 'planned' && existing.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const item = await this.prisma.repartoItem.findFirst({
      where: { id: itemId, repartoId, reparto: { tenantId } },
      select: { id: true, estado: true, ordenEntregaId: true },
    })
    if (!item) {
      return { ok: false, status: 404, error: 'REPARTO_ITEM_NOT_FOUND' }
    }
    if (item.estado !== 'pending') {
      return { ok: false, status: 422, error: 'REPARTO_ITEM_INVALID_STATE' }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.repartoItem.delete({ where: { id: itemId } })
      await tx.ordenEntrega.update({
        where: { id: item.ordenEntregaId },
        data: {
          estado: 'ready',
          driverId: null,
          dispatchedAt: null,
          dispatchTimestampSource: null,
        },
      })
      return tx.reparto.findFirstOrThrow({
        where: { id: repartoId, tenantId },
        include: repartoInclude,
      })
    })

    await notifyDriverForRepartoEvent(this.prisma, tenantId, existing.choferId, 'reparto_stop_removed', {
      repartoId,
      itemId,
    }).catch(() => {
      /* push must not break removeItem */
    })

    return { ok: true, data: withProgress(row) }
  }

  /**
   * @en Preview or apply haversine NN+2-opt stop order (#199). Origin = lowest-secuencia stop with coords.
   * @es Preview o aplica orden NN+2-opt haversine (#199). Origen = parada de menor secuencia con coords.
   * @pt-BR Preview ou aplica ordem NN+2-opt haversine (#199). Origem = parada de menor sequência com coords.
   */
  async optimizeRoute(
    tenantId: number,
    id: number,
    apply: boolean,
  ): Promise<
    ServiceResult<{
      applied: boolean
      distanceBeforeKm: number
      distanceAfterKm: number
      improvementPercent: number
      orderedItemIds: number[]
      stops: Array<{
        repartoItemId: number
        secuencia: number
        latitud: number
        longitud: number
        clienteRsocial: string | null
      }>
      skippedWithoutCoords: number
      reparto: RepartoListRow | null
    }>
  > {
    const existing = await this.prisma.reparto.findFirst({
      where: { id, tenantId },
      include: repartoInclude,
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (existing.estado !== 'planned' && existing.estado !== 'on_route') {
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const withCoords: RouteStopCoord[] = []
    const withoutCoords: typeof existing.items = []
    for (const item of existing.items) {
      const lat = toCoord(item.ordenEntrega.cliente.latitud)
      const lng = toCoord(item.ordenEntrega.cliente.longitud)
      if (lat != null && lng != null) {
        withCoords.push({ id: item.id, lat, lng, secuencia: item.secuencia })
      } else {
        withoutCoords.push(item)
      }
    }

    if (withCoords.length < 2) {
      return { ok: false, status: 422, error: 'REPARTO_ROUTE_INSUFFICIENT_COORDS' }
    }

    const math = optimizeStopOrder(withCoords)
    const byId = new Map(existing.items.map((item) => [item.id, item]))
    const orderedGeocoded = math.orderedIds.map((itemId) => byId.get(itemId)!).filter(Boolean)
    const finalOrder = [...orderedGeocoded, ...withoutCoords.sort((a, b) => a.secuencia - b.secuencia)]

    const stops = orderedGeocoded.map((item, index) => {
      const lat = toCoord(item.ordenEntrega.cliente.latitud)!
      const lng = toCoord(item.ordenEntrega.cliente.longitud)!
      return {
        repartoItemId: item.id,
        secuencia: index + 1,
        latitud: lat,
        longitud: lng,
        clienteRsocial: item.ordenEntrega.cliente.rsocial ?? null,
      }
    })

    const payload = {
      applied: false,
      distanceBeforeKm: Math.round(math.distanceBeforeKm * 1000) / 1000,
      distanceAfterKm: Math.round(math.distanceAfterKm * 1000) / 1000,
      improvementPercent: Math.round(math.improvementRatio * 10000) / 100,
      orderedItemIds: finalOrder.map((item) => item.id),
      stops,
      skippedWithoutCoords: withoutCoords.length,
      reparto: null as RepartoListRow | null,
    }

    if (!apply) {
      return { ok: true, data: payload }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < finalOrder.length; index += 1) {
        const item = finalOrder[index]!
        await tx.repartoItem.update({
          where: { id: item.id },
          data: { secuencia: index + 1 },
        })
      }
      return tx.reparto.findFirstOrThrow({
        where: { id, tenantId },
        include: repartoInclude,
      })
    })

    return {
      ok: true,
      data: {
        ...payload,
        applied: true,
        reparto: withProgress(row),
      },
    }
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
      await notifyLogisticsPlannersForRepartoConflict(this.prisma, tenantId, {
        repartoId,
        itemId,
        code: 'REPARTO_INVALID_STATE',
        actorUserId: actor.userId,
      }).catch(() => {
        /* notify must not break POD */
      })
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
      await notifyLogisticsPlannersForRepartoConflict(this.prisma, tenantId, {
        repartoId,
        itemId,
        code: 'REPARTO_ITEM_INVALID_STATE',
        actorUserId: actor.userId,
      }).catch(() => {
        /* notify must not break POD */
      })
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
