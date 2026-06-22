import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  RemitoEntregarInput,
  RemitoEstado,
  RemitoInput,
  RemitoItemInput,
  RemitoTipo,
  RemitoUpdateInput,
} from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

const remitoInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true, cuit: true, domicilio: true } },
  proveedor: { select: { id: true, codigo: true, rsocial: true, cuit: true } },
  factura: { select: { id: true, tipo: true, prefijo: true, numero: true } },
  pedido: { select: { id: true, estado: true } },
  ordenEntrega: { select: { id: true, estado: true } },
  items: {
    include: {
      articulo: { select: { id: true, codigo: true, descripcion: true, umedida: true } },
    },
  },
} satisfies Prisma.RemitoInclude

export type RemitoRow = Prisma.RemitoGetPayload<{ include: typeof remitoInclude }>

export type RemitoListResult = {
  total: number
  remitos: RemitoRow[]
}

function formatPrefijo(puntoVenta: number): string {
  return String(puntoVenta).padStart(4, '0').slice(-4)
}

function formatRemitoRef(prefijo: string | null, numero: number | null): string {
  if (prefijo == null || numero == null) return 'BORRADOR'
  return `REM-${prefijo}-${String(numero).padStart(8, '0')}`
}

export function mapRemitoPublic(row: RemitoRow) {
  return {
    ...row,
    referencia: formatRemitoRef(row.prefijo, row.numero),
  }
}

/**
 * @en Delivery note (remito) domain service (#230).
 * @es Servicio de remitos de entrega (#230).
 * @pt-BR Serviço de remessas de entrega (#230).
 */
