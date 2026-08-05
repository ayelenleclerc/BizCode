import type { Application, Request, Response } from 'express'
import { woocommerceWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { webhookIpAllowlist } from '../middleware/webhookIpAllowlist'
import { validateBody } from '../middleware/validateBody'
import { woocommerceWebhookBodySchema } from '../schemas/woocommerceWebhook'
import {
  WooCommerceWebhookService,
  type WooCommerceWebhookPayload,
} from '../services/WooCommerceWebhookService'
import { WooCommerceConfigService } from '../services/WooCommerceConfigService'
import { verifyWooCommerceWebhookSignature } from '../lib/woocommerceWebhookSignature'
import type { RestRouteContext } from './restRouteTypes'

function headerString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim()
  }
  return null
}

/**
 * @en Public per-tenant WooCommerce order webhook (#188).
 * @es Webhook público por tenant de órdenes WooCommerce (#188).
 * @pt-BR Webhook público por tenant de pedidos WooCommerce (#188).
 */
export function registerWooCommerceWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const webhookService = new WooCommerceWebhookService(prisma)
  const wcConfig = new WooCommerceConfigService(prisma)

  app.post(
    '/api/webhooks/woocommerce/:tenantId',
    webhookIpAllowlist,
    woocommerceWebhookHttpRateLimiter,
    validateBody(woocommerceWebhookBodySchema),
    async (req: Request, res: Response) => {
      const tenantId = Number.parseInt(String(req.params.tenantId), 10)
      if (!Number.isInteger(tenantId) || tenantId <= 0) {
        res.status(400).json({ success: false, error: 'Invalid tenantId' })
        return
      }

      const signatureHeader = headerString(req.headers['x-wc-webhook-signature'])
      const topic = headerString(req.headers['x-wc-webhook-topic']) ?? 'order.updated'
      const deliveryId = headerString(req.headers['x-wc-webhook-delivery-id'])
      const rawBody =
        typeof (req as Request & { rawBody?: Buffer | string }).rawBody === 'string' ||
        Buffer.isBuffer((req as Request & { rawBody?: Buffer | string }).rawBody)
          ? (req as Request & { rawBody: Buffer | string }).rawBody
          : JSON.stringify(req.body)

      const secret = await wcConfig.getDecryptedWebhookSecret(tenantId)
      if (!secret || !signatureHeader) {
        res.status(400).json({ success: false, error: 'Invalid webhook headers or payload' })
        return
      }

      const valid = verifyWooCommerceWebhookSignature({
        secret,
        rawBody,
        signatureHeader,
      })
      if (!valid) {
        // Do not log raw topic/headers (CodeQL js/log-injection); tenantId is numeric.
        console.warn('[woocommerce-webhook] invalid_signature tenant', tenantId)
        res.status(400).json({ success: false, error: 'Invalid webhook signature' })
        return
      }

      const body = req.body as WooCommerceWebhookPayload
      res.status(200).json({ success: true })

      setImmediate(() => {
        void webhookService.processNotification(tenantId, topic, deliveryId, body).catch((err: unknown) => {
          console.warn(
            '[woocommerce-webhook] process_error',
            'tenant',
            tenantId,
            'detail',
            err instanceof Error ? err.message : err,
          )
        })
      })
    },
  )
}
