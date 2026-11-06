import type { Application, Request, Response } from 'express'
import { mercadopagoWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { webhookIpAllowlist } from '../middleware/webhookIpAllowlist'
import { validateBody } from '../middleware/validateBody'
import { mercadoPagoWebhookBodySchema } from '../schemas/mercadopago'
import {
  extractDataIdFromQuery,
  extractPaymentIdFromPayload,
  isChargebackWebhook,
  type MercadoPagoWebhookPayload,
} from '../services/MercadoPagoWebhookService'
import { MercadoPagoWebhookInboxService } from '../services/MercadoPagoWebhookInboxService'
import { PaymentWebhookService } from '../payments/PaymentWebhookService'
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
 * @en Public Mercado Pago webhook route (#176/#447). Persists inbox before 2xx; effects via worker/best-effort.
 * @es Ruta pública webhook Mercado Pago (#176/#447). Persiste inbox antes del 2xx; efectos vía worker/best-effort.
 * @pt-BR Rota pública webhook Mercado Pago (#176/#447). Persiste inbox antes do 2xx; efeitos via worker/best-effort.
 */
export function registerMercadoPagoWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  const webhookService = new PaymentWebhookService(prisma)
  const inboxService = new MercadoPagoWebhookInboxService(prisma)

  app.post(
    '/api/webhooks/mercadopago',
    webhookIpAllowlist,
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
        .resolveMercadoPagoTenantBySignature({
          xSignature,
          xRequestId,
          dataId,
        })
        .then(async (tenantId) => {
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

          let inboxId: number
          try {
            const row = await inboxService.enqueue({
              tenantId,
              resourceType: isChargeback ? 'chargeback' : 'payment',
              resourceId,
              payload: body,
              action: body.action ?? null,
            })
            inboxId = row.id
          } catch (err: unknown) {
            console.warn(
              '[mercadopago-webhook] inbox_persist_error',
              'tenant',
              tenantId,
              'payment',
              sanitizeLogField(resourceId),
              'detail',
              err instanceof Error ? err.message : err,
            )
            if (!res.headersSent) {
              res.status(503).json({ success: false, error: 'Webhook persistence failed' })
            }
            return
          }

          if (!res.headersSent) {
            res.status(200).json({ success: true })
          }

          // Best-effort in-process drain; durability relies on inbox + worker (#447).
          setImmediate(() => {
            void inboxService.processById(inboxId, req.ip ?? null).catch((err: unknown) => {
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
