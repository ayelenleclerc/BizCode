import { Prisma, type Articulo, type PrismaClient } from '@prisma/client'
import type { ArticuloInput } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'
import { arsFromFx, TipoCambioService } from './TipoCambioService'

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
    const priced = await this.applyFxPricing(tenantId, body)
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
    const priced = await this.applyFxPricing(tenantId, body)
    if (!priced.ok) return priced
    const articulo = await this.prisma.articulo.update({
      where: { id },
      data: priced.data,
    })
    return { ok: true, data: articulo }
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
