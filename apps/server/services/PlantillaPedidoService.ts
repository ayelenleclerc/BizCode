import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  PedidoPrefill,
  PedidoPrefillLine,
  PedidoPrefillOmitted,
  PlantillaPedido,
  PlantillaPedidoCreateInput,
  PlantillaPedidoPatchInput,
  RepeatOmitReason,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const PLANTILLA_INCLUDE = {
  items: { orderBy: { orden: 'asc' as const } },
} satisfies Prisma.PlantillaPedidoInclude

type CatalogRow = {
  id: number
  descripcion: string
  condIva: string
  activo: boolean
  esPadre: boolean
  precioLista1: { toString(): string } | number
  stock: { toString(): string } | number
}

type SourceLine = {
  articuloId: number | null
  descripcion: string
  cantidad: number
}

/**
 * @en Classifies whether a source line can be loaded into a new cart (#253).
 * @es Clasifica si una línea origen puede cargarse al carrito (#253).
 * @pt-BR Classifica se uma linha de origem pode ir ao carrinho (#253).
 */
export function classifyRepeatSource(item: {
  articuloId: number | null
  articulo?: { activo: boolean; esPadre: boolean } | null
}): RepeatOmitReason | null {
  if (item.articuloId == null || item.articuloId < 1) return 'service'
  if (!item.articulo) return 'missing'
  if (item.articulo.esPadre) return 'parent'
  if (!item.articulo.activo) return 'inactive'
  return null
}

function toNumber(value: { toString(): string } | number | string): number {
  if (typeof value === 'number') return value
  return Number(value.toString())
}

function money(n: number): string {
  return n.toFixed(2)
}

function mapPlantilla(row: Prisma.PlantillaPedidoGetPayload<{ include: typeof PLANTILLA_INCLUDE }>): PlantillaPedido {
  return {
    id: row.id,
    tenantId: row.tenantId,
    clienteId: row.clienteId,
    vendedorId: row.vendedorId,
    nombre: row.nombre,
    activa: row.activa,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map((it) => ({
      id: it.id,
      articuloId: it.articuloId,
      cantidad: toNumber(it.cantidad),
      activo: it.activo,
      orden: it.orden,
    })),
  }
}

/**
 * @en Last-order prefill + CRUD for customer order templates (#253).
 * @es Precarga del último pedido y CRUD de plantillas por cliente (#253).
 * @pt-BR Pré-carga do último pedido e CRUD de modelos por cliente (#253).
 */