export class RemitoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    filters?: { estado?: RemitoEstado; clienteId?: number },
  ): Promise<RemitoListResult> {
    const where: Prisma.RemitoWhereInput = {
      tenantId,
      ...(filters?.estado ? { estado: filters.estado } : {}),
      ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
    }
    const [total, remitos] = await Promise.all([
      this.prisma.remito.count({ where }),
      this.prisma.remito.findMany({
        where,
        include: remitoInclude,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, remitos }
  }

  async getById(tenantId: number, id: number): Promise<RemitoRow | null> {
    return this.prisma.remito.findFirst({
      where: { id, tenantId },
      include: remitoInclude,
    })
  }

  private async resolvePrefijo(tenantId: number): Promise<string> {
    const empresa = await this.prisma.paramEmpresa.findFirst({
      where: { tenantId },
      select: { puntoVenta: true },
    })
    return formatPrefijo(empresa?.puntoVenta ?? 1)
  }

  private async allocateNumero(
    tx: Prisma.TransactionClient,
    tenantId: number,
    prefijo: string,
  ): Promise<number> {
    const last = await tx.remito.findFirst({
      where: { tenantId, prefijo, numero: { not: null } },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    return (last?.numero ?? 0) + 1
  }

  private validateParty(tipo: RemitoTipo, clienteId?: number | null, proveedorId?: number | null): string | null {
    if (tipo === 'remito_x' && !clienteId) {
      return 'clienteId is required for remito_x'
    }
    if (tipo === 'remito_ingreso' && !clienteId) {
      return 'clienteId is required for remito_ingreso'
    }
    if (proveedorId && clienteId) {
      return 'Cannot set both clienteId and proveedorId'
    }
    return null
  }

  private async validateItems(tenantId: number, items: RemitoItemInput[]): Promise<string | null> {
    if (!items.length) return 'items must contain at least one line'
    const articuloIds = [...new Set(items.map((it) => it.articuloId))]
    const count = await this.prisma.articulo.count({
      where: { tenantId, id: { in: articuloIds } },
    })
    if (count !== articuloIds.length) {
      return 'One or more articuloId values are not valid for this tenant'
    }
    return null
  }

  private buildItemCreates(items: RemitoItemInput[]): Prisma.RemitoItemCreateWithoutRemitoInput[] {
    return items.map((it) => ({
      articulo: { connect: { id: it.articuloId } },
      descripcion: it.descripcion.trim(),
      cantidad: it.cantidad,
      unidad: it.unidad.trim(),
    }))
  }

  async create(tenantId: number, input: RemitoInput): Promise<ServiceResult<RemitoRow>> {
    const partyErr = this.validateParty(input.tipo, input.clienteId, input.proveedorId)
    if (partyErr) return { ok: false, status: 400, error: partyErr }
    const itemsErr = await this.validateItems(tenantId, input.items)
    if (itemsErr) return { ok: false, status: 400, error: itemsErr }

    if (input.pedidoId) {
      const pedido = await this.prisma.pedido.findFirst({
        where: { id: input.pedidoId, tenantId },
        select: { id: true, remito: { select: { id: true } } },
      })
      if (!pedido) return { ok: false, status: 400, error: 'pedidoId is not valid for this tenant' }
      if (pedido.remito) return { ok: false, status: 409, error: 'PEDIDO_ALREADY_HAS_REMITO' }
    }

    const fecha = input.fecha ? facturaFechaToPrismaDate(input.fecha) : new Date()

    const remito = await this.prisma.remito.create({
      data: {
        tenantId,
        tipo: input.tipo,
        estado: 'borrador',
        clienteId: input.clienteId ?? null,
        proveedorId: input.proveedorId ?? null,
        facturaId: input.facturaId ?? null,
        pedidoId: input.pedidoId ?? null,
        ordenEntregaId: input.ordenEntregaId ?? null,
        fecha,
        observaciones: input.observaciones?.trim() ?? null,
        items: { create: this.buildItemCreates(input.items) },
      },
      include: remitoInclude,
    })
    return { ok: true, data: remito }
  }

  async update(tenantId: number, id: number, input: RemitoUpdateInput): Promise<ServiceResult<RemitoRow>> {
    const existing = await this.prisma.remito.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true, tipo: true, clienteId: true, proveedorId: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Remito not found' }
    if (existing.estado !== 'borrador') {
      return { ok: false, status: 409, error: 'ONLY_BORRADOR_CAN_BE_UPDATED' }
    }

    const clienteId = input.clienteId !== undefined ? input.clienteId : existing.clienteId
    const proveedorId = input.proveedorId !== undefined ? input.proveedorId : existing.proveedorId
    const partyErr = this.validateParty(existing.tipo as RemitoTipo, clienteId, proveedorId)
    if (partyErr) return { ok: false, status: 400, error: partyErr }

    if (input.items) {
      const itemsErr = await this.validateItems(tenantId, input.items)
      if (itemsErr) return { ok: false, status: 400, error: itemsErr }
    }

    const remito = await this.prisma.$transaction(async (tx) => {
      if (input.items) {
        await tx.remitoItem.deleteMany({ where: { remitoId: id } })
      }
      return tx.remito.update({
        where: { id },
        data: {
          ...(input.clienteId !== undefined ? { clienteId: input.clienteId } : {}),
          ...(input.proveedorId !== undefined ? { proveedorId: input.proveedorId } : {}),
          ...(input.observaciones !== undefined ? { observaciones: input.observaciones?.trim() ?? null } : {}),
          ...(input.items
            ? { items: { create: this.buildItemCreates(input.items) } }
            : {}),
        },
        include: remitoInclude,
      })
    })
    return { ok: true, data: remito }
  }

  async emitir(tenantId: number, id: number): Promise<ServiceResult<RemitoRow>> {
    const existing = await this.prisma.remito.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Remito not found' }
    if (existing.estado !== 'borrador') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    if (!existing.items.length) {
      return { ok: false, status: 400, error: 'items must contain at least one line' }
    }

    const remito = await this.prisma.$transaction(async (tx) => {
      const prefijo = await this.resolvePrefijo(tenantId)
      const numero = await this.allocateNumero(tx, tenantId, prefijo)
      return tx.remito.update({
        where: { id },
        data: { estado: 'emitido', prefijo, numero },
        include: remitoInclude,
      })
    })
    return { ok: true, data: remito }
  }

  async entregar(
    tenantId: number,
    id: number,
    input: RemitoEntregarInput,
  ): Promise<ServiceResult<RemitoRow>> {
    const existing = await this.prisma.remito.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true, ordenEntregaId: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Remito not found' }
    if (existing.estado !== 'emitido') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    const firmadoPor = input.firmadoPor.trim()
    if (firmadoPor.length < 2) {
      return { ok: false, status: 400, error: 'firmadoPor must be at least 2 characters' }
    }
    const fechaEntrega = input.fechaEntrega ? facturaFechaToPrismaDate(input.fechaEntrega) : new Date()

    const remito = await this.prisma.remito.update({
      where: { id },
      data: { estado: 'entregado', firmadoPor, fechaEntrega },
      include: remitoInclude,
    })
    return { ok: true, data: remito }
  }

  async anular(tenantId: number, id: number): Promise<ServiceResult<RemitoRow>> {
    const existing = await this.prisma.remito.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Remito not found' }
    if (existing.estado !== 'emitido') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }

    const remito = await this.prisma.remito.update({
      where: { id },
      data: { estado: 'anulado' },
      include: remitoInclude,
    })
    return { ok: true, data: remito }
  }

  async createFromPedido(tenantId: number, pedidoId: number): Promise<ServiceResult<RemitoRow>> {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoId, tenantId },
      include: {
        items: { include: { articulo: { select: { id: true, descripcion: true, umedida: true } } } },
        remito: { select: { id: true } },
      },
    })
    if (!pedido) return { ok: false, status: 404, error: 'Pedido not found' }
    if (pedido.estado !== 'confirmed') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    if (pedido.remito) return { ok: false, status: 409, error: 'PEDIDO_ALREADY_HAS_REMITO' }

    const items: RemitoItemInput[] = pedido.items.map((it) => ({
      articuloId: it.articuloId,
      descripcion: it.articulo.descripcion,
      cantidad: it.cantidad,
      unidad: it.articulo.umedida,
    }))

    return this.create(tenantId, {
      tipo: 'remito_x',
      clienteId: pedido.clienteId,
      pedidoId: pedido.id,
      items,
    })
  }

  async createFromFactura(tenantId: number, facturaId: number): Promise<ServiceResult<RemitoRow>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId, estado: 'A' },
      include: {
        items: { include: { articulo: { select: { id: true, descripcion: true, umedida: true } } } },
        remitos: { where: { estado: { not: 'anulado' } }, select: { id: true } },
      },
    })
    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }
    if (factura.remitos.length > 0) {
      return { ok: false, status: 409, error: 'FACTURA_ALREADY_HAS_REMITO' }
    }

    const items: RemitoItemInput[] = factura.items.map((it) => ({
      articuloId: it.articuloId,
      descripcion: it.articulo.descripcion,
      cantidad: it.cantidad,
      unidad: it.articulo.umedida,
    }))

    return this.create(tenantId, {
      tipo: 'remito_x',
      clienteId: factura.clienteId,
      facturaId: factura.id,
      items,
    })
  }
}
