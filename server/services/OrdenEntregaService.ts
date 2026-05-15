import type { Prisma, PrismaClient } from '@prisma/client'
import type { OrdenEntregaCreateInput, OrdenEntregaEstado, OrdenEntregaUpdateBody } from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

export const ORDEN_ENTREGA_ESTADOS: OrdenEntregaEstado[] = [
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
]

const ALLOWED_TRANSITIONS: Record<OrdenEntregaEstado, OrdenEntregaEstado[]> = {
  pending: ['assigned', 'failed'],
  assigned: ['in_transit', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  failed: [],
}

const ordenInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true } },
  zona: { select: { id: true, nombre: true } },
  driver: { select: { id: true, username: true, role: true } },
  factura: { select: { id: true, tipo: true, prefijo: true, numero: true } },
} satisfies Prisma.OrdenEntregaInclude

export type OrdenEntregaRow = Prisma.OrdenEntregaGetPayload<{ include: typeof ordenInclude }>

export type OrdenEntregaListResult = {
  total: number
  ordenes: OrdenEntregaRow[]
}

function isValidTransition(from: OrdenEntregaEstado, to: OrdenEntregaEstado): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

function requiresDeliverConfirm(to: OrdenEntregaEstado): boolean {
  return to === 'delivered'
}

function requiresDispatch(to: OrdenEntregaEstado): boolean {
  return to === 'assigned' || to === 'in_transit' || to === 'failed'
}

/**
 * @en Delivery order lifecycle (list, create, status updates).
 * @es Ciclo de vida de órdenes de entrega (listado, alta, cambios de estado).
 * @pt-BR Ciclo de vida de ordens de entrega (listagem, criação, mudanças de status).
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

    const [total, ordenes] = await Promise.all([
      this.prisma.ordenEntrega.count({ where }),
      this.prisma.ordenEntrega.findMany({
        where,
        include: ordenInclude,
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
        take,
        skip,
      }),
    ])
    return { total, ordenes }
  }

  async getById(tenantId: number, id: number): Promise<OrdenEntregaRow | null> {
    return this.prisma.ordenEntrega.findFirst({
      where: { id, tenantId },
      include: ordenInclude,
    })
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

  async create(tenantId: number, input: OrdenEntregaCreateInput): Promise<ServiceResult<OrdenEntregaRow>> {
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
    return { ok: true, data: orden }
  }

  async update(
    tenantId: number,
    id: number,
    input: OrdenEntregaUpdateBody,
    actor: { userId: number; role: string; canDispatch: boolean; canDeliverConfirm: boolean },
  ): Promise<ServiceResult<{ orden: OrdenEntregaRow; auditAction: string; previousEstado: OrdenEntregaEstado }>> {
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

    const auditAction =
      toEstado === 'delivered' && fromEstado !== 'delivered'
        ? 'entrega_confirmed'
        : `orden_entrega_${toEstado}`

    return { ok: true, data: { orden, auditAction, previousEstado: fromEstado } }
  }
}
