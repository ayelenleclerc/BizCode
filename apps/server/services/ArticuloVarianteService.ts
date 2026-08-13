import fs from 'node:fs/promises'
import path from 'node:path'
import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import sharp from 'sharp'
import type {
  ArticuloImagenRow,
  ArticuloOfertaCreateInput,
  ArticuloOfertaPatchInput,
  ArticuloOfertaRow,
  ArticuloStockFamiliaResponse,
  ArticuloVarianteRow,
  GenerarVariantesInput,
  GenerarVariantesResult,
  PrecioCatalogoEfectivoResponse,
  PrecioCatalogoOrigen,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'
import { articuloImagePublicUrl } from '../lib/articuloImageUrl'

const MAX_IMAGES_PER_ARTICLE = 8
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const varianteInclude = {
  atributoValores: {
    include: {
      atributoValor: {
        include: { atributo: { select: { nombre: true } } },
      },
    },
  },
} satisfies Prisma.ArticuloInclude

type VarianteDb = Prisma.ArticuloGetPayload<{ include: typeof varianteInclude }>

function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : Number(value.toString())
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function imagesRoot(): string {
  return process.env.BIZCODE_ARTICULO_IMAGES_DIR?.trim() || path.join(process.cwd(), 'uploads', 'articulos')
}


function mapVariante(row: VarianteDb): ArticuloVarianteRow {
  return {
    id: row.id,
    codigo: row.codigo,
    descripcion: row.descripcion,
    padreId: row.padreId,
    esPadre: row.esPadre,
    categoriaId: row.categoriaId,
    heredaPrecio: row.heredaPrecio,
    precioOverride: toNumber(row.precioOverride),
    costoOverride: toNumber(row.costoOverride),
    precioLista1: Number(row.precioLista1.toString()),
    costo: Number(row.costo.toString()),
    stock: Number(row.stock),
    activo: row.activo,
    atributoValores: row.atributoValores.map((av) => ({
      id: av.id,
      articuloId: av.articuloId,
      atributoValorId: av.atributoValorId,
      atributoNombre: av.atributoValor.atributo.nombre,
      valor: av.atributoValor.valor,
    })),
  }
}

function mapOferta(row: {
  id: number
  tenantId: number
  articuloId: number
  precioOferta: Decimal
  vigenciaDesde: Date
  vigenciaHasta: Date
  activa: boolean
  createdAt: Date
  updatedAt: Date
}): ArticuloOfertaRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    precioOferta: Number(row.precioOferta.toString()),
    vigenciaDesde: row.vigenciaDesde.toISOString(),
    vigenciaHasta: row.vigenciaHasta.toISOString(),
    activa: row.activa,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapImagen(row: {
  id: number
  tenantId: number
  articuloId: number
  pathOriginal: string
  pathMedium: string
  pathThumb: string
  orden: number
  esPrincipal: boolean
  createdAt: Date
}): ArticuloImagenRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    pathOriginal: row.pathOriginal,
    pathMedium: row.pathMedium,
    pathThumb: row.pathThumb,
    urlOriginal: articuloImagePublicUrl(row.pathOriginal),
    urlMedium: articuloImagePublicUrl(row.pathMedium),
    urlThumb: articuloImagePublicUrl(row.pathThumb),
    orden: row.orden,
    esPrincipal: row.esPrincipal,
    createdAt: row.createdAt.toISOString(),
  }
}

function cartesian<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>(
    (acc, group) => acc.flatMap((prefix) => group.map((item) => [...prefix, item])),
    [[]],
  )
}

/**
 * @en Variant generation, catalog price cascade, offers and local images (#235).
 * @es Generación de variantes, cascada de precio de catálogo, ofertas e imágenes locales (#235).
 * @pt-BR Geração de variantes, cascata de preço de catálogo, ofertas e imagens locais (#235).
 */
export class ArticuloVarianteService {
  constructor(private readonly prisma: PrismaClient) {}

