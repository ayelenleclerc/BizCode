import type { Prisma, PrismaClient } from '@prisma/client'
import { calculateInvoice, calculateItemSubtotal } from '../../web/src/lib/invoice'
import type { PedidoEstado, PedidoInput, PedidoInvoiceInput } from '@bizcode/types'
import { FacturaService } from './FacturaService'
import type { ServiceResult } from './serviceResults'

const pedidoInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true, condIva: true } },
  vendedor: { select: { id: true, username: true, role: true } },
  items: {
    include: {
      articulo: {
        select: {
          id: true,
          codigo: true,
          descripcion: true,
          condIva: true,
          tipo: true,
          unidadServicio: true,
          umedida: true,
        },
      },
    },
  },
  factura: { select: { id: true, tipo: true, prefijo: true, numero: true, total: true } },
} satisfies Prisma.PedidoInclude

export type PedidoRow = Prisma.PedidoGetPayload<{ include: typeof pedidoInclude }>

export type PedidoListResult = {
  total: number
  pedidos: PedidoRow[]
}

function parseValidUntil(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim() === '') {
    return null
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    return null
  }
  return d
}

function computePedidoTotal(items: PedidoInput['items']): number {
  const sum = items.reduce((acc, it) => acc + it.subtotal, 0)
  return Math.round(sum * 100) / 100
}

type ResolvedPedidoLine = {
  articuloId: number | null
  descripcion: string
  condIva: string
  unidadServicio: string | null
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
}

async function resolvePedidoLines(
  prisma: PrismaClient,
  tenantId: number,
  items: PedidoInput['items'],
): Promise<ServiceResult<ResolvedPedidoLine[]>> {
  const catalogIds = [
    ...new Set(
      items
        .map((it) => it.articuloId)
        .filter((id): id is number => typeof id === 'number' && id >= 1),
    ),
  ]
  const articulos =
    catalogIds.length > 0
      ? await prisma.articulo.findMany({
          where: { tenantId, id: { in: catalogIds } },
          select: {
            id: true,
            descripcion: true,
            condIva: true,
            tipo: true,
            unidadServicio: true,
            esPadre: true,
          },
        })
      : []
  if (articulos.length !== catalogIds.length) {
    return {
      ok: false,
      status: 400,
      error: 'One or more articuloId values are not valid for this tenant',
    }
  }
  if (articulos.some((a) => a.esPadre)) {
    return {
      ok: false,
      status: 400,
      error: 'Parent articles cannot be sold; select a variant instead',
    }
  }
  const byId = new Map(articulos.map((a) => [a.id, a]))
  const resolved = items.map((it): ResolvedPedidoLine => {
    if (it.articuloId != null && it.articuloId >= 1) {
      const art = byId.get(it.articuloId)!
      return {
        articuloId: it.articuloId,
        descripcion: art.descripcion.slice(0, 120),
        condIva: art.condIva,
        unidadServicio: art.tipo === 'servicio' ? art.unidadServicio : null,
        cantidad: it.cantidad,
        precio: it.precio,
        dscto: it.dscto,
        subtotal: it.subtotal,
      }
    }
    return {
      articuloId: null,
      descripcion: (it.descripcion ?? '').trim().slice(0, 120),
      condIva: it.condIva ?? '1',
      unidadServicio: it.unidadServicio ?? null,
      cantidad: it.cantidad,
      precio: it.precio,
      dscto: it.dscto,
      subtotal: it.subtotal,
    }
  })
  return { ok: true, data: resolved }
}

/**
 * @en Commercial order / quote lifecycle (draft → confirmed → invoiced / cancelled).
 * @es Ciclo de pedidos/presupuestos comerciales (borrador → confirmado → facturado / cancelado).
 * @pt-BR Ciclo de pedidos/orçamentos comerciais (rascunho → confirmado → faturado / cancelado).
 */
export class PedidoService {
  private readonly facturaService: FacturaService

  constructor(private readonly prisma: PrismaClient) {
    this.facturaService = new FacturaService(prisma)
  }

