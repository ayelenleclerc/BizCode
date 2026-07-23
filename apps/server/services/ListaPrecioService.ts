import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ListaPrecioBulkUpdatePreviewRow,
  ListaPrecioBulkUpdateResult,
  ListaPrecioCreateInput,
  ListaPrecioItemRow,
  ListaPrecioPatchInput,
  ListaPrecioRow,
  PrecioEfectivoOrigen,
  PrecioEfectivoResponse,
  PrecioEscalonadoRow,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

/**
 * @en Validated input for upserting a price-list item with optional tiers.
 * @es Entrada validada para upsert de un ítem de lista con tramos opcionales.
 * @pt-BR Entrada validada para upsert de um item de lista com faixas opcionais.
 */
export type ListaPrecioItemUpsertInput = {
  articuloId: number
  tipoPrecio: 'fijo' | 'porcentaje_sobre_base'
  precio: number | null
  porcentaje: number | null
  escalonados: Array<{ cantidadDesde: number; cantidadHasta: number | null; precio: number }>
}

const listaInclude = {
  items: {
    include: {
      escalonados: { orderBy: { cantidadDesde: 'asc' as const } },
      articulo: { select: { id: true, codigo: true, descripcion: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.ListaPrecioInclude

type ListaPrecioDb = Prisma.ListaPrecioGetPayload<{ include: typeof listaInclude }>
type ListaPrecioItemDb = ListaPrecioDb['items'][number]

function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : Number(value.toString())
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function mapEscalonado(row: ListaPrecioItemDb['escalonados'][number]): PrecioEscalonadoRow {
  return {
    id: row.id,
    listaPrecioItemId: row.listaPrecioItemId,
    cantidadDesde: Number(row.cantidadDesde.toString()),
    cantidadHasta: toNumber(row.cantidadHasta),
    precio: Number(row.precio.toString()),
  }
}

function mapItem(row: ListaPrecioItemDb): ListaPrecioItemRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    listaPrecioId: row.listaPrecioId,
    articuloId: row.articuloId,
    tipoPrecio: row.tipoPrecio as ListaPrecioItemRow['tipoPrecio'],
    precio: toNumber(row.precio),
    porcentaje: toNumber(row.porcentaje),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    escalonados: row.escalonados.map(mapEscalonado),
    articulo: row.articulo
      ? { id: row.articulo.id, codigo: row.articulo.codigo, descripcion: row.articulo.descripcion }
      : null,
  }
}

function mapLista(row: ListaPrecioDb): ListaPrecioRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    nombre: row.nombre,
    moneda: row.moneda,
    activa: row.activa,
    esDefault: row.esDefault,
    vigenciaHasta: row.vigenciaHasta?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map(mapItem),
  }
}

/**
 * @en Price-list domain: CRUD, tiered items, bulk updates and effective-price resolution (#234).
 * @es Dominio de listas de precios: CRUD, ítems escalonados, actualización masiva y precio efectivo (#234).
 * @pt-BR Domínio de listas de preços: CRUD, itens escalonados, atualização em massa e preço efetivo (#234).
 */
export class ListaPrecioService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { activa?: boolean | null },
  ): Promise<{ total: number; rows: ListaPrecioRow[] }> {
    const where: Prisma.ListaPrecioWhereInput = {
      tenantId,
      ...(opts?.activa != null ? { activa: opts.activa } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.listaPrecio.count({ where }),
      this.prisma.listaPrecio.findMany({
        where,
        include: {
          items: { select: { id: true } },
          clientes: { select: { id: true } },
        },
        orderBy: [{ esDefault: 'desc' }, { nombre: 'asc' }],
        take,
        skip,
      }),
    ])
    const mapped: ListaPrecioRow[] = rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      nombre: row.nombre,
      moneda: row.moneda,
      activa: row.activa,
      esDefault: row.esDefault,
      vigenciaHasta: row.vigenciaHasta?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      _count: { items: row.items.length, clientes: row.clientes.length },
    }))
    return { total, rows: mapped }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<ListaPrecioRow>> {
    const row = await this.prisma.listaPrecio.findFirst({
      where: { id, tenantId },
      include: listaInclude,
    })
    if (!row) {
      return { ok: false, status: 404, error: 'ListaPrecio not found' }
    }
    return { ok: true, data: mapLista(row) }
  }

  async create(
    tenantId: number,
    input: ListaPrecioCreateInput & { moneda: string; activa: boolean; esDefault: boolean; vigenciaHasta: string | null },
  ): Promise<ServiceResult<ListaPrecioRow>> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        if (input.esDefault) {
          await tx.listaPrecio.updateMany({
            where: { tenantId, esDefault: true },
            data: { esDefault: false },
          })
        }
        return tx.listaPrecio.create({
          data: {
            tenantId,
            nombre: input.nombre,
            moneda: input.moneda,
            activa: input.activa,
            esDefault: input.esDefault,
            vigenciaHasta: input.vigenciaHasta ? new Date(input.vigenciaHasta) : null,
          },
          include: listaInclude,
        })
      })
      return { ok: true, data: mapLista(created) }
    } catch {
      return { ok: false, status: 409, error: 'ListaPrecio nombre already exists for this tenant' }
    }
  }

  async update(
    tenantId: number,
    id: number,
    patch: ListaPrecioPatchInput,
  ): Promise<ServiceResult<ListaPrecioRow>> {
    const existing = await this.prisma.listaPrecio.findFirst({ where: { id, tenantId } })
    if (!existing) {
      return { ok: false, status: 404, error: 'ListaPrecio not found' }
    }
    const data: Prisma.ListaPrecioUpdateInput = {}
    if (patch.nombre !== undefined) data.nombre = patch.nombre
    if (patch.moneda !== undefined) data.moneda = patch.moneda
    if (patch.activa !== undefined) data.activa = patch.activa
    if (patch.esDefault !== undefined) data.esDefault = patch.esDefault
    if (patch.vigenciaHasta !== undefined) {
      data.vigenciaHasta = patch.vigenciaHasta ? new Date(patch.vigenciaHasta) : null
    }
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        if (patch.esDefault === true) {
          await tx.listaPrecio.updateMany({
            where: { tenantId, esDefault: true, id: { not: id } },
            data: { esDefault: false },
          })
        }
        return tx.listaPrecio.update({ where: { id }, data, include: listaInclude })
      })
      return { ok: true, data: mapLista(updated) }
    } catch {
      return { ok: false, status: 409, error: 'ListaPrecio nombre already exists for this tenant' }
    }
  }

  async remove(tenantId: number, id: number): Promise<ServiceResult<null>> {
    const existing = await this.prisma.listaPrecio.findFirst({
      where: { id, tenantId },
      include: { clientes: { select: { id: true } } },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'ListaPrecio not found' }
    }
    if (existing.clientes.length > 0) {
      return {
        ok: false,
        status: 409,
        error: 'ListaPrecio has customers assigned; reassign them before deleting',
      }
    }
    await this.prisma.listaPrecio.delete({ where: { id } })
    return { ok: true, data: null }
  }

  async upsertItem(
    tenantId: number,
    listaPrecioId: number,
    input: ListaPrecioItemUpsertInput,
  ): Promise<ServiceResult<ListaPrecioItemRow>> {
    const lista = await this.prisma.listaPrecio.findFirst({ where: { id: listaPrecioId, tenantId } })
    if (!lista) {
      return { ok: false, status: 404, error: 'ListaPrecio not found' }
    }
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: input.articuloId, tenantId },
      select: { id: true },
    })
    if (!articulo) {
      return { ok: false, status: 400, error: 'articuloId does not belong to this tenant' }
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.listaPrecioItem.findUnique({
        where: { listaPrecioId_articuloId: { listaPrecioId, articuloId: input.articuloId } },
      })
      const upserted = existing
        ? await tx.listaPrecioItem.update({
            where: { id: existing.id },
            data: {
              tipoPrecio: input.tipoPrecio,
              precio: input.precio,
              porcentaje: input.porcentaje,
            },
          })
        : await tx.listaPrecioItem.create({
            data: {
              tenantId,
              listaPrecioId,
              articuloId: input.articuloId,
              tipoPrecio: input.tipoPrecio,
              precio: input.precio,
              porcentaje: input.porcentaje,
            },
          })
      await tx.precioEscalonado.deleteMany({ where: { listaPrecioItemId: upserted.id } })
      if (input.escalonados.length > 0) {
        await tx.precioEscalonado.createMany({
          data: input.escalonados.map((e) => ({
            listaPrecioItemId: upserted.id,
            cantidadDesde: new Decimal(e.cantidadDesde),
            cantidadHasta: e.cantidadHasta == null ? null : new Decimal(e.cantidadHasta),
            precio: new Decimal(e.precio),
          })),
        })
      }
      return tx.listaPrecioItem.findUniqueOrThrow({
        where: { id: upserted.id },
        include: {
          escalonados: { orderBy: { cantidadDesde: 'asc' } },
          articulo: { select: { id: true, codigo: true, descripcion: true } },
        },
      })
    })
    return { ok: true, data: mapItem(item) }
  }

  async removeItem(
    tenantId: number,
    listaPrecioId: number,
    itemId: number,
  ): Promise<ServiceResult<null>> {
    const item = await this.prisma.listaPrecioItem.findFirst({
      where: { id: itemId, listaPrecioId, tenantId },
      select: { id: true },
    })
    if (!item) {
      return { ok: false, status: 404, error: 'ListaPrecioItem not found' }
    }
    await this.prisma.listaPrecioItem.delete({ where: { id: itemId } })
    return { ok: true, data: null }
  }

  /**
   * @en Applies a percentage to every fixed price (item + tiers) in a list; preview does not persist.
   * @es Aplica un porcentaje a cada precio fijo (ítem + tramos) de la lista; el preview no persiste.
   * @pt-BR Aplica um percentual a cada preço fixo (item + faixas) da lista; a prévia não persiste.
   */
  async bulkUpdate(
    tenantId: number,
    listaPrecioId: number,
    porcentaje: number,
    preview: boolean,
  ): Promise<ServiceResult<ListaPrecioBulkUpdateResult>> {
    const lista = await this.prisma.listaPrecio.findFirst({
      where: { id: listaPrecioId, tenantId },
      include: {
        items: {
          where: { tipoPrecio: 'fijo' },
          include: {
            escalonados: true,
            articulo: { select: { descripcion: true } },
          },
        },
      },
    })
    if (!lista) {
      return { ok: false, status: 404, error: 'ListaPrecio not found' }
    }

    const factor = 1 + porcentaje / 100
    const ejemplos: ListaPrecioBulkUpdatePreviewRow[] = []
    let afectados = 0

    for (const item of lista.items) {
      if (item.precio != null) {
        const actual = Number(item.precio.toString())
        const nuevo = round2(actual * factor)
        afectados += 1
        if (ejemplos.length < 10) {
          ejemplos.push({
            listaPrecioItemId: item.id,
            articuloId: item.articuloId,
            descripcion: item.articulo?.descripcion ?? '',
            precioActual: actual,
            precioNuevo: nuevo,
          })
        }
      }
    }

    if (!preview) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of lista.items) {
          if (item.precio != null) {
            const nuevo = round2(Number(item.precio.toString()) * factor)
            await tx.listaPrecioItem.update({
              where: { id: item.id },
              data: { precio: new Decimal(nuevo) },
            })
          }
          for (const esc of item.escalonados) {
            const nuevoEsc = round2(Number(esc.precio.toString()) * factor)
            await tx.precioEscalonado.update({
              where: { id: esc.id },
              data: { precio: new Decimal(nuevoEsc) },
            })
          }
        }
      })
    }

    return {
      ok: true,
      data: { success: true, preview, afectados, ejemplos },
    }
  }

  /**
   * @en Resolves effective unit price: catalog cascade (offer/override/category) then list tiers -> base (#235).
   * @es Resuelve precio unitario efectivo: cascada de catálogo (oferta/override/categoría) luego tramos de lista -> base (#235).
   * @pt-BR Resolve preço unitário efetivo: cascata de catálogo (oferta/override/categoria) depois faixas de lista -> base (#235).
   */
  async getPrecioEfectivo(
    tenantId: number,
    articuloId: number,
    listaPrecioId: number | undefined,
    cantidad: number,
  ): Promise<ServiceResult<PrecioEfectivoResponse>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: {
        categoria: { include: { padre: true } },
        padre: { include: { categoria: { include: { padre: true } } } },
        ofertas: {
          where: {
            activa: true,
            vigenciaDesde: { lte: new Date() },
            vigenciaHasta: { gte: new Date() },
          },
          orderBy: { precioOferta: 'asc' },
          take: 1,
        },
      },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    let precioBase = Number(articulo.precioLista1.toString())
    let catalogOrigen: PrecioEfectivoOrigen = 'base'
    const oferta = articulo.ofertas?.[0]
    if (oferta) {
      precioBase = round2(Number(oferta.precioOferta.toString()))
      catalogOrigen = 'oferta'
    } else if (!articulo.heredaPrecio && articulo.precioOverride != null) {
      precioBase = round2(Number(articulo.precioOverride.toString()))
      catalogOrigen = 'override_variante'
    } else {
      const categoria = articulo.categoria ?? articulo.padre?.categoria ?? null
      if (categoria?.precioDefault != null) {
        precioBase = round2(Number(categoria.precioDefault.toString()))
        catalogOrigen = categoria.padreId != null ? 'precio_subfamilia' : 'precio_familia'
      } else if (categoria?.padre?.precioDefault != null) {
        precioBase = round2(Number(categoria.padre.precioDefault.toString()))
        catalogOrigen = 'precio_familia'
      }
    }

    const baseResponse: PrecioEfectivoResponse = {
      success: true,
      articuloId,
      listaPrecioId: listaPrecioId ?? null,
      cantidad,
      precioBase,
      precio: precioBase,
      origen: catalogOrigen,
      moneda: 'ARS',
    }

    if (listaPrecioId == null) {
      return { ok: true, data: baseResponse }
    }

    const lista = await this.prisma.listaPrecio.findFirst({
      where: { id: listaPrecioId, tenantId },
      include: {
        items: {
          where: { articuloId },
          include: { escalonados: { orderBy: { cantidadDesde: 'desc' } } },
        },
      },
    })

    const now = new Date()
    const expired = lista?.vigenciaHasta != null && lista.vigenciaHasta.getTime() < now.getTime()
    if (!lista || !lista.activa || expired) {
      return { ok: true, data: baseResponse }
    }

    const moneda = lista.moneda
    const item = lista.items[0]
    if (!item) {
      return { ok: true, data: { ...baseResponse, moneda } }
    }

    const tier = item.escalonados.find((e) => {
      const desde = Number(e.cantidadDesde.toString())
      const hasta = e.cantidadHasta == null ? null : Number(e.cantidadHasta.toString())
      return cantidad >= desde && (hasta == null || cantidad <= hasta)
    })
    if (tier) {
      return {
        ok: true,
        data: {
          ...baseResponse,
          moneda,
          precio: round2(Number(tier.precio.toString())),
          origen: 'escalonado',
        },
      }
    }

    if (item.tipoPrecio === 'fijo' && item.precio != null) {
      return {
        ok: true,
        data: {
          ...baseResponse,
          moneda,
          precio: round2(Number(item.precio.toString())),
          origen: 'fijo',
        },
      }
    }

    if (item.tipoPrecio === 'porcentaje_sobre_base' && item.porcentaje != null) {
      const pct = Number(item.porcentaje.toString())
      return {
        ok: true,
        data: {
          ...baseResponse,
          moneda,
          precio: round2(precioBase * (1 + pct / 100)),
          origen: 'porcentaje_sobre_base',
        },
      }
    }

    return { ok: true, data: { ...baseResponse, moneda } }
  }
}