  async listVariantes(
    tenantId: number,
    padreId: number,
  ): Promise<ServiceResult<ArticuloVarianteRow[]>> {
    const padre = await this.prisma.articulo.findFirst({
      where: { id: padreId, tenantId },
      select: { id: true, esPadre: true },
    })
    if (!padre) return { ok: false, status: 404, error: 'Articulo not found' }
    const rows = await this.prisma.articulo.findMany({
      where: { tenantId, padreId },
      include: varianteInclude,
      orderBy: { codigo: 'asc' },
    })
    return { ok: true, data: rows.map(mapVariante) }
  }

  async stockFamilia(
    tenantId: number,
    padreId: number,
  ): Promise<ServiceResult<ArticuloStockFamiliaResponse>> {
    const padre = await this.prisma.articulo.findFirst({
      where: { id: padreId, tenantId },
      select: { id: true },
    })
    if (!padre) return { ok: false, status: 404, error: 'Articulo not found' }
    const variantes = await this.prisma.articulo.findMany({
      where: { tenantId, padreId },
      select: { id: true, codigo: true, descripcion: true, stock: true, activo: true },
      orderBy: { codigo: 'asc' },
    })
    const stockFamilia = variantes.reduce((sum, v) => sum + (v.activo ? Number(v.stock) : 0), 0)
    return {
      ok: true,
      data: {
        success: true,
        padreId,
        stockFamilia,
        variantes: variantes.map((v) => ({ ...v, stock: Number(v.stock) })),
      },
    }
  }

  async generarVariantes(
    tenantId: number,
    padreId: number,
    body: GenerarVariantesInput,
  ): Promise<ServiceResult<GenerarVariantesResult>> {
    const padre = await this.prisma.articulo.findFirst({
      where: { id: padreId, tenantId },
    })
    if (!padre) return { ok: false, status: 404, error: 'Articulo not found' }
    if (padre.padreId != null) {
      return { ok: false, status: 400, error: 'Cannot generate variants from a variant' }
    }

    const flatIds = body.atributoValorIdsPorAtributo.flat()
    const valores = await this.prisma.categoriaAtributoValor.findMany({
      where: { id: { in: flatIds } },
      include: {
        atributo: {
          select: { id: true, nombre: true, categoriaId: true, tenantId: true, orden: true },
        },
      },
    })
    if (valores.length !== new Set(flatIds).size) {
      return { ok: false, status: 400, error: 'One or more atributoValorIds are invalid' }
    }
    for (const v of valores) {
      if (v.atributo.tenantId !== tenantId) {
        return { ok: false, status: 400, error: 'One or more atributoValorIds are invalid' }
      }
    }

    const byAttr = new Map<number, typeof valores>()
    for (const group of body.atributoValorIdsPorAtributo) {
      const groupVals = group.map((id) => valores.find((v) => v.id === id)!)
      const attrIds = new Set(groupVals.map((v) => v.atributoId))
      if (attrIds.size !== 1) {
        return {
          ok: false,
          status: 400,
          error: 'Each atributoValorIdsPorAtributo group must belong to one attribute',
        }
      }
      const attrId = groupVals[0]!.atributoId
      byAttr.set(attrId, groupVals)
    }

    const orderedAttrs = [...byAttr.entries()].sort(
      (a, b) => a[1][0]!.atributo.orden - b[1][0]!.atributo.orden,
    )
    const combos = cartesian(orderedAttrs.map(([, vals]) => vals))
    if (combos.length === 0) {
      return { ok: false, status: 400, error: 'No combinations to generate' }
    }
    if (combos.length > 200) {
      return { ok: false, status: 400, error: 'Too many combinations (max 200)' }
    }

    const maxCodigo = await this.prisma.articulo.aggregate({
      where: { tenantId },
      _max: { codigo: true },
    })
    let nextCodigo = body.codigoInicio ?? (maxCodigo._max.codigo ?? 0) + 1

    await this.prisma.articulo.update({
      where: { id: padreId },
      data: { esPadre: true, stock: 0 },
    })

    const created: ArticuloVarianteRow[] = []
    for (const combo of combos) {
      const labelParts = combo.map((v) => v.valor)
      const descripcion = `${padre.descripcion} - ${labelParts.join(' - ')}`.slice(0, 120)
      const precio = Number(padre.precioLista1.toString())
      const costo = Number(padre.costo.toString())

      const existingSame = await this.prisma.articulo.findFirst({
        where: {
          tenantId,
          padreId,
          atributoValores: {
            every: {
              atributoValorId: { in: combo.map((c) => c.id) },
            },
          },
        },
        include: {
          atributoValores: true,
        },
      })
      if (
        existingSame &&
        existingSame.atributoValores.length === combo.length &&
        combo.every((c) => existingSame.atributoValores.some((av) => av.atributoValorId === c.id))
      ) {
        continue
      }

      while (
        await this.prisma.articulo.findFirst({
          where: { tenantId, codigo: nextCodigo },
          select: { id: true },
        })
      ) {
        nextCodigo += 1
      }

      const row = await this.prisma.articulo.create({
        data: {
          tenantId,
          codigo: nextCodigo,
          descripcion,
          rubroId: padre.rubroId,
          categoriaId: padre.categoriaId,
          esPadre: false,
          padreId,
          heredaPrecio: true,
          precioOverride: null,
          costoOverride: null,
          condIva: padre.condIva,
          umedida: padre.umedida,
          tipo: padre.tipo,
          unidadServicio: padre.unidadServicio,
          mesesGarantia: padre.mesesGarantia,
          precioLista1: new Decimal(precio),
          precioLista2: padre.precioLista2,
          costo: new Decimal(costo),
          stock: 0,
          minimo: padre.minimo,
          activo: true,
          atributoValores: {
            create: combo.map((c) => ({ atributoValorId: c.id })),
          },
        },
        include: varianteInclude,
      })
      created.push(mapVariante(row))
      nextCodigo += 1
    }

    return {
      ok: true,
      data: { success: true, creadas: created.length, variantes: created },
    }
  }

