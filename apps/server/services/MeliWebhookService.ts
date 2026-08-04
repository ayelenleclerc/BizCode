/**
 * @en Mercado Libre notifications webhook processing (#185/#186).
 * @es Procesamiento de webhooks/notificaciones Mercado Libre (#185/#186).
 * @pt-BR Processamento de webhooks/notificações Mercado Livre (#185/#186).
 */

import type { PrismaClient } from '@prisma/client'
import { getMeliItem } from '../integrations/meli/meliItemsClient'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { notifyManagers } from '../notifications'
import { MeliConfigService } from './MeliConfigService'
import {
  extractMeliResourceId,
  MeliOrderImportService,
} from './MeliOrderImportService'

export type MeliWebhookPayload = {
  resource?: string
  topic?: string
  user_id?: string | number
  application_id?: string | number
  attempts?: number
  sent?: string
  received?: string
}

export { extractMeliResourceId }

/**
 * @en Mercado Libre webhook service: orders → import (#186); items → price alert (#185).
 * @es Servicio webhook ML: órdenes → import (#186); items → alerta de precio (#185).
 * @pt-BR Serviço webhook ML: pedidos → import (#186); items → alerta de preço (#185).
 */
export class MeliWebhookService {
  private readonly meliConfig: MeliConfigService
  private readonly orderImport: MeliOrderImportService

  constructor(private readonly prisma: PrismaClient) {
    this.meliConfig = new MeliConfigService(prisma)
    this.orderImport = new MeliOrderImportService(prisma)
  }

  async processNotification(payload: MeliWebhookPayload): Promise<void> {
    const topic = typeof payload.topic === 'string' ? payload.topic.trim() : ''
    const resource = typeof payload.resource === 'string' ? payload.resource.trim() : ''
    if (!topic || !resource) return

    const meliUserId =
      payload.user_id != null ? String(payload.user_id).trim().slice(0, 40) : null
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

    const normalized = topic.toLowerCase()

    // Audit log — do not block orders_v2 re-entry on status transitions (#186).
    try {
      await this.prisma.meliWebhookEvent.create({
        data: {
          topic: topic.slice(0, 40),
          resource: resource.slice(0, 200),
          meliUserId,
          tenantId: config.tenantId,
        },
      })
    } catch {
      // Unique (topic, resource): still process orders; skip duplicate item alerts.
      if (
        normalized === 'items' ||
        normalized === 'item_price' ||
        normalized === 'items_prices' ||
        normalized === 'price_suggestion'
      ) {
        return
      }
    }

    if (normalized === 'orders_v2' || normalized === 'orders') {
      await this.orderImport.processOrderNotification(config.tenantId, resource)
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
