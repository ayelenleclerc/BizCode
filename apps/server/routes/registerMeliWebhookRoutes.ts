import type { Application, Request, Response } from 'express'
import { meliWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { webhookIpAllowlist } from '../middleware/webhookIpAllowlist'
import { validateBody } from '../middleware/validateBody'
import { meliWebhookBodySchema } from '../schemas/meliWebhook'
import {
  extractMeliResourceId,
  MeliWebhookService,
  type MeliWebhookPayload,
} from '../services/MeliWebhookService'
import {
  resolveMeliWebhookSecret,
  verifyMeliWebhookSignature,
} from '../lib/meliWebhookSignature'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import type { RestRouteContext } from './restRouteTypes'

function headerString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim()
  }
  return null
}

function extractDataIdFromQuery(query: Record<string, unknown>): string | null {
  const raw = query['data.id'] ?? query['data_id']
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  return null
}

/**
 * @en Public Mercado Libre notifications webhook (#185).
 * @es Webhook público de notificaciones Mercado Libre (#185).
 * @pt-BR Webhook público de notificações Mercado Livre (#185).
 */
export function registerMeliWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const webhookService = new MeliWebhookService(prisma)

  app.post(
    '/api/webhooks/meli',
    webhookIpAllowlist,
    meliWebhookHttpRateLimiter,
    validateBody(meliWebhookBodySchema),
    (req: Request, res: Response) => {
      const xSignature = headerString(req.headers['x-signature'])
      const xRequestId = headerString(req.headers['x-request-id'])
      const body = req.body as MeliWebhookPayload
      const queryDataId = extractDataIdFromQuery(req.query as Record<string, unknown>)
      const resourceId = typeof body.resource === 'string' ? extractMeliResourceId(body.resource) : null
      const dataId = queryDataId ?? resourceId

      const secret = resolveMeliWebhookSecret()
      if (!secret || !xSignature || !xRequestId || !dataId) {
        res.status(400).json({ success: false, error: 'Invalid webhook headers or payload' })
        return
      }

      const valid = verifyMeliWebhookSignature({
        secret,
        xSignature,
        xRequestId,
        dataId,
      })
      if (!valid) {
        console.warn(
          '[meli-webhook] invalid_signature',
          'resource',
          sanitizeLogField(body.resource ?? dataId),
          'request',
          sanitizeLogField(xRequestId),
        )
        res.status(400).json({ success: false, error: 'Invalid webhook signature' })
        return
      }

      res.status(200).json({ success: true })

      setImmediate(() => {
        void webhookService.processNotification(body).catch((err: unknown) => {
          console.warn(
            '[meli-webhook] process_error',
            'topic',
            sanitizeLogField(body.topic ?? ''),
            'resource',
            sanitizeLogField(body.resource ?? ''),
            'detail',
            err instanceof Error ? err.message : err,
          )
        })
      })
    },
  )
}
