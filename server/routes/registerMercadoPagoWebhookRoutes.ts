import type { Application, Request, Response } from 'express'
import { mercadopagoWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { mercadoPagoWebhookBodySchema } from '../schemas/mercadopago'
import {
  extractDataIdFromQuery,
  extractPaymentIdFromPayload,
  isChargebackWebhook,
  MercadoPagoWebhookService,
  type MercadoPagoWebhookPayload,
} from '../services/MercadoPagoWebhookService'
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
 * @en Public Mercado Pago webhook route (#176).
 * @es Ruta pública de webhook Mercado Pago (#176).
 * @pt-BR Rota pública de webhook Mercado Pago (#176).
 */
export function registerMercadoPagoWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const webhookService = new MercadoPagoWebhookService(prisma)

  app.post(
    '/api/webhooks/mercadopago',
    mercadopagoWebhookHttpRateLimiter,
    validateBody(mercadoPagoWebhookBodySchema),
    (req: Request, res: Response) => {
      const xSignature = headerString(req.headers['x-signature'])
      const xRequestId = headerString(req.headers['x-request-id'])
      const body = req.body as MercadoPagoWebhookPayload
      const isChargeback = isChargebackWebhook(body)
      const paymentId = isChargeback ? null : extractPaymentIdFromPayload(body)
      const queryDataId = extractDataIdFromQuery(req.query as Record<string, unknown>)
      const resourceId = extractPaymentIdFromPayload(body)
      const dataId = queryDataId ?? resourceId

      if (!xSignature || !xRequestId || !dataId) {
        res.status(400).json({ success: false, error: 'Invalid webhook headers or payload' })
        return
      }

      void webhookService
        .resolveTenantIdBySignature({
          xSignature,
          xRequestId,
          dataId,
        })
        .then((tenantId) => {
          if (tenantId == null) {
            console.warn(
              '[mercadopago-webhook] invalid_signature',
              'payment',
              sanitizeLogField(paymentId ?? dataId),
              'request',
              sanitizeLogField(xRequestId),
            )
            if (!res.headersSent) {
              res.status(400).json({ success: false, error: 'Invalid webhook signature' })
            }
            return
          }

          if (!resourceId) {
            if (!res.headersSent) {
              res.status(200).json({ success: true })
            }
            return
          }

          if (!res.headersSent) {
            res.status(200).json({ success: true })
          }

          setImmediate(() => {
            const processPromise = isChargeback
              ? webhookService.processChargebackNotification(
                  tenantId,
                  resourceId,
                  body,
                  req.ip ?? null,
                )
              : webhookService.processPaymentNotification(tenantId, resourceId, req.ip ?? null)

            void processPromise.catch((err: unknown) => {
              console.warn(
                '[mercadopago-webhook] process_error',
                'tenant',
                tenantId,
                isChargeback ? 'chargeback' : 'payment',
                sanitizeLogField(resourceId),
                'detail',
                err instanceof Error ? err.message : err,
              )
            })
          })
        })
        .catch(() => {
          if (!res.headersSent) {
            res.status(400).json({ success: false, error: 'Invalid webhook signature' })
          }
        })
    },
  )
}
