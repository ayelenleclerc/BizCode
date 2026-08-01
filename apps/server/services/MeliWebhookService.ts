/**
 * @en Mercado Libre notifications webhook processing (#185).
 * @es Procesamiento de webhooks/notificaciones Mercado Libre (#185).
 * @pt-BR Processamento de webhooks/notificações Mercado Livre (#185).
 */

import type { PrismaClient } from '@prisma/client'
import {
  getMeliItem,
  getMeliOrder,
} from '../integrations/meli/meliItemsClient'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { MeliConfigService } from './MeliConfigService'
import { StockAjusteService } from './StockAjusteService'

export type MeliWebhookPayload = {
  resource?: string
  topic?: string
  user_id?: string | number
  application_id?: string | number
  attempts?: number
  sent?: string
  received?: string
}

/**
 * @en Extracts order/item id from MeLi `resource` path (#185).
 * @es Extrae id de orden/ítem del path `resource` MeLi (#185).
 * @pt-BR Extrai id de pedido/item do path `resource` MeLi (#185).
 */
export function extractMeliResourceId(resource: string): string | null {
  const trimmed = resource.trim()
  if (!trimmed) return null
  const parts = trimmed.replace(/^\//, '').split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  return last && last.length > 0 ? last : null
}

/**
 * @en Mercado Libre webhook service: orders_v2 → venta_meli; items → price alert (#185).
 * @es Servicio webhook ML: orders_v2 → venta_meli; items → alerta de precio (#185).
 * @pt-BR Serviço webhook ML: orders_v2 → venta_meli; items → alerta de preço (#185).
 */
export class MeliWebhookService {
  private readonly meliConfig: MeliConfigService
  private readonly stockAjuste: StockAjusteService

  constructor(private readonly prisma: PrismaClient) {
    this.meliConfig = new MeliConfigService(prisma)
    this.stockAjuste = new StockAjusteService(prisma)
  }

  async processNotification(payload: MeliWebhookPayload): Promise<void> {
    const topic = typeof payload.topic === 'string' ? payload.topic.trim() : ''
    const resource = typeof payload.resource === 'string' ? payload.resource.trim() : ''
    if (!topic || !resource) return

    const meliUserId =
      payload.user_id != null ? String(payload.user_id).trim().slice(0, 40) : null

    try {
      await this.prisma.meliWebhookEvent.create({
        data: {
          topic: topic.slice(0, 40),
          resource: resource.slice(0, 200),
          meliUserId,
        },
      })
    } catch {
      // Unique (topic, resource) — already processed.
      return
    }

    if (!meliUserId) return

    const config = await this.prisma.meliConfig.findFirst({
      where: { meliUserId, activo: true },
      select: { tenantId: true },
    })
    if (!config) {
      console.warn(
        '[meli-webhook] unknown_seller',
        'user',
        sanitizeLogField(meliUserId),
        'topic',
        sanitizeLogField(topic),
      )
      return
    }

    await this.prisma.meliWebhookEvent.updateMany({
      where: { topic: topic.slice(0, 40), resource: resource.slice(0, 200) },
      data: { tenantId: config.tenantId },
    })

    const normalized = topic.toLowerCase()
    if (normalized === 'orders_v2' || normalized === 'orders') {
      await this.processOrderSale(config.tenantId, resource)
      return
    }
    if (
      normalized === 'items' ||
      normalized === 'item_price' ||
      normalized === 'items_prices' ||
      normalized === 'price_suggestion'
    ) {
      await this.processItemPriceAlert(config.tenantId, resource)
    }
  }

  private async processOrderSale(tenantId: number, resource: string): Promise<void> {
    const orderId = extractMeliResourceId(resource)
    if (!orderId) return

    const tokens = await this.meliConfig.getDecryptedTokens(tenantId)
    if (!tokens.ok) {
      console.warn('[meli-webhook] no_tokens', 'tenant', tenantId)
      return
    }

    let order
    try {
      order = await getMeliOrder(tokens.data.accessToken, orderId)
    } catch (err: unknown) {
      console.warn(
        '[meli-webhook] order_fetch_error',
        'tenant',
        tenantId,
        'order',
        sanitizeLogField(orderId),
        'detail',
        err instanceof Error ? err.message : err,
      )
      return
    }

    const systemUserId = resolveSystemUserId()
    for (const line of order.order_items ?? []) {
      const itemId = line.item?.id?.trim()
      const qty = Number(line.quantity)
      if (!itemId || !Number.isFinite(qty) || qty <= 0) continue

      const pub = await this.prisma.meliPublicacion.findFirst({
        where: { tenantId, meliItemId: itemId },
        select: { articuloId: true },
      })
      if (!pub) continue

      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: -Math.floor(qty),
        motivo: 'venta_meli',
      })
      if (!result.ok) {
        console.warn(
          '[meli-webhook] stock_adjust_failed',
          'tenant',
          tenantId,
          'articulo',
          pub.articuloId,
          'error',
          sanitizeLogField(result.error),
        )
      }
    }
  }

  private async processItemPriceAlert(tenantId: number, resource: string): Promise<void> {
    const itemId = extractMeliResourceId(resource)
    if (!itemId) return

    const pub = await this.prisma.meliPublicacion.findFirst({
      where: { tenantId, meliItemId: itemId },
      select: { articuloId: true },
    })
    if (!pub) return

    const articulo = await this.prisma.articulo.findFirst({
      where: { id: pub.articuloId, tenantId },
      select: { id: true, codigo: true, descripcion: true, precioLista1: true },
    })
    if (!articulo) return

    const tokens = await this.meliConfig.getDecryptedTokens(tenantId)
    if (!tokens.ok) return

    let remote
    try {
      remote = await getMeliItem(tokens.data.accessToken, itemId)
    } catch {
      return
    }

    const localPrice = Number(articulo.precioLista1)
    const remotePrice = Number(remote.price ?? NaN)
    if (!Number.isFinite(localPrice) || !Number.isFinite(remotePrice)) return
    if (Math.abs(localPrice - remotePrice) < 0.01) return

    console.warn(
      '[meli-webhook] price_divergence',
      'tenant',
      tenantId,
      'item',
      sanitizeLogField(itemId),
      'local',
      localPrice,
      'remote',
      remotePrice,
    )

    await notifyManagers(this.prisma, tenantId, 'meli_price_divergence', {
      articuloId: articulo.id,
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      detail: `ML price ${remotePrice} vs BizCode ${localPrice} (item ${itemId})`,
      resource: itemId,
      amount: String(remotePrice),
      limit: String(localPrice),
    })
  }
}
