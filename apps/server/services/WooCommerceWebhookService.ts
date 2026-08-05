/**
 * @en WooCommerce webhook processing — per-tenant route, order payload posted directly (#188).
 * @es Procesamiento de webhooks WooCommerce — ruta por tenant, payload de orden publicado directo (#188).
 * @pt-BR Processamento de webhooks WooCommerce — rota por tenant, payload do pedido publicado direto (#188).
 */

import type { PrismaClient } from '@prisma/client'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { WooCommerceOrderImportService } from './WooCommerceOrderImportService'
import type { WooCommerceOrderResponse } from '../integrations/woocommerce/woocommerceApiClient'

export type WooCommerceWebhookPayload = WooCommerceOrderResponse & Record<string, unknown>

export class WooCommerceWebhookService {
  private readonly orderImport: WooCommerceOrderImportService

  constructor(private readonly prisma: PrismaClient) {
    this.orderImport = new WooCommerceOrderImportService(prisma)
  }

  /**
   * @en Records the delivery for idempotency (topic + resource unique, resource keyed by order id
   *   AND status so each status transition — e.g. processing → completed — is still applied) then
   *   applies the order snapshot carried directly in the webhook body (#188).
   * @es Registra la entrega para idempotencia (topic + resource únicos, resource con id de orden Y
   *   estado para que cada transición de estado — p. ej. processing → completed — se siga aplicando)
   *   y aplica el snapshot de la orden que viaja directo en el cuerpo del webhook (#188).
   * @pt-BR Registra a entrega para idempotência (topic + resource únicos, resource com id do pedido
   *   E status para que cada transição — ex.: processing → completed — ainda seja aplicada) e aplica
   *   o snapshot do pedido enviado direto no corpo do webhook (#188).
   */
  async processNotification(
    tenantId: number,
    topic: string,
    deliveryId: string | null,
    payload: WooCommerceWebhookPayload,
  ): Promise<void> {
    const orderId = payload.id != null ? String(payload.id).trim() : ''
    if (!orderId) return

    const status = typeof payload.status === 'string' ? payload.status : 'unknown'
    const resource = `${tenantId}:${orderId}:${status}`.slice(0, 200)

    try {
      await this.prisma.wooCommerceWebhookEvent.create({
        data: {
          topic: topic.slice(0, 60),
          resource,
          deliveryId: deliveryId?.slice(0, 40) ?? null,
          tenantId,
        },
      })
    } catch {
      console.warn(
        '[woocommerce-webhook] duplicate_delivery',
        'tenant',
        tenantId,
        'order',
        sanitizeLogField(orderId),
      )
      return
    }

    await this.orderImport.applyOrderSnapshot(tenantId, orderId, payload)
  }
}
