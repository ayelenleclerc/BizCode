import { Decimal } from '@prisma/client/runtime/library'
import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  OrdenCompraCreateInput,
  OrdenCompraEstado,
  OrdenCompraItemInput,
  OrdenCompraReceiveLineInput,
  OrdenCompraUpdateInput,
} from '@bizcode/types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'
import { LoteService } from './LoteService'
import { ProveedorCatalogoService } from './ProveedorCatalogoService'
import { roundQty, toBaseQuantity } from '../lib/uom'

export const ORDEN_COMPRA_ESTADOS: OrdenCompraEstado[] = ['draft', 'sent', 'received', 'cancelled']

const PURCHASE_STOCK_MOTIVO = 'compra'

const ordenInclude = {
  proveedor: { select: { id: true, codigo: true, rsocial: true } },
  items: {
    include: {
      articulo: { select: { id: true, codigo: true, descripcion: true, controlLote: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.OrdenCompraInclude

export type OrdenCompraRow = Prisma.OrdenCompraGetPayload<{ include: typeof ordenInclude }>

export type OrdenCompraItemCatalogSnapshot = {
  codigoProveedor: string | null
  descripcionProveedor: string | null
}

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
  private readonly catalogo: ProveedorCatalogoService
  private readonly loteService: LoteService

  constructor(
    private readonly prisma: PrismaClient,
    catalogo?: ProveedorCatalogoService,
  ) {
    this.catalogo = catalogo ?? new ProveedorCatalogoService(prisma)
    this.loteService = new LoteService(prisma)
  }

  async resolveItemCatalogSnapshot(
    tenantId: number,
    proveedorId: number,
    articuloId: number,
  ): Promise<OrdenCompraItemCatalogSnapshot> {
    const entry = await this.catalogo.findByArticuloId(tenantId, proveedorId, articuloId)
    if (!entry?.activo) {
      return { codigoProveedor: null, descripcionProveedor: null }
    }
    return {
      codigoProveedor: entry.codigoProveedor,
      descripcionProveedor: entry.descripcion,
    }
  }

  private async mapItemsWithCatalog(
    tenantId: number,
    proveedorId: number,
    items: OrdenCompraItemInput[],
  ): Promise<
    Array<
      OrdenCompraItemInput & {
        codigoProveedor: string | null
        descripcionProveedor: string | null
      }
    >
  > {
    return Promise.all(
      items.map(async (line) => {
        const snapshot = await this.resolveItemCatalogSnapshot(
          tenantId,
          proveedorId,
          line.articuloId,
        )
        return { ...line, ...snapshot }
      }),
    )
  }

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

    const itemsWithCatalog = await this.mapItemsWithCatalog(
      tenantId,
      input.proveedorId,
      input.items,
    )
    const total = computeTotal(input.items)
    const row = await this.prisma.ordenCompra.create({
      data: {
        tenantId,
        proveedorId: input.proveedorId,
        estado: 'draft',
        total,
        fechaEstimada: parseFechaEstimada(input.fechaEstimada),
        nota: input.nota,
        ...(input.depositoId != null ? { depositoId: input.depositoId } : {}),
        items: {
          create: itemsWithCatalog.map((line) => ({
            articuloId: line.articuloId,
            codigoProveedor: line.codigoProveedor,
            descripcionProveedor: line.descripcionProveedor,
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
      select: { id: true, estado: true, proveedorId: true },
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

    const effectiveProveedorId = input.proveedorId ?? existing.proveedorId ?? 0
    const itemsWithCatalog =
      input.items && effectiveProveedorId > 0
        ? await this.mapItemsWithCatalog(tenantId, effectiveProveedorId, input.items)
        : null

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
          items: itemsWithCatalog
            ? {
                create: itemsWithCatalog.map((line) => ({
                  articuloId: line.articuloId,
                  codigoProveedor: line.codigoProveedor,
                  descripcionProveedor: line.descripcionProveedor,
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
      include: {
        items: {
          include: {
            articulo: { select: { controlLote: true } },
          },
        },
      },
    })
    if (!orden) {
      return { ok: false, status: 404, error: 'OrdenCompra not found' }
    }
    if (orden.estado !== 'sent') {
      return { ok: false, status: 422, error: 'ORDER_NOT_RECEIVABLE' }
    }

    const depositoId =
      orden.depositoId ?? (await getDefaultDepositoId(this.prisma, tenantId))

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, depositoId)
    if (!recuentoBlock.ok) {
      return recuentoBlock
    }

    const itemById = new Map(orden.items.map((i) => [i.id, i]))
    // @en Decimal-safe running total of cantidadRecibida per line, tracked outside the Prisma Decimal fields (#203).
    // @es Total acumulado Decimal-safe de cantidadRecibida por línea, fuera de los campos Decimal de Prisma (#203).
    // @pt-BR Total acumulado Decimal-safe de cantidadRecibida por linha, fora dos campos Decimal do Prisma (#203).
    const receivedSoFar = new Map(orden.items.map((i) => [i.id, Number(i.cantidadRecibida)]))
    for (const line of lines) {
      const item = itemById.get(line.itemId)
      if (!item) {
        return { ok: false, status: 422, error: 'INVALID_LINE_ITEM' }
      }
      const pending = roundQty(Number(item.cantidad) - (receivedSoFar.get(line.itemId) ?? 0))
      if (line.cantidad > pending) {
        return { ok: false, status: 422, error: 'RECEIVE_QUANTITY_EXCEEDS_PENDING' }
      }
    }

    const hasControlledArticles = lines.some(
      (line) => itemById.get(line.itemId)?.articulo?.controlLote === true,
    )
    const fefoEnabled =
      hasControlledArticles && (await this.loteService.isFefoEnabled(tenantId))

    if (fefoEnabled) {
      for (const line of lines) {
        const item = itemById.get(line.itemId)!
        if (item.articulo?.controlLote === true) {
          if (!line.nroLote?.trim() || !line.fechaVencimiento?.trim()) {
            return { ok: false, status: 422, error: 'LOTE_REQUIRED' }
          }
          if (depositoId == null) {
            return { ok: false, status: 422, error: 'DEPOSITO_REQUIRED_FOR_LOTE' }
          }
        }
      }
    }

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        for (const line of lines) {
          const item = itemById.get(line.itemId)!
          const prevRecibida = receivedSoFar.get(line.itemId) ?? 0
          const newRecibida = roundQty(prevRecibida + line.cantidad)

          await tx.ordenCompraItem.update({
            where: { id: item.id },
            data: { cantidadRecibida: newRecibida },
          })

          const articulo = await tx.articulo.findFirst({
            where: { id: item.articuloId, tenantId },
            select: {
              id: true,
              stock: true,
              controlLote: true,
              tipo: true,
              unidadBase: true,
              factorConversion: true,
            },
          })
          if (!articulo) {
            throw new Error('Articulo not found')
          }

          // @en Purchase quantity is expressed in unidadCompra; convert to unidadBase before touching stock (#203).
          // @es La cantidad de compra está en unidadCompra; se convierte a unidadBase antes de tocar el stock (#203).
          // @pt-BR A quantidade de compra está em unidadCompra; converte para unidadBase antes de alterar o estoque (#203).
          const factorConversion = Number(articulo.factorConversion ?? 1)
          const qtyBase = roundQty(toBaseQuantity(line.cantidad, factorConversion))

          if (depositoId != null) {
            await applyStockDepositoDelta(tx, {
              tenantId,
              articuloId: articulo.id,
              depositoId,
              delta: qtyBase,
            })
          } else {
            const stockAfter = roundQty(Number(articulo.stock) + qtyBase)
            await tx.articulo.update({
              where: { id: articulo.id },
              data: { stock: stockAfter },
            })
          }

          let loteId: number | null = null
          if (
            fefoEnabled &&
            articulo.controlLote &&
            articulo.tipo !== 'servicio' &&
            depositoId != null &&
            line.nroLote &&
            line.fechaVencimiento
          ) {
            const inbound = await this.loteService.applyInbound(tx, tenantId, {
              articuloId: articulo.id,
              depositoId,
              nroLote: line.nroLote,
              fechaVencimiento: line.fechaVencimiento,
              cantidad: qtyBase,
              proveedorId: orden.proveedorId,
            })
            if (!inbound.ok) {
              throw new Error(inbound.error)
            }
            loteId = inbound.data.loteId
          }

          await tx.stockAjuste.create({
            data: {
              tenantId,
              articuloId: articulo.id,
              cantidad: qtyBase,
              motivo: PURCHASE_STOCK_MOTIVO,
              userId,
              ...(depositoId != null ? { depositoId } : {}),
              ...(loteId != null ? { loteId } : {}),
            },
          })

          receivedSoFar.set(line.itemId, newRecibida)
        }

        const updatedItems = orden.items.map((i) => ({
          cantidad: Number(i.cantidad),
          cantidadRecibida: receivedSoFar.get(i.id) ?? Number(i.cantidadRecibida),
        }))
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
    } catch (err) {
      if (err instanceof Error) {
        const known = [
          'LOTE_REQUIRED',
          'DEPOSITO_REQUIRED_FOR_LOTE',
          'fechaVencimiento must be a valid date',
          'nroLote is required',
          'cantidad must be a positive finite number',
        ]
        if (known.includes(err.message) || err.message.startsWith('fechaVencimiento')) {
          return { ok: false, status: 422, error: err.message }
        }
      }
      throw err
    }
  }
}
