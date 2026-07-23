import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  CategoriaArticuloCreateInput,
  CategoriaArticuloPatchInput,
  CategoriaArticuloRow,
  CategoriaAtributoCreateInput,
  CategoriaAtributoPatchInput,
  CategoriaAtributoRow,
  CategoriaAtributoValorCreateInput,
  CategoriaAtributoValorRow,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const categoriaInclude = {
  atributos: {
    include: { valores: { orderBy: { orden: 'asc' as const } } },
    orderBy: { orden: 'asc' as const },
  },
  hijos: {
    orderBy: { nombre: 'asc' as const },
  },
} satisfies Prisma.CategoriaArticuloInclude

type CategoriaDb = Prisma.CategoriaArticuloGetPayload<{ include: typeof categoriaInclude }>

function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : Number(value.toString())
}

function mapValor(row: CategoriaDb['atributos'][number]['valores'][number]): CategoriaAtributoValorRow {
  return {
    id: row.id,
    atributoId: row.atributoId,
    valor: row.valor,
    orden: row.orden,
  }
}

function mapAtributo(row: CategoriaDb['atributos'][number]): CategoriaAtributoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    categoriaId: row.categoriaId,
    nombre: row.nombre,
    orden: row.orden,
    valores: row.valores.map(mapValor),
  }
}

function mapCategoria(row: CategoriaDb): CategoriaArticuloRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    nombre: row.nombre,
    codigo: row.codigo,
    padreId: row.padreId,
    precioDefault: toNumber(row.precioDefault),
    activo: row.activo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    atributos: row.atributos.map(mapAtributo),
    hijos: row.hijos.map((h) => ({
      id: h.id,
      tenantId: h.tenantId,
      nombre: h.nombre,
      codigo: h.codigo,
      padreId: h.padreId,
      precioDefault: toNumber(h.precioDefault),
      activo: h.activo,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    })),
  }
}

/**
 * @en Hierarchical article categories with attributes for variant generation (#235).
 * @es Categorías jerárquicas de artículos con atributos para generación de variantes (#235).
 * @pt-BR Categorias hierárquicas de artigos com atributos para geração de variantes (#235).
 */
