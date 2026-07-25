import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'

/**
 * @en Blocks stock moves that lack lot support when articles have controlLote (#202).
 * @es Bloquea movimientos de stock sin soporte de lote si el artículo tiene controlLote (#202).
 * @pt-BR Bloqueia movimentos de estoque sem suporte a lote quando o artigo tem controlLote (#202).
 */
export async function assertNoControlLoteArticles(
  prisma: PrismaClient,
  tenantId: number,
  articuloIds: number[],
): Promise<ServiceResult<void>> {
  const ids = [...new Set(articuloIds.filter((id) => Number.isInteger(id) && id >= 1))]
  if (ids.length === 0) {
    return { ok: true, data: undefined }
  }
  const blocked = await prisma.articulo.findFirst({
    where: { tenantId, id: { in: ids }, controlLote: true },
    select: { id: true, codigo: true },
  })
  if (blocked) {
    return { ok: false, status: 422, error: 'LOT_CONTROL_UNSUPPORTED' }
  }
  return { ok: true, data: undefined }
}