export class PlantillaPedidoService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUltimoPedidoRepeat(tenantId: number, clienteId: number): Promise<ServiceResult<PedidoPrefill>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    const pedido = await this.prisma.pedido.findFirst({
      where: { tenantId, clienteId, estado: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            articuloId: true,
            descripcion: true,
            cantidad: true,
          },
        },
      },
    })
    if (!pedido) {
      return { ok: false, status: 404, error: 'No previous pedido' }
    }
    const source: SourceLine[] = pedido.items.map((it) => ({
      articuloId: it.articuloId,
      descripcion: it.descripcion,
      cantidad: toNumber(it.cantidad),
    }))
    const prefill = await this.resolvePrefill(tenantId, source, {
      source: 'last_pedido',
      pedidoId: pedido.id,
      plantillaId: null,
      createdAt: pedido.createdAt.toISOString(),
    })
    return { ok: true, data: prefill }
  }

  async listByCliente(tenantId: number, clienteId: number): Promise<ServiceResult<PlantillaPedido[]>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    const rows = await this.prisma.plantillaPedido.findMany({
      where: { tenantId, clienteId },
      include: PLANTILLA_INCLUDE,
      orderBy: [{ activa: 'desc' }, { updatedAt: 'desc' }],
      take: 50,
    })
    return { ok: true, data: rows.map(mapPlantilla) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<PlantillaPedido>> {
    const row = await this.prisma.plantillaPedido.findFirst({
      where: { id, tenantId },
      include: PLANTILLA_INCLUDE,
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Plantilla not found' }
    }
    return { ok: true, data: mapPlantilla(row) }
  }

  async create(
    tenantId: number,
    clienteId: number,
    input: PlantillaPedidoCreateInput,
  ): Promise<ServiceResult<PlantillaPedido>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    const items = this.normalizeItems(input.items)
    if (!items.ok) return items
    const catalogCheck = await this.assertArticulos(tenantId, items.data.map((i) => i.articuloId))
    if (!catalogCheck.ok) return catalogCheck
    const row = await this.prisma.plantillaPedido.create({
      data: {
        tenantId,
        clienteId,
        vendedorId: input.vendedorId ?? null,
        nombre: input.nombre.trim().slice(0, 80),
        activa: input.activa ?? true,
        items: { create: items.data },
      },
      include: PLANTILLA_INCLUDE,
    })
    return { ok: true, data: mapPlantilla(row) }
  }

  async patch(tenantId: number, id: number, input: PlantillaPedidoPatchInput): Promise<ServiceResult<PlantillaPedido>> {
    const existing = await this.prisma.plantillaPedido.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Plantilla not found' }
    }
    const data: Prisma.PlantillaPedidoUpdateInput = {}
    if (input.nombre !== undefined) {
      data.nombre = input.nombre.trim().slice(0, 80)
    }
    if (input.activa !== undefined) {
      data.activa = input.activa
    }
    if (input.items !== undefined) {
      const items = this.normalizeItems(input.items)
      if (!items.ok) return items
      const catalogCheck = await this.assertArticulos(tenantId, items.data.map((i) => i.articuloId))
      if (!catalogCheck.ok) return catalogCheck
      await this.prisma.plantillaPedidoItem.deleteMany({ where: { plantillaId: id } })
      data.items = { create: items.data }
    }
    const row = await this.prisma.plantillaPedido.update({
      where: { id },
      data,
      include: PLANTILLA_INCLUDE,
    })
    return { ok: true, data: mapPlantilla(row) }
  }

  async delete(tenantId: number, id: number): Promise<ServiceResult<{ id: number }>> {
    const existing = await this.prisma.plantillaPedido.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Plantilla not found' }
    }
    await this.prisma.plantillaPedido.delete({ where: { id } })
    return { ok: true, data: { id } }
  }

  async cargar(tenantId: number, id: number): Promise<ServiceResult<PedidoPrefill>> {
    const row = await this.prisma.plantillaPedido.findFirst({
      where: { id, tenantId },
      include: PLANTILLA_INCLUDE,
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Plantilla not found' }
    }
    const source: SourceLine[] = row.items
      .filter((it) => it.activo)
      .map((it) => ({
        articuloId: it.articuloId,
        descripcion: '',
        cantidad: toNumber(it.cantidad),
      }))
    const prefill = await this.resolvePrefill(tenantId, source, {
      source: 'plantilla',
      pedidoId: null,
      plantillaId: row.id,
      createdAt: row.updatedAt.toISOString(),
    })
    return { ok: true, data: prefill }
  }

  private normalizeItems(
    items: PlantillaPedidoCreateInput['items'],
  ): ServiceResult<Array<{ articuloId: number; cantidad: number; activo: boolean; orden: number }>> {
    if (items.length > 100) {
      return { ok: false, status: 400, error: 'items exceeds max of 100' }
    }
    const seen = new Set<number>()
    const data: Array<{ articuloId: number; cantidad: number; activo: boolean; orden: number }> = []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!Number.isInteger(it.articuloId) || it.articuloId < 1) {
        return { ok: false, status: 400, error: 'articuloId must be a positive integer' }
      }
      if (seen.has(it.articuloId)) {
        return { ok: false, status: 400, error: 'duplicate articuloId in items' }
      }
      seen.add(it.articuloId)
      if (!Number.isFinite(it.cantidad) || it.cantidad <= 0) {
        return { ok: false, status: 400, error: 'cantidad must be > 0' }
      }
      data.push({
        articuloId: it.articuloId,
        cantidad: it.cantidad,
        activo: it.activo ?? true,
        orden: it.orden ?? i,
      })
    }
    return { ok: true, data }
  }

  private async assertArticulos(tenantId: number, ids: number[]): Promise<ServiceResult<true>> {
    if (ids.length === 0) return { ok: true, data: true }
    const rows = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: ids } },
      select: { id: true, esPadre: true },
    })
    if (rows.length !== ids.length) {
      return { ok: false, status: 400, error: 'One or more articuloId values are not valid for this tenant' }
    }
    if (rows.some((r) => r.esPadre)) {
      return { ok: false, status: 400, error: 'Parent articles cannot be sold; select a variant instead' }
    }
    return { ok: true, data: true }
  }

  private async resolvePrefill(
    tenantId: number,
    source: SourceLine[],
    meta: {
      source: PedidoPrefill['source']
      pedidoId: number | null
      plantillaId: number | null
      createdAt: string | null
    },
  ): Promise<PedidoPrefill> {
    const ids = [
      ...new Set(source.map((s) => s.articuloId).filter((id): id is number => typeof id === 'number' && id >= 1)),
    ]
    const articulos: CatalogRow[] =
      ids.length > 0
        ? await this.prisma.articulo.findMany({
            where: { tenantId, id: { in: ids } },
            select: {
              id: true,
              descripcion: true,
              condIva: true,
              activo: true,
              esPadre: true,
              precioLista1: true,
              stock: true,
            },
          })
        : []
    const byId = new Map(articulos.map((a) => [a.id, a]))
    const lines: PedidoPrefillLine[] = []
    const omitted: PedidoPrefillOmitted[] = []
    for (const src of source) {
      const art = src.articuloId != null ? byId.get(src.articuloId) ?? null : null
      const reason = classifyRepeatSource({ articuloId: src.articuloId, articulo: art })
      if (reason) {
        omitted.push({
          articuloId: src.articuloId,
          descripcion: art?.descripcion ?? src.descripcion,
          reason,
        })
        continue
      }
      if (!art) continue
      lines.push({
        articuloId: art.id,
        descripcion: art.descripcion,
        precio: toNumber(art.precioLista1),
        stock: toNumber(art.stock),
        cantidad: src.cantidad,
        condIva: art.condIva,
      })
    }
    const total = lines.reduce((acc, l) => acc + l.precio * l.cantidad, 0)
    return {
      source: meta.source,
      pedidoId: meta.pedidoId,
      plantillaId: meta.plantillaId,
      total: money(Math.round(total * 100) / 100),
      createdAt: meta.createdAt,
      lines,
      omitted,
      omittedCount: omitted.length,
    }
  }
}
