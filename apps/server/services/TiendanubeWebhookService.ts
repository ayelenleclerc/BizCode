/**
 * @en Tiendanube webhook processing (#187).
 * @es Procesamiento de webhooks Tiendanube (#187).
 * @pt-BR Processamento de webhooks Tiendanube (#187).
 */

import type { PrismaClient } from '@prisma/client'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { TiendanubeConfigService } from './TiendanubeConfigService'
import { TiendanubeOrderImportService } from './TiendanubeOrderImportService'

export type TiendanubeWebhookPayload = {
  store_id?: number | string
  event?: string
  id?: number | string
}

export class TiendanubeWebhookService {
  private readonly tnConfig: TiendanubeConfigService
  private readonly orderImport: TiendanubeOrderImportService

  constructor(private readonly prisma: PrismaClient) {
    this.tnConfig = new TiendanubeConfigService(prisma)
    this.orderImport = new TiendanubeOrderImportService(prisma)
  }

  async processNotification(payload: TiendanubeWebhookPayload): Promise<void> {
    const event = typeof payload.event === 'string' ? payload.event.trim() : ''
    const storeId = payload.store_id != null ? String(payload.store_id).trim().slice(0, 40) : ''
    const resourceId = payload.id != null ? String(payload.id).trim() : ''
    if (!event || !storeId) return

    const config = await this.prisma.tiendanubeConfig.findFirst({
      where: { storeId, activo: true },
      select: { tenantId: true },
    })
    if (!config) {
      console.warn(
        '[tiendanube-webhook] unknown_store',
        'store',
        sanitizeLogField(storeId),
        'event',
        sanitizeLogField(event),
      )
      return
    }

    const resource = `${storeId}:${event}:${resourceId || 'none'}`.slice(0, 200)
    const topic = event.slice(0, 60)
    const normalized = event.toLowerCase()

    try {
      await this.prisma.tiendanubeWebhookEvent.create({
        data: {
          topic,
          resource,
          storeId,
          tenantId: config.tenantId,
        },
      })
    } catch {
      // Unique (topic, resource): still allow order lifecycle re-entry except duplicates of app/uninstall
      if (normalized === 'app/uninstalled') return
    }

    if (normalized === 'order/paid' || normalized === 'order/cancelled') {
      if (!resourceId) return
      await this.orderImport.processOrderNotification(config.tenantId, resourceId)
      return
    }

    if (normalized === 'app/uninstalled') {
      await this.tnConfig.deleteConfig(config.tenantId)
    }
  }
}
