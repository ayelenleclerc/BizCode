import type { Articulo, Prisma, PrismaClient } from '@prisma/client'
import type { StockAjusteInput } from '@bizcode/types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import type { ServiceResult } from './serviceResults'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'

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
      select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true, tipo: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    if (articulo.tipo === 'servicio') {
      return { ok: false, status: 422, error: 'SERVICE_NO_STOCK' }
    }

    const depositoId =
      input.depositoId != null
        ? input.depositoId
        : await getDefaultDepositoId(this.prisma, tenantId)

    if (input.depositoId != null) {
      const dep = await this.prisma.deposito.findFirst({
        where: { id: input.depositoId, tenantId, activo: true },
        select: { id: true },
      })
      if (!dep) {
        return { ok: false, status: 400, error: 'depositoId is not valid for this tenant' }
      }
    }

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, depositoId)
    if (!recuentoBlock.ok) {
      return recuentoBlock
    }

    const stockBefore = articulo.stock
    const stockAfter = stockBefore + input.cantidad
    if (stockAfter < 0) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        let updated: Pick<Articulo, 'id' | 'codigo' | 'descripcion' | 'stock' | 'minimo'>
        if (depositoId != null) {
          const applied = await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId,
            depositoId,
            delta: input.cantidad,
          })
          updated = await tx.articulo.findFirstOrThrow({
            where: { id: articuloId },
            select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true },
          })
          if (updated.stock !== applied.stockTotal) {
            /* sync already set Articulo.stock */
          }
        } else {
          updated = await tx.articulo.update({
            where: { id: articuloId },
            data: { stock: stockAfter },
            select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true },
          })
        }
        const ajuste = await tx.stockAjuste.create({
          data: {
            tenantId,
            articuloId,
            cantidad: input.cantidad,
            motivo: input.motivo,
            userId,
            ...(depositoId != null ? { depositoId } : {}),
          },
          include: { user: { select: { id: true, username: true } } },
        })
        return {
          ajuste,
          articulo: updated,
          stockBefore,
          stockAfter: updated.stock,
        }
      })
      return { ok: true, data: result }
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_DEPOSIT_STOCK') {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
      throw err
    }
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