  async list(
    tenantId: number,
    filters: { estado?: PedidoEstado; clienteId?: number },
    take: number,
    skip: number,
  ): Promise<PedidoListResult> {
    const where: Prisma.PedidoWhereInput = { tenantId }
    if (filters.estado !== undefined) {
      where.estado = filters.estado
    }
    if (filters.clienteId !== undefined) {
      where.clienteId = filters.clienteId
    }
    const [total, pedidos] = await Promise.all([
      this.prisma.pedido.count({ where }),
      this.prisma.pedido.findMany({
        where,
        include: pedidoInclude,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, pedidos }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<PedidoRow>> {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, tenantId },
      include: pedidoInclude,
    })
    if (!pedido) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }
    return { ok: true, data: pedido }
  }

  private async validateItemsAndCliente(
    tenantId: number,
    clienteId: number,
    items: PedidoInput['items'],
    vendedorId?: number | null,
  ): Promise<ServiceResult<{ clienteCondIva: string }>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, condIva: true, suspended: true },
    })
    if (!cliente) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }
    if (cliente.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    if (vendedorId !== undefined && vendedorId !== null) {
      const vendedor = await this.prisma.appUser.findFirst({
        where: { id: vendedorId, tenantId, active: true },
        select: { id: true },
      })
      if (!vendedor) {
        return { ok: false, status: 400, error: 'vendedorId is not valid for this tenant' }
      }
    }

    const articuloIds = [
      ...new Set(
        items
          .map((it) => it.articuloId)
          .filter((id): id is number => typeof id === 'number' && id >= 1),
      ),
    ]
    if (articuloIds.length > 0) {
      const articulos = await this.prisma.articulo.findMany({
        where: { tenantId, id: { in: articuloIds } },
        select: { id: true, esPadre: true },
      })
      if (articulos.length !== articuloIds.length) {
        return {
          ok: false,
          status: 400,
          error: 'One or more articuloId values are not valid for this tenant',
        }
      }
      if (articulos.some((a) => a.esPadre)) {
        return {
          ok: false,
          status: 400,
          error: 'Parent articles cannot be sold; select a variant instead',
        }
      }
    }

    return { ok: true, data: { clienteCondIva: cliente.condIva } }
  }

  async create(tenantId: number, input: PedidoInput): Promise<ServiceResult<PedidoRow>> {
    const check = await this.validateItemsAndCliente(tenantId, input.clienteId, input.items, input.vendedorId)
    if (!check.ok) {
      return check
    }

    const resolved = await resolvePedidoLines(this.prisma, tenantId, input.items)
    if (!resolved.ok) {
      return resolved
    }

    const total = computePedidoTotal(input.items)
    const pedido = await this.prisma.pedido.create({
      data: {
        tenantId,
        clienteId: input.clienteId,
        vendedorId: input.vendedorId ?? null,
        estado: 'draft',
        total,
        validUntil: parseValidUntil(input.validUntil),
        ...(input.depositoId != null ? { depositoId: input.depositoId } : {}),
        items: {
          create: resolved.data,
        },
      },
      include: pedidoInclude,
    })
    return { ok: true, data: pedido }
  }

  async update(tenantId: number, id: number, input: PedidoInput): Promise<ServiceResult<PedidoRow>> {
    const existing = await this.prisma.pedido.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }
    if (existing.estado !== 'draft') {
      return { ok: false, status: 409, error: 'ONLY_DRAFT_EDITABLE' }
    }

    const check = await this.validateItemsAndCliente(tenantId, input.clienteId, input.items, input.vendedorId)
    if (!check.ok) {
      return check
    }

    const resolved = await resolvePedidoLines(this.prisma, tenantId, input.items)
    if (!resolved.ok) {
      return resolved
    }

    const total = computePedidoTotal(input.items)
    const pedido = await this.prisma.$transaction(async (tx) => {
      await tx.pedidoItem.deleteMany({ where: { pedidoId: id } })
      return tx.pedido.update({
        where: { id },
        data: {
          clienteId: input.clienteId,
          vendedorId: input.vendedorId ?? null,
          total,
          validUntil: parseValidUntil(input.validUntil),
          ...(input.depositoId !== undefined ? { depositoId: input.depositoId } : {}),
          items: {
            create: resolved.data,
          },
        },
        include: pedidoInclude,
      })
    })
    return { ok: true, data: pedido }
  }

  async confirm(tenantId: number, id: number): Promise<ServiceResult<PedidoRow>> {
    const existing = await this.prisma.pedido.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }
    if (existing.estado !== 'draft') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    const pedido = await this.prisma.pedido.update({
      where: { id },
      data: { estado: 'confirmed' },
      include: pedidoInclude,
    })
    return { ok: true, data: pedido }
  }

  async invoice(
    tenantId: number,
    id: number,
    invoiceInput: PedidoInvoiceInput,
    userId: number,
  ): Promise<ServiceResult<PedidoRow>> {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        cliente: { select: { id: true, condIva: true, suspended: true } },
      },
    })
    if (!pedido) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }
    if (pedido.estado !== 'confirmed') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    if (pedido.cliente.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    const facturaItems = pedido.items.map((it) => ({
      articuloId: it.articuloId,
      descripcion: it.descripcion,
      condIva: it.condIva as '1' | '2' | '3',
      unidadServicio: it.unidadServicio as PedidoInput['items'][number]['unidadServicio'],
      cantidad: Number(it.cantidad),
      precio: Number(it.precio),
      dscto: Number(it.dscto),
      subtotal: Number(it.subtotal),
    }))

    const totals = calculateInvoice(
      pedido.items.map((it) => ({
        cantidad: Number(it.cantidad),
        precio: Number(it.precio),
        dscto: Number(it.dscto),
        articuloIva: it.condIva as '1' | '2' | '3',
      })),
      pedido.cliente.condIva,
    )

    const facturaResult = await this.facturaService.create(
      tenantId,
      {
        fecha: invoiceInput.fecha,
        tipo: invoiceInput.tipo,
        prefijo: invoiceInput.prefijo,
        numero: invoiceInput.numero,
        clienteId: pedido.clienteId,
        formaPagoId: invoiceInput.formaPagoId,
        ...totals,
        items: facturaItems,
      },
      userId,
    )
    if (!facturaResult.ok) {
      return facturaResult
    }

    const updated = await this.prisma.pedido.update({
      where: { id },
      data: {
        estado: 'invoiced',
        facturaId: facturaResult.data.factura.id,
        total: totals.total,
      },
      include: pedidoInclude,
    })
    return { ok: true, data: updated }
  }

  async cancel(tenantId: number, id: number): Promise<ServiceResult<PedidoRow>> {
    const existing = await this.prisma.pedido.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }
    if (existing.estado === 'invoiced') {
      return { ok: false, status: 409, error: 'INVOICED_PEDIDO_CANNOT_CANCEL' }
    }
    if (existing.estado === 'cancelled') {
      return { ok: false, status: 409, error: 'ALREADY_CANCELLED' }
    }
    const pedido = await this.prisma.pedido.update({
      where: { id },
      data: { estado: 'cancelled' },
      include: pedidoInclude,
    })
    return { ok: true, data: pedido }
  }
}

/** @en Builds line subtotals for API input normalization. */
export function mapPedidoItemsWithSubtotals(
  items: Array<{
    articuloId?: number | null
    descripcion?: string
    condIva?: '1' | '2' | '3'
    unidadServicio?: PedidoInput['items'][number]['unidadServicio']
    cantidad: number
    precio: number
    dscto: number
  }>,
): PedidoInput['items'] {
  return items.map((it) => ({
    articuloId: it.articuloId ?? null,
    descripcion: it.descripcion,
    condIva: it.condIva,
    unidadServicio: it.unidadServicio,
    cantidad: it.cantidad,
    precio: it.precio,
    dscto: it.dscto,
    subtotal: calculateItemSubtotal(it.cantidad, it.precio, it.dscto),
  }))
}