export class CategoriaArticuloService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { padreId?: number | null; activo?: boolean | null },
  ): Promise<{ total: number; rows: CategoriaArticuloRow[] }> {
    const where: Prisma.CategoriaArticuloWhereInput = {
      tenantId,
      ...(opts?.padreId === undefined
        ? {}
        : opts.padreId === null
          ? { padreId: null }
          : { padreId: opts.padreId }),
      ...(opts?.activo != null ? { activo: opts.activo } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.categoriaArticulo.count({ where }),
      this.prisma.categoriaArticulo.findMany({
        where,
        include: categoriaInclude,
        orderBy: { nombre: 'asc' },
        take,
        skip,
      }),
    ])
    return { total, rows: rows.map(mapCategoria) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<CategoriaArticuloRow>> {
    const row = await this.prisma.categoriaArticulo.findFirst({
      where: { id, tenantId },
      include: categoriaInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'Categoria not found' }
    return { ok: true, data: mapCategoria(row) }
  }

  async create(
    tenantId: number,
    body: CategoriaArticuloCreateInput & {
      codigo: string | null
      padreId: number | null
      precioDefault: number | null
      activo: boolean
    },
  ): Promise<ServiceResult<CategoriaArticuloRow>> {
    if (body.padreId != null) {
      const padre = await this.prisma.categoriaArticulo.findFirst({
        where: { id: body.padreId, tenantId },
        select: { id: true },
      })
      if (!padre) return { ok: false, status: 400, error: 'padreId is not valid for this tenant' }
    }
    const created = await this.prisma.categoriaArticulo.create({
      data: {
        tenantId,
        nombre: body.nombre,
        codigo: body.codigo,
        padreId: body.padreId,
        precioDefault: body.precioDefault == null ? null : new Decimal(body.precioDefault),
        activo: body.activo,
      },
      include: categoriaInclude,
    })
    return { ok: true, data: mapCategoria(created) }
  }

  async update(
    tenantId: number,
    id: number,
    body: CategoriaArticuloPatchInput,
  ): Promise<ServiceResult<CategoriaArticuloRow>> {
    const existing = await this.prisma.categoriaArticulo.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Categoria not found' }
    if (body.padreId != null) {
      if (body.padreId === id) {
        return { ok: false, status: 400, error: 'padreId cannot reference itself' }
      }
      const padre = await this.prisma.categoriaArticulo.findFirst({
        where: { id: body.padreId, tenantId },
        select: { id: true },
      })
      if (!padre) return { ok: false, status: 400, error: 'padreId is not valid for this tenant' }
    }
    const updated = await this.prisma.categoriaArticulo.update({
      where: { id },
      data: {
        ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
        ...(body.codigo !== undefined ? { codigo: body.codigo } : {}),
        ...(body.padreId !== undefined ? { padreId: body.padreId } : {}),
        ...(body.precioDefault !== undefined
          ? {
              precioDefault:
                body.precioDefault == null ? null : new Decimal(body.precioDefault),
            }
          : {}),
        ...(body.activo !== undefined ? { activo: body.activo } : {}),
      },
      include: categoriaInclude,
    })
    return { ok: true, data: mapCategoria(updated) }
  }

  async remove(tenantId: number, id: number): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.categoriaArticulo.findFirst({
      where: { id, tenantId },
      select: { id: true, _count: { select: { articulos: true, hijos: true } } },
    })
    if (!existing) return { ok: false, status: 404, error: 'Categoria not found' }
    if (existing._count.articulos > 0 || existing._count.hijos > 0) {
      return {
        ok: false,
        status: 409,
        error: 'Categoria has articles or child categories',
      }
    }
    await this.prisma.categoriaArticulo.delete({ where: { id } })
    return { ok: true, data: { success: true } }
  }

  async addAtributo(
    tenantId: number,
    categoriaId: number,
    body: CategoriaAtributoCreateInput & {
      orden: number
      valores: Array<{ valor: string; orden: number }>
    },
  ): Promise<ServiceResult<CategoriaAtributoRow>> {
    const cat = await this.prisma.categoriaArticulo.findFirst({
      where: { id: categoriaId, tenantId },
      select: { id: true },
    })
    if (!cat) return { ok: false, status: 404, error: 'Categoria not found' }
    try {
      const created = await this.prisma.categoriaAtributo.create({
        data: {
          tenantId,
          categoriaId,
          nombre: body.nombre,
          orden: body.orden,
          valores: {
            create: body.valores.map((v) => ({ valor: v.valor, orden: v.orden })),
          },
        },
        include: { valores: { orderBy: { orden: 'asc' } } },
      })
      return {
        ok: true,
        data: {
          id: created.id,
          tenantId: created.tenantId,
          categoriaId: created.categoriaId,
          nombre: created.nombre,
          orden: created.orden,
          valores: created.valores.map(mapValor),
        },
      }
    } catch {
      return { ok: false, status: 409, error: 'Duplicate attribute name on category' }
    }
  }

  async patchAtributo(
    tenantId: number,
    categoriaId: number,
    atributoId: number,
    body: CategoriaAtributoPatchInput,
  ): Promise<ServiceResult<CategoriaAtributoRow>> {
    const existing = await this.prisma.categoriaAtributo.findFirst({
      where: { id: atributoId, categoriaId, tenantId },
      include: { valores: { orderBy: { orden: 'asc' } } },
    })
    if (!existing) return { ok: false, status: 404, error: 'Atributo not found' }
    const updated = await this.prisma.categoriaAtributo.update({
      where: { id: atributoId },
      data: {
        ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
        ...(body.orden !== undefined ? { orden: body.orden } : {}),
      },
      include: { valores: { orderBy: { orden: 'asc' } } },
    })
    return {
      ok: true,
      data: {
        id: updated.id,
        tenantId: updated.tenantId,
        categoriaId: updated.categoriaId,
        nombre: updated.nombre,
        orden: updated.orden,
        valores: updated.valores.map(mapValor),
      },
    }
  }

  async removeAtributo(
    tenantId: number,
    categoriaId: number,
    atributoId: number,
  ): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.categoriaAtributo.findFirst({
      where: { id: atributoId, categoriaId, tenantId },
      select: { id: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Atributo not found' }
    await this.prisma.categoriaAtributo.delete({ where: { id: atributoId } })
    return { ok: true, data: { success: true } }
  }

  async addValor(
    tenantId: number,
    categoriaId: number,
    atributoId: number,
    body: CategoriaAtributoValorCreateInput & { orden: number },
  ): Promise<ServiceResult<CategoriaAtributoValorRow>> {
    const attr = await this.prisma.categoriaAtributo.findFirst({
      where: { id: atributoId, categoriaId, tenantId },
      select: { id: true },
    })
    if (!attr) return { ok: false, status: 404, error: 'Atributo not found' }
    try {
      const created = await this.prisma.categoriaAtributoValor.create({
        data: { atributoId, valor: body.valor, orden: body.orden },
      })
      return { ok: true, data: mapValor(created) }
    } catch {
      return { ok: false, status: 409, error: 'Duplicate attribute value' }
    }
  }

  async removeValor(
    tenantId: number,
    categoriaId: number,
    atributoId: number,
    valorId: number,
  ): Promise<ServiceResult<{ success: true }>> {
    const valor = await this.prisma.categoriaAtributoValor.findFirst({
      where: {
        id: valorId,
        atributoId,
        atributo: { categoriaId, tenantId },
      },
      select: { id: true },
    })
    if (!valor) return { ok: false, status: 404, error: 'Valor not found' }
    await this.prisma.categoriaAtributoValor.delete({ where: { id: valorId } })
    return { ok: true, data: { success: true } }
  }
}
