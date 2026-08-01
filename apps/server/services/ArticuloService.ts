import { Prisma, type Articulo, type PrismaClient } from '@prisma/client'
import type { ArticuloInput } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'
import { arsFromFx, TipoCambioService } from './TipoCambioService'
import { umedidaFromUnidadBase } from '../lib/uom'
import { MeliCatalogService } from './MeliCatalogService'

type ArticuloWithRubro = Prisma.ArticuloGetPayload<{ include: { rubro: true } }>

export type ArticuloListResult = {
  total: number
  articulos: ArticuloWithRubro[]
}

/**
 * @en Product (articulo) domain operations.
 * @es Operaciones de dominio de artículos.
 * @pt-BR Operações de domínio de artigos.
 */
export class ArticuloService {
  private readonly tipoCambio: TipoCambioService

  constructor(private readonly prisma: PrismaClient) {
    this.tipoCambio = new TipoCambioService(prisma)
  }

  async list(tenantId: number, filtro: string, take: number, skip: number): Promise<ArticuloListResult> {
    const where = {
      tenantId,
      OR: [
        { descripcion: { contains: filtro, mode: Prisma.QueryMode.insensitive } },
        { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
      ],
    }
    const [total, articulos] = await Promise.all([
      this.prisma.articulo.count({ where }),
      this.prisma.articulo.findMany({
        where,
        include: { rubro: true },
        orderBy: { codigo: 'asc' },
        take,
        skip,
      }),
    ])
    return { total, articulos }
  }

  async getById(tenantId: number, id: number): Promise<ArticuloWithRubro | null> {
    return this.prisma.articulo.findFirst({
      where: { id, tenantId },
      include: { rubro: true },
    })
  }

  async create(tenantId: number, body: ArticuloInput): Promise<ServiceResult<Articulo>> {
    const rubroCheck = await this.validateRubro(tenantId, body.rubroId)
    if (!rubroCheck.ok) {
      return rubroCheck
    }
    const normalized = ArticuloService.applyUomDefaultsForCreate(body)
    const priced = await this.applyFxPricing(tenantId, normalized)
    if (!priced.ok) return priced
    const articulo = await this.prisma.articulo.create({
      data: { ...priced.data, tenantId },
    })
    return { ok: true, data: articulo }
  }

  async update(tenantId: number, id: number, body: ArticuloInput): Promise<ServiceResult<Articulo>> {
    const rubroCheck = await this.validateRubro(tenantId, body.rubroId)
    if (!rubroCheck.ok) {
      return rubroCheck
    }
    const existing = await this.prisma.articulo.findFirst({ where: { id, tenantId } })
    if (!existing) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    const normalized = ArticuloService.syncUmedidaFromUnidadBase(body)
    const priced = await this.applyFxPricing(tenantId, normalized)
    if (!priced.ok) return priced
    const articulo = await this.prisma.articulo.update({
      where: { id },
      data: priced.data,
    })
    // Fire-and-forget MeLi catalog sync when an opt-in listing exists (#184).
    void new MeliCatalogService(this.prisma).syncAfterArticuloChange(tenantId, id).catch(() => undefined)
    return { ok: true, data: articulo }
  }

  /**
   * @en On create, defaults unidadBase to 'unidad' and factorConversion to 1 when omitted; derives umedida from unidadBase when explicitly provided (#203).
   * @es En alta, por defecto unidadBase 'unidad' y factorConversion 1 si se omiten; deriva umedida de unidadBase cuando se envía explícitamente (#203).
   * @pt-BR Na criação, padrão unidadBase 'unidad' e factorConversion 1 quando omitidos; deriva umedida de unidadBase quando enviado explicitamente (#203).
   */
  private static applyUomDefaultsForCreate(body: ArticuloInput): ArticuloInput {
    const unidadBase = body.unidadBase ?? 'unidad'
    const factorConversion = body.factorConversion ?? 1
    return {
      ...body,
      unidadBase,
      factorConversion,
      umedida: body.unidadBase !== undefined ? umedidaFromUnidadBase(body.unidadBase) : body.umedida,
    }
  }

  /**
   * @en On update, only re-derives umedida when unidadBase is explicitly present in the body; never resets existing unidadBase/factorConversion when omitted (#203).
   * @es En edición, sólo re-deriva umedida cuando unidadBase viene explícito; nunca resetea unidadBase/factorConversion existentes si se omiten (#203).
   * @pt-BR Na edição, só re-deriva umedida quando unidadBase vem explícito; nunca reseta unidadBase/factorConversion existentes se omitidos (#203).
   */
  private static syncUmedidaFromUnidadBase(body: ArticuloInput): ArticuloInput {
    if (body.unidadBase === undefined) return body
    return { ...body, umedida: umedidaFromUnidadBase(body.unidadBase) }
  }

  private async applyFxPricing(
    tenantId: number,
    body: ArticuloInput,
  ): Promise<ServiceResult<ArticuloInput>> {
    const moneda = body.monedaPrecio ?? 'ARS'
    if (moneda === 'ARS') {
      return {
        ok: true,
        data: { ...body, monedaPrecio: 'ARS', precioEnMonedaOrigen: null },
      }
    }
    const origen = body.precioEnMonedaOrigen
    if (origen == null || !(origen > 0)) {
      return { ok: false, status: 400, error: 'precioEnMonedaOrigen is required for FX articles' }
    }
    const vigente = await this.tipoCambio.getVigente(tenantId, moneda)
    if (!vigente.ok) {
      return {
        ok: false,
        status: 422,
        error: `No exchange rate for ${moneda}; load a rate before saving FX prices`,
      }
    }
    return {
      ok: true,
      data: {
        ...body,
        monedaPrecio: moneda,
        precioEnMonedaOrigen: origen,
        precioLista1: arsFromFx(origen, vigente.data.valor),
      },
    }
  }

  private async validateRubro(tenantId: number, rubroId: number): Promise<ServiceResult<null>> {
    const rubro = await this.prisma.rubro.findFirst({
      where: { id: rubroId, tenantId },
    })
    if (!rubro) {
      return { ok: false, status: 400, error: 'rubroId is not valid for this tenant' }
    }
    return { ok: true, data: null }
  }
}
