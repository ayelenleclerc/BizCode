import type { Prisma, PrismaClient } from '@prisma/client'
import type { OrdenEntregaCreateInput, OrdenEntregaEstado, OrdenEntregaUpdateBody } from '@bizcode/types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

export const ORDEN_ENTREGA_ESTADOS: OrdenEntregaEstado[] = [
  'pending',
  'picking',
  'ready',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
]

const ALLOWED_TRANSITIONS: Record<OrdenEntregaEstado, OrdenEntregaEstado[]> = {
  pending: ['picking', 'cancelled', 'failed'],
  picking: ['ready', 'cancelled'],
  ready: ['cancelled'],
  assigned: ['in_transit', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  failed: [],
  cancelled: [],
}

const ordenInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true } },
  zona: { select: { id: true, nombre: true, horario: true } },
  driver: { select: { id: true, username: true, role: true } },
  picker: { select: { id: true, username: true, role: true } },
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
} satisfies Prisma.OrdenEntregaInclude

export type OrdenEntregaRow = Prisma.OrdenEntregaGetPayload<{ include: typeof ordenInclude }>

export type OrdenEntregaLineItem = {
  id: number
  cantidad: number
  articulo: { id: number; codigo: number; descripcion: string }
}

export type OrdenEntregaFacturaHeader = {
  id: number
  tipo: string
  prefijo: string
  numero: number
}

export type OrdenEntregaPublic = Omit<OrdenEntregaRow, 'factura'> & {
  factura: OrdenEntregaFacturaHeader | null
  items: OrdenEntregaLineItem[]
}

export type OrdenEntregaListResult = {
  total: number
  ordenes: OrdenEntregaPublic[]
}

function mapLineItems(row: OrdenEntregaRow): OrdenEntregaLineItem[] {
  const facturaItems = row.factura?.items
  if (!facturaItems?.length) return []
  return facturaItems
    .filter((item): item is typeof item & { articulo: NonNullable<typeof item.articulo> } => item.articulo != null)
    .map((item) => ({
      id: item.id,
      cantidad: Number(item.cantidad),
      articulo: item.articulo,
    }))
}

export function mapOrdenEntregaPublic(row: OrdenEntregaRow): OrdenEntregaPublic {
  const { factura, ...rest } = row
  const facturaHeader = factura
    ? { id: factura.id, tipo: factura.tipo, prefijo: factura.prefijo, numero: factura.numero }
    : null
  return {
    ...rest,
    factura: facturaHeader,
    items: mapLineItems(row),
  }
}

function isValidTransition(from: OrdenEntregaEstado, to: OrdenEntregaEstado): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

function requiresDeliverConfirm(to: OrdenEntregaEstado): boolean {
  return to === 'delivered'
}

function requiresDispatch(to: OrdenEntregaEstado): boolean {
  return to === 'in_transit' || to === 'failed'
}

/**
 * @en Delivery order lifecycle (list, create, status updates, warehouse picking).
 * @es Ciclo de vida de órdenes de entrega (listado, alta, cambios de estado, picking en depósito).
 * @pt-BR Ciclo de vida de ordens de entrega (listagem, criação, mudanças de status, picking no depósito).
 */
