import type { Prisma, PrismaClient } from '@prisma/client'
import { roundQty } from '../lib/uom'

type TxClient = Prisma.TransactionClient | PrismaClient

/**
 * @en Recomputes Articulo.stock as the sum of StockDeposito.cantidad for the article (#236).
 * @es Recalcula Articulo.stock como la suma de StockDeposito.cantidad del artículo (#236).
 * @pt-BR Recalcula Articulo.stock como a soma de StockDeposito.cantidad do artigo (#236).
 */
export async function syncArticuloStockFromDepositos(
  tx: TxClient,
  tenantId: number,
  articuloId: number,
): Promise<number> {
  const agg = await tx.stockDeposito.aggregate({
    where: { tenantId, articuloId },
    _sum: { cantidad: true },
  })
  const total = roundQty(Number(agg._sum.cantidad ?? 0))
  await tx.articulo.update({
    where: { id: articuloId },
    data: { stock: total },
  })
  return total
}

/**
 * @en Ensures a StockDeposito row exists and applies a signed delta; then syncs Articulo.stock (#236).
 * @es Asegura una fila StockDeposito y aplica un delta con signo; luego sincroniza Articulo.stock (#236).
 * @pt-BR Garante uma linha StockDeposito e aplica um delta com sinal; depois sincroniza Articulo.stock (#236).
 */
export async function applyStockDepositoDelta(
  tx: TxClient,
  params: {
    tenantId: number
    articuloId: number
    depositoId: number
    delta: number
  },
): Promise<{ cantidad: number; stockTotal: number }> {
  const { tenantId, articuloId, depositoId, delta } = params
  const existing = await tx.stockDeposito.findUnique({
    where: { articuloId_depositoId: { articuloId, depositoId } },
  })
  const next = roundQty(Number(existing?.cantidad ?? 0) + delta)
  if (next < 0) {
    throw new Error('INSUFFICIENT_DEPOSIT_STOCK')
  }
  if (existing) {
    await tx.stockDeposito.update({
      where: { id: existing.id },
      data: { cantidad: next },
    })
  } else {
    await tx.stockDeposito.create({
      data: {
        tenantId,
        articuloId,
        depositoId,
        cantidad: next,
        stockMin: 0,
      },
    })
  }
  const stockTotal = await syncArticuloStockFromDepositos(tx, tenantId, articuloId)
  return { cantidad: next, stockTotal }
}

/**
 * @en Returns the default deposit id for a tenant, or null if none / unavailable (#236).
 * @es Devuelve el id del depósito default del tenant, o null si no hay / no está disponible (#236).
 * @pt-BR Retorna o id do depósito default do tenant, ou null se não houver / indisponível (#236).
 */
export async function getDefaultDepositoId(
  tx: TxClient,
  tenantId: number,
): Promise<number | null> {
  const deposito = (tx as { deposito?: PrismaClient['deposito'] }).deposito
  if (deposito == null || typeof deposito.findFirst !== 'function') {
    return null
  }
  const row = await deposito.findFirst({
    where: { tenantId, esDefault: true, activo: true },
    select: { id: true },
    orderBy: { id: 'asc' },
  })
  return row?.id ?? null
}
