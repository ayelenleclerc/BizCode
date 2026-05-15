import type { Articulo, Prisma, PrismaClient } from '@prisma/client'
import type { StockAjusteInput } from '../createApp.types'
import type { ServiceResult } from './serviceResults'

export type StockAjusteRow = Prisma.StockAjusteGetPayload<{
  include: { user: { select: { id: true; username: true } } }
}>

export type StockAdjustResult = {
  ajuste: StockAjusteRow
  articulo: Pick<Articulo, 'id' | 'codigo' | 'descripcion' | 'stock' | 'minimo'>
  stockBefore: number
  stockAfter: number
}

export type StockHistorialResult = {
  total: number
  ajustes: StockAjusteRow[]
}

/**
 * @en Manual stock adjustments and history per product.
 * @es Ajustes manuales de stock e historial por artículo.
 * @pt-BR Ajustes manuais de estoque e histórico por artigo.
 */
export class StockAjusteService {
  constructor(private readonly prisma: PrismaClient) {}

  async adjust(
    tenantId: number,
    articuloId: number,
    userId: number,
    input: StockAjusteInput,
  ): Promise<ServiceResult<StockAdjustResult>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const stockBefore = articulo.stock
    const stockAfter = stockBefore + input.cantidad
    if (stockAfter < 0) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.articulo.update({
        where: { id: articuloId },
        data: { stock: stockAfter },
        select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true },
      })
      const ajuste = await tx.stockAjuste.create({
        data: {
          tenantId,
          articuloId,
          cantidad: input.cantidad,
          motivo: input.motivo,
          userId,
        },
        include: { user: { select: { id: true, username: true } } },
      })
      return { ajuste, articulo: updated, stockBefore, stockAfter }
    })

    return { ok: true, data: result }
  }

  async listHistorial(
    tenantId: number,
    articuloId: number,
    take: number,
    skip: number,
  ): Promise<ServiceResult<StockHistorialResult>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const where = { tenantId, articuloId }
    const [total, ajustes] = await Promise.all([
      this.prisma.stockAjuste.count({ where }),
      this.prisma.stockAjuste.findMany({
        where,
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])

    return { ok: true, data: { total, ajustes } }
  }
}
