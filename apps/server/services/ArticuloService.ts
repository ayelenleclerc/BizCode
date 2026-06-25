import { Prisma, type Articulo, type PrismaClient } from '@prisma/client'
import type { ArticuloInput } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

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
  constructor(private readonly prisma: PrismaClient) {}

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
    const articulo = await this.prisma.articulo.create({
      data: { ...body, tenantId },
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
    const articulo = await this.prisma.articulo.update({
      where: { id },
      data: body,
    })
    return { ok: true, data: articulo }
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
