import type { Application, Request, Response } from 'express'
import { tiendanubeWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { webhookIpAllowlist } from '../middleware/webhookIpAllowlist'
import { validateBody } from '../middleware/validateBody'
import { tiendanubeWebhookBodySchema } from '../schemas/tiendanubeWebhook'
import {
  TiendanubeWebhookService,
  type TiendanubeWebhookPayload,
} from '../services/TiendanubeWebhookService'
import {
  resolveTiendanubeWebhookSecret,
  verifyTiendanubeWebhookSignature,
} from '../lib/tiendanubeWebhookSignature'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import type { RestRouteContext } from './restRouteTypes'

function headerString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim()
  }
  return null
}

/**
 * @en Public Tiendanube notifications webhook (#187).
 * @es Webhook público de notificaciones Tiendanube (#187).
 * @pt-BR Webhook público de notificações Tiendanube (#187).
 */
export function registerTiendanubeWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const webhookService = new TiendanubeWebhookService(prisma)

  app.post(
    '/api/webhooks/tiendanube',
    webhookIpAllowlist,
    tiendanubeWebhookHttpRateLimiter,
    validateBody(tiendanubeWebhookBodySchema),
    (req: Request, res: Response) => {
      const hmacHeader = headerString(req.headers['x-linkedstore-hmac-sha256'])
      const secret = resolveTiendanubeWebhookSecret()
      const rawBody =
        typeof (req as Request & { rawBody?: Buffer | string }).rawBody === 'string' ||
        Buffer.isBuffer((req as Request & { rawBody?: Buffer | string }).rawBody)
          ? (req as Request & { rawBody: Buffer | string }).rawBody
          : JSON.stringify(req.body)

      if (!secret || !hmacHeader) {
        res.status(400).json({ success: false, error: 'Invalid webhook headers or payload' })
        return
      }

      const valid = verifyTiendanubeWebhookSignature({
        secret,
        rawBody,
        hmacHeader,
      })
      if (!valid) {
        console.warn(
          '[tiendanube-webhook] invalid_signature',
          'event',
          sanitizeLogField(String((req.body as TiendanubeWebhookPayload).event ?? '')),
        )
        res.status(400).json({ success: false, error: 'Invalid webhook signature' })
        return
      }

      const body = req.body as TiendanubeWebhookPayload
      res.status(200).json({ success: true })

      setImmediate(() => {
        void webhookService.processNotification(body).catch((err: unknown) => {
          console.warn(
            '[tiendanube-webhook] process_error',
            'event',
            sanitizeLogField(body.event ?? ''),
            'detail',
            err instanceof Error ? err.message : err,
          )
        })
      })
    },
  )
}
