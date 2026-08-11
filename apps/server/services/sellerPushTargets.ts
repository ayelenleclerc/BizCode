import type { PrismaClient } from '@prisma/client'
import { createNotification } from '../notifications'
import type { NotificationPayload, NotificationType } from '../notifications'

const RECENT_PEDIDO_DAYS = 90

/**
 * @en Resolves active seller user ids linked to a customer (zone + recent pedidos).
 * @es Resuelve ids de sellers activos ligados a un cliente (zona + pedidos recientes).
 * @pt-BR Resolve ids de sellers ativos ligados a um cliente (zona + pedidos recentes).
 */
export async function resolveSellersForCliente(
  prisma: PrismaClient,
  tenantId: number,
  clienteId: number,
): Promise<number[]> {
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, tenantId },
    select: { deliveryZoneId: true },
  })
  if (!cliente) {
    return []
  }

  const ids = new Set<number>()

  if (cliente.deliveryZoneId != null) {
    const zones = await prisma.vendedorZona.findMany({
      where: { tenantId, deliveryZoneId: cliente.deliveryZoneId },
      select: { vendedorId: true, vendedor: { select: { active: true, role: true } } },
    })
    for (const row of zones) {
      if (row.vendedor.active && row.vendedor.role === 'seller') {
        ids.add(row.vendedorId)
      }
    }
  }

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - RECENT_PEDIDO_DAYS)
  const pedidos = await prisma.pedido.findMany({
    where: {
      tenantId,
      clienteId,
      vendedorId: { not: null },
      createdAt: { gte: since },
    },
    select: { vendedorId: true, vendedor: { select: { active: true, role: true } } },
    distinct: ['vendedorId'],
  })
  for (const row of pedidos) {
    if (
      row.vendedorId != null &&
      row.vendedor?.active &&
      row.vendedor.role === 'seller'
    ) {
      ids.add(row.vendedorId)
    }
  }

  return [...ids]
}

/**
 * @en Creates in-app + push notifications for all sellers linked to a customer.
 * @es Crea notificaciones in-app + push para sellers ligados a un cliente.
 * @pt-BR Cria notificações in-app + push para sellers ligados a um cliente.
 */
export async function notifySellersForCliente(
  prisma: PrismaClient,
  tenantId: number,
  clienteId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  const sellerIds = await resolveSellersForCliente(prisma, tenantId, clienteId)
  await Promise.all(
    sellerIds.map((userId) => createNotification(prisma, tenantId, userId, type, payload)),
  )
}