  /**
   * @en Catalog price cascade: offer -> variant override -> subcategory -> category -> precioLista1.
   * @es Cascada de precio de catálogo: oferta -> override variante -> subfamilia -> familia -> precioLista1.
   * @pt-BR Cascata de preço de catálogo: oferta -> override variante -> subfamília -> família -> precioLista1.
   */
  async resolvePrecioCatalogo(
    tenantId: number,
    articuloId: number,
    at: Date = new Date(),
  ): Promise<ServiceResult<PrecioCatalogoEfectivoResponse>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: {
        categoria: { include: { padre: true } },
        padre: { include: { categoria: { include: { padre: true } } } },
        ofertas: {
          where: {
            activa: true,
            vigenciaDesde: { lte: at },
            vigenciaHasta: { gte: at },
          },
          orderBy: { precioOferta: 'asc' },
          take: 1,
        },
      },
    })
    if (!articulo) return { ok: false, status: 404, error: 'Articulo not found' }

    const oferta = articulo.ofertas?.[0]
    if (oferta) {
      return {
        ok: true,
        data: {
          success: true,
          articuloId,
          precio: round2(Number(oferta.precioOferta.toString())),
          origen: 'oferta',
          ofertaId: oferta.id,
        },
      }
    }

    if (!articulo.heredaPrecio && articulo.precioOverride != null) {
      return {
        ok: true,
        data: {
          success: true,
          articuloId,
          precio: round2(Number(articulo.precioOverride.toString())),
          origen: 'override_variante',
          ofertaId: null,
        },
      }
    }

    const categoria = articulo.categoria ?? articulo.padre?.categoria ?? null
    if (categoria?.precioDefault != null) {
      const origen: PrecioCatalogoOrigen =
        categoria.padreId != null ? 'precio_subfamilia' : 'precio_familia'
      return {
        ok: true,
        data: {
          success: true,
          articuloId,
          precio: round2(Number(categoria.precioDefault.toString())),
          origen,
          ofertaId: null,
        },
      }
    }
    if (categoria?.padre?.precioDefault != null) {
      return {
        ok: true,
        data: {
          success: true,
          articuloId,
          precio: round2(Number(categoria.padre.precioDefault.toString())),
          origen: 'precio_familia',
          ofertaId: null,
        },
      }
    }

    return {
      ok: true,
      data: {
        success: true,
        articuloId,
        precio: round2(Number(articulo.precioLista1.toString())),
        origen: 'precio_lista1',
        ofertaId: null,
      },
    }
  }

  async listOfertas(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<ArticuloOfertaRow[]>> {
    const art = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, esPadre: true },
    })
    if (!art) return { ok: false, status: 404, error: 'Articulo not found' }
    const rows = await this.prisma.articuloOferta.findMany({
      where: { tenantId, articuloId },
      orderBy: { vigenciaDesde: 'desc' },
    })
    return { ok: true, data: rows.map(mapOferta) }
  }

  async createOferta(
    tenantId: number,
    articuloId: number,
    body: ArticuloOfertaCreateInput & { activa: boolean },
  ): Promise<ServiceResult<ArticuloOfertaRow>> {
    const art = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, esPadre: true },
    })
    if (!art) return { ok: false, status: 404, error: 'Articulo not found' }
    if (art.esPadre) {
      return { ok: false, status: 400, error: 'Offers apply only to sellable variants, not parents' }
    }
    const created = await this.prisma.articuloOferta.create({
      data: {
        tenantId,
        articuloId,
        precioOferta: new Decimal(body.precioOferta),
        vigenciaDesde: new Date(body.vigenciaDesde),
        vigenciaHasta: new Date(body.vigenciaHasta),
        activa: body.activa,
      },
    })
    return { ok: true, data: mapOferta(created) }
  }

  async updateOferta(
    tenantId: number,
    articuloId: number,
    ofertaId: number,
    body: ArticuloOfertaPatchInput,
  ): Promise<ServiceResult<ArticuloOfertaRow>> {
    const existing = await this.prisma.articuloOferta.findFirst({
      where: { id: ofertaId, articuloId, tenantId },
    })
    if (!existing) return { ok: false, status: 404, error: 'Oferta not found' }
    const updated = await this.prisma.articuloOferta.update({
      where: { id: ofertaId },
      data: {
        ...(body.precioOferta !== undefined
          ? { precioOferta: new Decimal(body.precioOferta) }
          : {}),
        ...(body.vigenciaDesde !== undefined
          ? { vigenciaDesde: new Date(body.vigenciaDesde) }
          : {}),
        ...(body.vigenciaHasta !== undefined
          ? { vigenciaHasta: new Date(body.vigenciaHasta) }
          : {}),
        ...(body.activa !== undefined ? { activa: body.activa } : {}),
      },
    })
    return { ok: true, data: mapOferta(updated) }
  }

  async removeOferta(
    tenantId: number,
    articuloId: number,
    ofertaId: number,
  ): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.articuloOferta.findFirst({
      where: { id: ofertaId, articuloId, tenantId },
      select: { id: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Oferta not found' }
    await this.prisma.articuloOferta.delete({ where: { id: ofertaId } })
    return { ok: true, data: { success: true } }
  }

  async listImagenes(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<ArticuloImagenRow[]>> {
    const art = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true },
    })
    if (!art) return { ok: false, status: 404, error: 'Articulo not found' }
    const rows = await this.prisma.articuloImagen.findMany({
      where: { tenantId, articuloId },
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
    })
    return { ok: true, data: rows.map(mapImagen) }
  }

  async uploadImagen(
    tenantId: number,
    articuloId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<ServiceResult<ArticuloImagenRow>> {
    const art = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true },
    })
    if (!art) return { ok: false, status: 404, error: 'Articulo not found' }
    const count = await this.prisma.articuloImagen.count({ where: { tenantId, articuloId } })
    if (count >= MAX_IMAGES_PER_ARTICLE) {
      return { ok: false, status: 400, error: `Maximum ${MAX_IMAGES_PER_ARTICLE} images per article` }
    }
    if (file.buffer.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, status: 400, error: 'Image exceeds 5MB limit' }
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(file.mimetype)) {
      return { ok: false, status: 400, error: 'Only JPEG, PNG or WebP images are allowed' }
    }

    const dir = path.join(imagesRoot(), String(tenantId), String(articuloId))
    await fs.mkdir(dir, { recursive: true })
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const relOriginal = path.join(String(tenantId), String(articuloId), `${stamp}-original.webp`)
    const relMedium = path.join(String(tenantId), String(articuloId), `${stamp}-medium.webp`)
    const relThumb = path.join(String(tenantId), String(articuloId), `${stamp}-thumb.webp`)

    const absOriginal = path.join(imagesRoot(), relOriginal)
    const absMedium = path.join(imagesRoot(), relMedium)
    const absThumb = path.join(imagesRoot(), relThumb)

    await sharp(file.buffer).rotate().webp({ quality: 90 }).toFile(absOriginal)
    await sharp(file.buffer).rotate().resize(800, 800, { fit: 'inside' }).webp({ quality: 85 }).toFile(absMedium)
    await sharp(file.buffer).rotate().resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(absThumb)

    const created = await this.prisma.articuloImagen.create({
      data: {
        tenantId,
        articuloId,
        pathOriginal: relOriginal.replace(/\\/g, '/'),
        pathMedium: relMedium.replace(/\\/g, '/'),
        pathThumb: relThumb.replace(/\\/g, '/'),
        orden: count,
        esPrincipal: count === 0,
      },
    })
    return { ok: true, data: mapImagen(created) }
  }

  async reorderImagenes(
    tenantId: number,
    articuloId: number,
    ordenIds: number[],
  ): Promise<ServiceResult<ArticuloImagenRow[]>> {
    const existing = await this.prisma.articuloImagen.findMany({
      where: { tenantId, articuloId },
      select: { id: true },
    })
    const existingIds = new Set(existing.map((e) => e.id))
    if (ordenIds.length !== existing.length || ordenIds.some((id) => !existingIds.has(id))) {
      return { ok: false, status: 400, error: 'ordenIds must include all image ids exactly once' }
    }
    await this.prisma.$transaction(
      ordenIds.map((id, index) =>
        this.prisma.articuloImagen.update({
          where: { id },
          data: { orden: index, esPrincipal: index === 0 },
        }),
      ),
    )
    return this.listImagenes(tenantId, articuloId)
  }

  async removeImagen(
    tenantId: number,
    articuloId: number,
    imagenId: number,
  ): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.articuloImagen.findFirst({
      where: { id: imagenId, articuloId, tenantId },
    })
    if (!existing) return { ok: false, status: 404, error: 'Imagen not found' }
    await this.prisma.articuloImagen.delete({ where: { id: imagenId } })
    for (const rel of [existing.pathOriginal, existing.pathMedium, existing.pathThumb]) {
      try {
        await fs.unlink(path.join(imagesRoot(), rel))
      } catch {
        // best-effort disk cleanup
      }
    }
    if (existing.esPrincipal) {
      const next = await this.prisma.articuloImagen.findFirst({
        where: { tenantId, articuloId },
        orderBy: { orden: 'asc' },
      })
      if (next) {
        await this.prisma.articuloImagen.update({
          where: { id: next.id },
          data: { esPrincipal: true },
        })
      }
    }
    return { ok: true, data: { success: true } }
  }
}

export { imagesRoot }
