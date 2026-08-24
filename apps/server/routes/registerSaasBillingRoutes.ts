import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import {
  saasBillingSubscribeHttpRateLimiter,
  saasBillingWebhookHttpRateLimiter,
} from '../middleware/routeRateLimit'
import { saasBillingWebhookBodySchema, saasSubscribeBodySchema } from '../schemas/saasBilling'
import { SaasBillingService } from '../saas/SaasBillingService'
import {
  getPlatformMpWebhookSecret,
  isPlatformMpConfigured,
} from '../saas/platformMpConfig'

function headerString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim()
  }
  return null
}

function webhookOutcome(
  type: string,
  explicit?: 'authorized' | 'paid' | 'failed',
): 'authorized' | 'paid' | 'failed' {
  if (explicit) return explicit
  const lower = type.toLowerCase()
  if (lower.includes('fail') || lower.includes('rejected') || lower.includes('cancelled')) {
    return 'failed'
  }
  if (lower.includes('authoriz') || lower.includes('preapproval')) return 'authorized'
  return 'paid'
}

/**
 * @en Tenant SaaS billing + public platform webhook (#182).
 * @es Billing SaaS del tenant + webhook público de plataforma (#182).
 * @pt-BR Billing SaaS do tenant + webhook público da plataforma (#182).
 */
export function registerSaasBillingRoutes(app: Application, prisma: PrismaClient): void {
  const billing = new SaasBillingService(prisma)

  app.get(
    '/api/tenant/billing',
    requirePermission('settings.business.manage'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      try {
        const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
        const result = await billing.listForTenant(tenantId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error, code: result.code })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, error: message })
      }
    },
  )

  app.post(
    '/api/tenant/billing/subscribe',
    requirePermission('settings.business.manage'),
    saasBillingSubscribeHttpRateLimiter,
    validateBody(saasSubscribeBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      try {
        const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
        const result = await billing.subscribe(tenantId, req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error, code: result.code })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, error: message })
      }
    },
  )

  app.post(
    '/api/saas/billing/webhook',
    saasBillingWebhookHttpRateLimiter,
    validateBody(saasBillingWebhookBodySchema),
    async (req: Request, res: Response) => {
      try {
        if (isPlatformMpConfigured()) {
          const secret = getPlatformMpWebhookSecret()
          if (!secret) {
            res.status(503).json({
              success: false,
              error: 'Platform Mercado Pago webhook secret is not configured',
              code: 'WEBHOOK_SECRET_MISSING',
            })
            return
          }
          const provided = headerString(req.headers['x-bizcode-saas-webhook-secret'])
          if (provided !== secret) {
            res.status(401).json({ success: false, error: 'Invalid webhook secret', code: 'WEBHOOK_UNAUTHORIZED' })
            return
          }
        }

        const body = req.body as {
          type: string
          data?: { id?: string }
          tenantId?: number
          outcome?: 'authorized' | 'paid' | 'failed'
          id?: string
        }
        const preapprovalId = body.data?.id ?? null
        const idempotencyKey =
          body.id?.trim() ||
          `${body.type}:${preapprovalId ?? 'none'}:${body.tenantId ?? 'none'}:${body.outcome ?? 'auto'}`

        const result = await billing.applyWebhookEvent({
          idempotencyKey,
          eventType: body.type,
          payload: body,
          preapprovalId,
          tenantId: body.tenantId ?? null,
          outcome: webhookOutcome(body.type, body.outcome),
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error, code: result.code })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, error: message })
      }
    },
  )
}
