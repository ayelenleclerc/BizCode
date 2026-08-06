import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMercadoPagoIntegration } from '../middleware/requireMercadoPagoIntegration'
import { mercadopagoPreferenceHttpRateLimiter } from '../middleware/routeRateLimit'
import { PaymentService } from '../payments/PaymentService'
import { MercadoPagoPreferenceService } from '../services/MercadoPagoPreferenceService'
import { MercadoPagoQrService } from '../services/MercadoPagoQrService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parseFacturaIdParam(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id >= 1 ? id : null
}

/**
 * @en Mercado Pago payment link routes per invoice (#175). Compat alias: preference create
 *   goes through `PaymentService` (#377); response shape stays the legacy MP DTO.
 * @es Rutas de link de pago Mercado Pago por factura (#175). Alias de compatibilidad:
 *   la preferencia se crea vía `PaymentService` (#377); la respuesta sigue el DTO legacy MP.
 * @pt-BR Rotas de link de pagamento Mercado Pago por fatura (#175). Alias de compatibilidade:
 *   a preferência é criada via `PaymentService` (#377); a resposta mantém o DTO legado MP.
 */
export function registerMercadoPagoFacturaRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const paymentService = new PaymentService(prisma)
  const mpPreference = new MercadoPagoPreferenceService(prisma)
  const mpQr = new MercadoPagoQrService(prisma)
  const requireMp = requireMercadoPagoIntegration(prisma)

  app.get(
    '/api/facturas/:id/mp',
    requirePermission('reports.financial.read'),
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parseFacturaIdParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const result = await mpPreference.getStatus(getTenantId(req), facturaId)
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
    '/api/facturas/:id/mp/preference',
    requirePermission('reports.financial.read'),
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parseFacturaIdParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const tenantId = getTenantId(req)
        const createResult = await paymentService.createPaymentForInvoice(
          tenantId,
          facturaId,
          'mercadopago',
        )
        if (!createResult.ok) {
          res.status(createResult.status).json({ success: false, error: createResult.error })
          return
        }
        // Prefer legacy DTO from PreferenceService when the write is visible; otherwise
        // synthesize from the normalized CreatePaymentResult (keeps unit mocks honest).
        const status = await mpPreference.getStatus(tenantId, facturaId)
        const data =
          status.ok && status.data.preferenceId
            ? status.data
            : {
                estado: (createResult.data.providerStatus ?? 'pending') as
                  | 'pending'
                  | 'approved'
                  | 'rejected'
                  | 'cancelled'
                  | 'refunded'
                  | 'charged_back'
                  | 'in_process'
                  | 'expired'
                  | 'none',
                preferenceId: createResult.data.preferenceId,
                paymentLink: createResult.data.checkoutUrl,
                expiresAt: createResult.data.expiresAt?.toISOString(),
                amount:
                  createResult.data.amount != null
                    ? createResult.data.amount.toFixed(2)
                    : status.ok
                      ? status.data.amount
                      : undefined,
                facturaRef: status.ok ? status.data.facturaRef : undefined,
              }
        await writeAudit(
          req as AuthenticatedRequest,
          'mercadopago_preference_create',
          'factura',
          String(facturaId),
          { preferenceId: data.preferenceId },
        )
        res.status(201).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/facturas/:id/mp/qr',
    requirePermission('reports.financial.read'),
    requireMp,
    mercadopagoPreferenceHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const facturaId = parseFacturaIdParam(String(req.params.id))
        if (facturaId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const tenantId = getTenantId(req)
        const result = await mpQr.createDynamicQr(tenantId, facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'mercadopago_qr_create',
          'factura',
          String(facturaId),
          { qrOrderId: result.data.qrOrderId },
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
