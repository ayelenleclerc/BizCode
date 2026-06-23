import type { PrismaClient } from '@prisma/client'

export const REPARTO_ACTIVE_ESTADOS = ['planned', 'on_route'] as const

/**
 * @en Rejects when a delivery order is already on an active route (#140).
 * @es Rechaza si la OE ya está en un reparto activo (#140).
 * @pt-BR Rejeita se a OE já está em uma rota ativa (#140).
 */
export async function assertOrdenNotInActiveReparto(
  prisma: PrismaClient,
  tenantId: number,
  ordenEntregaIds: number[],
): Promise<{ ok: true } | { ok: false; ordenEntregaId: number }> {
  if (ordenEntregaIds.length === 0) {
    return { ok: true }
  }
  const conflict = await prisma.repartoItem.findFirst({
    where: {
      ordenEntregaId: { in: ordenEntregaIds },
      ordenEntrega: { tenantId },
      reparto: { tenantId, estado: { in: [...REPARTO_ACTIVE_ESTADOS] } },
    },
    select: { ordenEntregaId: true },
  })
  if (conflict) {
    return { ok: false, ordenEntregaId: conflict.ordenEntregaId }
  }
  return { ok: true }
}