export class OrdenEntregaService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: {
      estado?: OrdenEntregaEstado
      zonaId?: number
      driverId?: number
      fecha?: Date
    },
    take: number,
    skip: number,
  ): Promise<OrdenEntregaListResult> {
    const where: Prisma.OrdenEntregaWhereInput = { tenantId }
    if (filters.estado !== undefined) {
      where.estado = filters.estado
    }
    if (filters.zonaId !== undefined) {
      where.zonaId = filters.zonaId
    }
    if (filters.driverId !== undefined) {
      where.driverId = filters.driverId
    }
    if (filters.fecha !== undefined) {
      const start = new Date(filters.fecha)
      start.setHours(0, 0, 0, 0)
      const end = new Date(filters.fecha)
      end.setHours(23, 59, 59, 999)
      where.fecha = { gte: start, lte: end }
    }

    const [total, rows] = await Promise.all([
      this.prisma.ordenEntrega.count({ where }),
      this.prisma.ordenEntrega.findMany({
        where,
        include: ordenInclude,
        orderBy: [{ zona: { nombre: 'asc' } }, { fecha: 'asc' }, { id: 'asc' }],
        take,
        skip,
      }),
    ])
    return { total, ordenes: rows.map(mapOrdenEntregaPublic) }
  }

  async getById(tenantId: number, id: number): Promise<OrdenEntregaPublic | null> {
    const row = await this.prisma.ordenEntrega.findFirst({
      where: { id, tenantId },
      include: ordenInclude,
    })
    return row ? mapOrdenEntregaPublic(row) : null
  }

  private async validateRefs(
    tenantId: number,
    input: { clienteId: number; facturaId?: number | null; zonaId?: number | null; driverId?: number | null },
  ): Promise<ServiceResult<null>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }

    if (input.facturaId != null) {
      const factura = await this.prisma.factura.findFirst({
        where: { id: input.facturaId, tenantId, clienteId: input.clienteId },
        select: { id: true },
      })
      if (!factura) {
        return { ok: false, status: 400, error: 'facturaId is not valid for this cliente' }
      }
    }

    if (input.zonaId != null) {
      const zona = await this.prisma.deliveryZone.findFirst({
        where: { id: input.zonaId, tenantId },
        select: { id: true },
      })
      if (!zona) {
        return { ok: false, status: 400, error: 'zonaId is not valid for this tenant' }
      }
    }

    if (input.driverId != null) {
      const driver = await this.prisma.appUser.findFirst({
        where: { id: input.driverId, tenantId, role: 'driver', active: true },
        select: { id: true },
      })
      if (!driver) {
        return { ok: false, status: 400, error: 'driverId must be an active driver for this tenant' }
      }
    }

    return { ok: true, data: null }
  }

  async create(tenantId: number, input: OrdenEntregaCreateInput): Promise<ServiceResult<OrdenEntregaPublic>> {
    const refs = await this.validateRefs(tenantId, input)
    if (!refs.ok) return refs

    const fecha = facturaFechaToPrismaDate(input.fecha)
    let estado: OrdenEntregaEstado = 'pending'
    if (input.driverId != null) {
      estado = 'assigned'
    }

    const orden = await this.prisma.ordenEntrega.create({
      data: {
        tenantId,
        clienteId: input.clienteId,
        facturaId: input.facturaId,
        zonaId: input.zonaId,
        driverId: input.driverId,
        fecha,
        estado,
        nota: input.nota,
      },
      include: ordenInclude,
    })
    return { ok: true, data: mapOrdenEntregaPublic(orden) }
  }

  async iniciarPicking(
    tenantId: number,
    id: number,
    userId: number,
  ): Promise<ServiceResult<OrdenEntregaPublic>> {
    const existing = await this.prisma.ordenEntrega.findFirst({
      where: { id, tenantId },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenEntrega not found' }
    }

    const fromEstado = existing.estado as OrdenEntregaEstado

    if (fromEstado === 'picking') {
      if (existing.pickerUserId === userId) {
        const current = await this.getById(tenantId, id)
        if (!current) {
          return { ok: false, status: 404, error: 'OrdenEntrega not found' }
        }
        return { ok: true, data: current }
      }
      return { ok: false, status: 409, error: 'PICKING_ASSIGNED_TO_OTHER_USER' }
    }

    if (fromEstado !== 'pending') {
      return { ok: false, status: 422, error: `Invalid transition from ${fromEstado} to picking` }
    }

    const orden = await this.prisma.ordenEntrega.update({
      where: { id },
      data: {
        estado: 'picking',
        pickerUserId: userId,
        pickingIniciadoAt: new Date(),
      },
      include: ordenInclude,
    })
    return { ok: true, data: mapOrdenEntregaPublic(orden) }
  }

  async marcarLista(
    tenantId: number,
    id: number,
    userId: number,
    allowLeadOverride: boolean,
  ): Promise<ServiceResult<OrdenEntregaPublic>> {
    const existing = await this.prisma.ordenEntrega.findFirst({
      where: { id, tenantId },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenEntrega not found' }
    }

    const fromEstado = existing.estado as OrdenEntregaEstado
    if (fromEstado !== 'picking') {
      return { ok: false, status: 422, error: `Invalid transition from ${fromEstado} to ready` }
    }

    if (existing.pickerUserId !== userId && !allowLeadOverride) {
      return { ok: false, status: 409, error: 'PICKING_ASSIGNED_TO_OTHER_USER' }
    }

    const orden = await this.prisma.ordenEntrega.update({
      where: { id },
      data: {
        estado: 'ready',
        pickingListoAt: new Date(),
      },
      include: ordenInclude,
    })
    return { ok: true, data: mapOrdenEntregaPublic(orden) }
  }

  async update(
    tenantId: number,
    id: number,
    input: OrdenEntregaUpdateBody,
    actor: { userId: number; role: string; canDispatch: boolean; canDeliverConfirm: boolean },
  ): Promise<
    ServiceResult<{ orden: OrdenEntregaPublic; auditAction: string; previousEstado: OrdenEntregaEstado }>
  > {
    const existing = await this.prisma.ordenEntrega.findFirst({
      where: { id, tenantId },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenEntrega not found' }
    }

    if (actor.role === 'driver') {
      if (existing.driverId !== actor.userId) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
      if (input.estado !== 'delivered' || existing.estado !== 'in_transit') {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
      if (!actor.canDeliverConfirm) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
    }

    const fromEstado = existing.estado as OrdenEntregaEstado
    const toEstado = input.estado

    if (fromEstado === toEstado && input.driverId === undefined && input.zonaId === undefined && input.nota === undefined) {
      return { ok: false, status: 422, error: 'No changes provided' }
    }

    if (fromEstado !== toEstado) {
      if (!isValidTransition(fromEstado, toEstado)) {
        return { ok: false, status: 422, error: `Invalid transition from ${fromEstado} to ${toEstado}` }
      }
      if (requiresDeliverConfirm(toEstado) && !actor.canDeliverConfirm) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
      if (requiresDispatch(toEstado) && !actor.canDispatch) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
      if (toEstado === 'cancelled' && !actor.canDispatch) {
        return { ok: false, status: 403, error: 'Forbidden' }
      }
    }

    const nextDriverId = input.driverId !== undefined ? input.driverId : existing.driverId
    const refs = await this.validateRefs(tenantId, {
      clienteId: existing.clienteId,
      facturaId: existing.facturaId,
      zonaId: input.zonaId !== undefined ? input.zonaId : existing.zonaId,
      driverId: nextDriverId,
    })
    if (!refs.ok) return refs

    if (toEstado === 'assigned' && nextDriverId == null) {
      return { ok: false, status: 422, error: 'driverId is required when estado is assigned' }
    }

    const data: Prisma.OrdenEntregaUncheckedUpdateInput = {}
    if (fromEstado !== toEstado) {
      data.estado = toEstado
      if (toEstado === 'cancelled') {
        data.pickerUserId = null
      }
      if (toEstado === 'in_transit' && existing.dispatchedAt == null) {
        data.dispatchedAt = new Date()
        data.dispatchTimestampSource = 'event'
      }
    }
    if (input.driverId !== undefined) {
      data.driverId = input.driverId
    }
    if (input.zonaId !== undefined) {
      data.zonaId = input.zonaId
    }
    if (input.nota !== undefined) {
      data.nota = input.nota
    }

    const orden = await this.prisma.ordenEntrega.update({
      where: { id },
      data,
      include: ordenInclude,
    })

    if (toEstado === 'in_transit' && fromEstado !== 'in_transit') {
      void this.enqueueTiendanubeMarkDispatchedIfNeeded(tenantId, orden).catch(() => undefined)
      void this.enqueueWooCommerceMarkDispatchedIfNeeded(tenantId, orden).catch(() => undefined)
    }

    const auditAction =
      toEstado === 'delivered' && fromEstado !== 'delivered'
        ? 'entrega_confirmed'
        : `orden_entrega_${toEstado}`

    return {
      ok: true,
      data: { orden: mapOrdenEntregaPublic(orden), auditAction, previousEstado: fromEstado },
    }
  }

  /**
   * @en When an OE is dispatched, notify Tiendanube fulfillment for linked Pedido (#187).
   * @es Al despachar una OE, notifica fulfillment Tiendanube del Pedido vinculado (#187).
   * @pt-BR Ao despachar uma OE, notifica fulfillment Tiendanube do Pedido vinculado (#187).
   */
  private async enqueueTiendanubeMarkDispatchedIfNeeded(
    tenantId: number,
    orden: OrdenEntregaRow,
  ): Promise<void> {
    let pedidoId: number | null = null
    const remito = await this.prisma.remito.findFirst({
      where: { tenantId, ordenEntregaId: orden.id },
      select: { pedidoId: true, pedido: { select: { origen: true } } },
    })
    if (remito?.pedidoId && remito.pedido?.origen === 'tiendanube') {
      pedidoId = remito.pedidoId
    } else if (orden.facturaId != null) {
      const pedido = await this.prisma.pedido.findFirst({
        where: { tenantId, facturaId: orden.facturaId, origen: 'tiendanube' },
        select: { id: true },
      })
      pedidoId = pedido?.id ?? null
    }
    if (pedidoId == null) return
    const { TiendanubeOrderImportService } = await import('./TiendanubeOrderImportService')
    await new TiendanubeOrderImportService(this.prisma).enqueueMarkDispatched(tenantId, pedidoId)
  }

  /**
   * @en When an OE is dispatched, notify WooCommerce fulfillment for linked Pedido (#188).
   * @es Al despachar una OE, notifica fulfillment WooCommerce del Pedido vinculado (#188).
   * @pt-BR Ao despachar uma OE, notifica fulfillment WooCommerce do Pedido vinculado (#188).
   */
  private async enqueueWooCommerceMarkDispatchedIfNeeded(
    tenantId: number,
    orden: OrdenEntregaRow,
  ): Promise<void> {
    let pedidoId: number | null = null
    const remito = await this.prisma.remito.findFirst({
      where: { tenantId, ordenEntregaId: orden.id },
      select: { pedidoId: true, pedido: { select: { origen: true } } },
    })
    if (remito?.pedidoId && remito.pedido?.origen === 'woocommerce') {
      pedidoId = remito.pedidoId
    } else if (orden.facturaId != null) {
      const pedido = await this.prisma.pedido.findFirst({
        where: { tenantId, facturaId: orden.facturaId, origen: 'woocommerce' },
        select: { id: true },
      })
      pedidoId = pedido?.id ?? null
    }
    if (pedidoId == null) return
    const { WooCommerceOrderImportService } = await import('./WooCommerceOrderImportService')
    await new WooCommerceOrderImportService(this.prisma).enqueueMarkDispatched(tenantId, pedidoId)
  }
}
