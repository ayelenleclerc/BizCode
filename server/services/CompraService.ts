import { Decimal } from '@prisma/client/runtime/library'
import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  OrdenCompraCreateInput,
  OrdenCompraEstado,
  OrdenCompraItemInput,
  OrdenCompraReceiveLineInput,
  OrdenCompraUpdateInput,
} from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

export const ORDEN_COMPRA_ESTADOS: OrdenCompraEstado[] = ['draft', 'sent', 'received', 'cancelled']

const PURCHASE_STOCK_MOTIVO = 'compra'

const ordenInclude = {
  proveedor: { select: { id: true, codigo: true, rsocial: true } },
  items: {
    include: {
      articulo: { select: { id: true, codigo: true, descripcion: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.OrdenCompraInclude

export type OrdenCompraRow = Prisma.OrdenCompraGetPayload<{ include: typeof ordenInclude }>

function computeTotal(items: OrdenCompraItemInput[]): Decimal {
  return items.reduce(
    (sum, line) => sum.add(new Decimal(line.cantidad).mul(line.costoUnitario)),
    new Decimal(0),
  )
}

function parseFechaEstimada(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim().length === 0) {
    return null
  }
  return facturaFechaToPrismaDate(value.trim())
}

function allItemsFullyReceived(items: { cantidad: number; cantidadRecibida: number }[]): boolean {
  return items.length > 0 && items.every((i) => i.cantidadRecibida >= i.cantidad)
}

/**
 * @en Purchase orders to suppliers with partial receive → stock (#135).
 * @es Órdenes de compra a proveedores con recepción parcial → stock (#135).
 * @pt-BR Ordens de compra a fornecedores com recebimento parcial → estoque (#135).
 */
export class CompraService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: { estado?: OrdenCompraEstado; proveedorId?: number },
    take: number,
    skip: number,
  ): Promise<{ total: number; ordenes: OrdenCompraRow[] }> {
    const where: Prisma.OrdenCompraWhereInput = { tenantId }
    if (filters.estado) where.estado = filters.estado
    if (filters.proveedorId !== undefined) where.proveedorId = filters.proveedorId

    const [total, ordenes] = await Promise.all([
      this.prisma.ordenCompra.count({ where }),
      this.prisma.ordenCompra.findMany({
        where,
        include: ordenInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, ordenes }
  }

  async getById(tenantId: number, id: number): Promise<OrdenCompraRow | null> {
    return this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      include: ordenInclude,
    })
  }

  async create(tenantId: number, input: OrdenCompraCreateInput): Promise<ServiceResult<OrdenCompraRow>> {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: input.proveedorId, tenantId, activo: true },
      select: { id: true },
    })
    if (!proveedor) {
      return { ok: false, status: 404, error: 'Proveedor not found' }
    }

    const articuloIds = [...new Set(input.items.map((i) => i.articuloId))]
    const found = await this.prisma.articulo.count({
      where: { tenantId, id: { in: articuloIds }, activo: true },
    })
    if (found !== articuloIds.length) {
      return { ok: false, status: 422, error: 'INVALID_ARTICULO' }
    }

    const total = computeTotal(input.items)
    const row = await this.prisma.ordenCompra.create({
      data: {
        tenantId,
        proveedorId: input.proveedorId,
        estado: 'draft',
        total,
        fechaEstimada: parseFechaEstimada(input.fechaEstimada),
        nota: input.nota,
        items: {
          create: input.items.map((line) => ({
            articuloId: line.articuloId,
            cantidad: line.cantidad,
            costoUnitario: line.costoUnitario,
            subtotal: new Decimal(line.cantidad).mul(line.costoUnitario),
          })),
        },
      },
      include: ordenInclude,
    })
    return { ok: true, data: row }
  }

  async update(
    tenantId: number,
    id: number,
    input: OrdenCompraUpdateInput,
  ): Promise<ServiceResult<OrdenCompraRow>> {
    const existing = await this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenCompra not found' }
    }
    if (existing.estado !== 'draft') {
      return { ok: false, status: 422, error: 'ORDER_NOT_EDITABLE' }
    }

    if (input.proveedorId !== undefined) {
      const proveedor = await this.prisma.proveedor.findFirst({
        where: { id: input.proveedorId, tenantId, activo: true },
        select: { id: true },
      })
      if (!proveedor) {
        return { ok: false, status: 404, error: 'Proveedor not found' }
      }
    }

    if (input.items) {
      const articuloIds = [...new Set(input.items.map((i) => i.articuloId))]
      const found = await this.prisma.articulo.count({
        where: { tenantId, id: { in: articuloIds }, activo: true },
      })
      if (found !== articuloIds.length) {
        return { ok: false, status: 422, error: 'INVALID_ARTICULO' }
      }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      if (input.items) {
        await tx.ordenCompraItem.deleteMany({ where: { ordenCompraId: id } })
      }
      return tx.ordenCompra.update({
        where: { id },
        data: {
          proveedorId: input.proveedorId,
          fechaEstimada:
            input.fechaEstimada === undefined
              ? undefined
              : parseFechaEstimada(input.fechaEstimada),
          nota: input.nota,
          total: input.items ? computeTotal(input.items) : undefined,
          items: input.items
            ? {
                create: input.items.map((line) => ({
                  articuloId: line.articuloId,
                  cantidad: line.cantidad,
                  costoUnitario: line.costoUnitario,
                  subtotal: new Decimal(line.cantidad).mul(line.costoUnitario),
                })),
              }
            : undefined,
        },
        include: ordenInclude,
      })
    })

    return { ok: true, data: row }
  }

  async send(tenantId: number, id: number): Promise<ServiceResult<OrdenCompraRow>> {
    const existing = await this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenCompra not found' }
    }
    if (existing.estado !== 'draft') {
      return { ok: false, status: 422, error: 'INVALID_STATE_TRANSITION' }
    }
    if (existing.items.length === 0) {
      return { ok: false, status: 422, error: 'ORDER_HAS_NO_ITEMS' }
    }

    const row = await this.prisma.ordenCompra.update({
      where: { id },
      data: { estado: 'sent' },
      include: ordenInclude,
    })
    return { ok: true, data: row }
  }

  async cancel(tenantId: number, id: number): Promise<ServiceResult<OrdenCompraRow>> {
    const existing = await this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'OrdenCompra not found' }
    }
    if (existing.estado === 'received' || existing.estado === 'cancelled') {
      return { ok: false, status: 422, error: 'INVALID_STATE_TRANSITION' }
    }

    const row = await this.prisma.ordenCompra.update({
      where: { id },
      data: { estado: 'cancelled' },
      include: ordenInclude,
    })
    return { ok: true, data: row }
  }

  async receive(
    tenantId: number,
    id: number,
    userId: number,
    lines: OrdenCompraReceiveLineInput[],
  ): Promise<ServiceResult<OrdenCompraRow>> {
    const orden = await this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!orden) {
      return { ok: false, status: 404, error: 'OrdenCompra not found' }
    }
    if (orden.estado !== 'sent') {
      return { ok: false, status: 422, error: 'ORDER_NOT_RECEIVABLE' }
    }

    const itemById = new Map(orden.items.map((i) => [i.id, i]))
    for (const line of lines) {
      const item = itemById.get(line.itemId)
      if (!item) {
        return { ok: false, status: 422, error: 'INVALID_LINE_ITEM' }
      }
      const pending = item.cantidad - item.cantidadRecibida
      if (line.cantidad > pending) {
        return { ok: false, status: 422, error: 'RECEIVE_QUANTITY_EXCEEDS_PENDING' }
      }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const item = itemById.get(line.itemId)!
        const newRecibida = item.cantidadRecibida + line.cantidad

        await tx.ordenCompraItem.update({
          where: { id: item.id },
          data: { cantidadRecibida: newRecibida },
        })

        const articulo = await tx.articulo.findFirst({
          where: { id: item.articuloId, tenantId },
          select: { id: true, stock: true },
        })
        if (!articulo) {
          throw new Error('Articulo not found')
        }

        const stockAfter = articulo.stock + line.cantidad
        await tx.articulo.update({
          where: { id: articulo.id },
          data: { stock: stockAfter },
        })
        await tx.stockAjuste.create({
          data: {
            tenantId,
            articuloId: articulo.id,
            cantidad: line.cantidad,
            motivo: PURCHASE_STOCK_MOTIVO,
            userId,
          },
        })

        item.cantidadRecibida = newRecibida
      }

      const updatedItems = orden.items.map((i) => itemById.get(i.id)!)
      const nextEstado: OrdenCompraEstado = allItemsFullyReceived(updatedItems)
        ? 'received'
        : 'sent'

      return tx.ordenCompra.update({
        where: { id },
        data: { estado: nextEstado },
        include: ordenInclude,
      })
    })

    return { ok: true, data: row }
  }
}
