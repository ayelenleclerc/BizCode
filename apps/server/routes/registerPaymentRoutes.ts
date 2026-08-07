/**
 * @en Generic multi-provider payment routes (#377, ADR-0019). Mercado Pago legacy paths remain
 *   as compat aliases (`registerMercadoPagoRoutes` / factura routes).
 * @es Rutas genéricas de cobros multi-proveedor (#377, ADR-0019). Los paths legacy MP siguen
 *   como alias de compatibilidad.
 * @pt-BR Rotas genéricas de cobranças multi-provedor (#377, ADR-0019). Paths legados MP
 *   continuam como alias de compatibilidade.
 */

import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { paymentsMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { PaymentProviderConfigService } from '../payments/PaymentProviderConfigService'
import { PaymentService } from '../payments/PaymentService'
import { PAYMENT_PROVIDER_CODES } from '../payments/types'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const providerConfigBodySchema = z.object({
  provider: z.enum(PAYMENT_PROVIDER_CODES).default('mercadopago'),
  accessToken: z.string().min(1).optional(),
  publicKey: z.string().min(1).optional(),
  webhookSecret: z.string().optional(),
  sandboxMode: z.boolean().optional(),
  activo: z.boolean().optional(),
  collectorId: z.string().optional(),
  externalPosId: z.string().optional(),
  staticQrData: z.string().optional(),
})

const validateProviderBodySchema = z.object({
  provider: z.enum(PAYMENT_PROVIDER_CODES),
})

const providerFlagsBodySchema = z.object({
  provider: z.enum(PAYMENT_PROVIDER_CODES),
  enabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

const refundBodySchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().min(1).max(500).optional(),
  provider: z.enum(PAYMENT_PROVIDER_CODES).optional(),
})

const facturaIdParamSchema = z.coerce.number().int().min(1)

export function registerPaymentRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const providerConfigService = new PaymentProviderConfigService(prisma)
  const paymentService = new PaymentService(prisma)

  app.get(
    '/api/payments/providers/config',
    requirePermission('settings.business.manage'),
    async (req: Request, res: Response) => {
      try {
        const result = await providerConfigService.getStatus(getTenantId(req))
        res.json({ success: true, data: result.ok ? result.data : [] })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/payments/providers/config',
    paymentsMutationHttpRateLimiter,
    requirePermission('settings.business.manage'),
    validateBody(providerConfigBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as z.infer<typeof providerConfigBodySchema>
        if (body.provider !== 'mercadopago') {
          res.status(501).json({ success: false, error: 'PAYMENT_PROVIDER_NOT_IMPLEMENTED' })
          return
        }
        if (!body.publicKey) {
          res.status(400).json({ success: false, error: 'PUBLIC_KEY_REQUIRED' })
          return
        }
        const result = await providerConfigService.upsertMercadoPagoConfig(getTenantId(req), {
          accessToken: body.accessToken,
          publicKey: body.publicKey,
          webhookSecret: body.webhookSecret,
          sandboxMode: body.sandboxMode,
          activo: body.activo,
          collectorId: body.collectorId,
          externalPosId: body.externalPosId,
          staticQrData: body.staticQrData,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'payment_provider_config_upsert',
          'payment_provider_config',
          String(getTenantId(req)),
          { provider: body.provider },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/payments/providers/config',
    paymentsMutationHttpRateLimiter,
    requirePermission('settings.business.manage'),
    validateBody(providerFlagsBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as z.infer<typeof providerFlagsBodySchema>
        const tenantId = getTenantId(req)
        if (body.enabled !== undefined) {
          const enabledResult = await providerConfigService.setProviderEnabled(
            tenantId,
            body.provider,
            body.enabled,
          )
          if (!enabledResult.ok) {
            res.status(enabledResult.status).json({ success: false, error: enabledResult.error })
            return
          }
        }
        if (body.isDefault === true) {
          const defaultResult = await providerConfigService.setDefaultProvider(tenantId, body.provider)
          if (!defaultResult.ok) {
            res.status(defaultResult.status).json({ success: false, error: defaultResult.error })
            return
          }
        }
        const status = await providerConfigService.getStatus(tenantId)
        const entry = status.ok ? status.data.find((e) => e.provider === body.provider) : undefined
        await writeAudit(
          req as AuthenticatedRequest,
          'payment_provider_flags_update',
          'payment_provider_config',
          String(tenantId),
          { provider: body.provider, enabled: body.enabled, isDefault: body.isDefault },
        )
        res.json({ success: true, data: entry ?? null })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/payments/providers/validate',
    paymentsMutationHttpRateLimiter,
    requirePermission('settings.business.manage'),
    validateBody(validateProviderBodySchema),
    async (req: Request, res: Response) => {
      try {
        const { provider } = req.body as z.infer<typeof validateProviderBodySchema>
        const result = await providerConfigService.validateConfiguration(getTenantId(req), provider)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/payments/providers/capabilities',
    requirePermission('settings.business.manage'),
    (_req: Request, res: Response) => {
      try {
        res.json({ success: true, data: providerConfigService.getCapabilities() })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/payments/invoices/:facturaId/checkout',
    paymentsMutationHttpRateLimiter,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const parsedId = facturaIdParamSchema.safeParse(req.params.facturaId)
        if (!parsedId.success) {
          res.status(400).json({ success: false, error: 'INVALID_FACTURA_ID' })
          return
        }
        const result = await paymentService.createPaymentForInvoice(getTenantId(req), parsedId.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'payment_checkout_create',
          'factura',
          String(parsedId.data),
          { provider: result.data.provider, status: result.data.status },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/payments/invoices/:facturaId/status',
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const parsedId = facturaIdParamSchema.safeParse(req.params.facturaId)
        if (!parsedId.success) {
          res.status(400).json({ success: false, error: 'INVALID_FACTURA_ID' })
          return
        }
        const result = await paymentService.getPaymentStatus(getTenantId(req), parsedId.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/payments/invoices/:facturaId/refund',
    paymentsMutationHttpRateLimiter,
    requirePermission('sales.cancel'),
    validateBody(refundBodySchema),
    async (req: Request, res: Response) => {
      try {
        const parsedId = facturaIdParamSchema.safeParse(req.params.facturaId)
        if (!parsedId.success) {
          res.status(400).json({ success: false, error: 'INVALID_FACTURA_ID' })
          return
        }
        const body = req.body as z.infer<typeof refundBodySchema>
        const result = await paymentService.refundPayment(
          getTenantId(req),
          parsedId.data,
          { amount: body.amount, reason: body.reason },
          body.provider,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'payment_refund_create',
          'factura',
          String(parsedId.data),
          { refundId: result.data.refundId, status: result.data.status },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
