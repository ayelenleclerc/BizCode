import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireWooCommerceIntegration } from '../middleware/requireWooCommerceIntegration'
import { woocommerceHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { woocommerceCredentialsBodySchema } from '../schemas/domain'
import { resolveWooCommerceWebhookUrl } from '../lib/publicUrls'
import { verifyWooCommerceConnection } from '../integrations/woocommerce/woocommerceApiClient'
import { WooCommerceConfigService } from '../services/WooCommerceConfigService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en WooCommerce credential config API — Basic Auth (consumer key/secret), not OAuth (#188).
 *   `PUT` saves credentials after verifying them; `POST /verificar` re-checks the already-saved
 *   credentials (health check, no body).
 * @es API de configuración de credenciales WooCommerce — Basic Auth (consumer key/secret), sin OAuth
 *   (#188). `PUT` guarda credenciales tras verificarlas; `POST /verificar` re-chequea las credenciales
 *   ya guardadas (health check, sin body).
 * @pt-BR API de configuração de credenciais WooCommerce — Basic Auth (consumer key/secret), sem OAuth
 *   (#188). `PUT` salva credenciais após verificá-las; `POST /verificar` reverifica as credenciais já
 *   salvas (health check, sem body).
 */
export function registerWooCommerceConfigRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const wcConfig = new WooCommerceConfigService(prisma)
  const requireWc = requireWooCommerceIntegration(prisma)

  app.get(
    '/api/configuracion/woocommerce',
    requirePermission('settings.business.manage'),
    requireWc,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await wcConfig.getStatus(tenantId, resolveWooCommerceWebhookUrl(tenantId))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/configuracion/woocommerce',
    woocommerceHttpRateLimiter,
    requirePermission('settings.business.manage'),
    requireWc,
    validateBody(woocommerceCredentialsBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        const result = await wcConfig.verifyAndSave(tenantId, req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          authReq,
          'woocommerce_config_connect',
          'woocommerce_config',
          String(tenantId),
          { storeUrl: req.body.storeUrl },
        )
        res.json({
          success: true,
          data: { ...result.data, webhookUrl: resolveWooCommerceWebhookUrl(tenantId) },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/configuracion/woocommerce/verificar',
    woocommerceHttpRateLimiter,
    requirePermission('settings.business.manage'),
    requireWc,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const creds = await wcConfig.getDecryptedCredentials(tenantId)
        if (!creds.ok) {
          res.status(creds.status).json({ success: false, error: creds.error })
          return
        }
        await verifyWooCommerceConnection(
          creds.data.storeUrl,
          creds.data.consumerKey,
          creds.data.consumerSecret,
        )
        res.json({ success: true, data: { verified: true } })
      } catch (err: unknown) {
        const status =
          err && typeof err === 'object' && 'status' in err
            ? Number((err as { status: unknown }).status)
            : 502
        res
          .status(Number.isFinite(status) ? status : 502)
          .json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/configuracion/woocommerce',
    woocommerceHttpRateLimiter,
    requirePermission('settings.business.manage'),
    requireWc,
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      try {
        const tenantId = getTenantId(req)
        await wcConfig.deleteConfig(tenantId)
        await writeAudit(
          authReq,
          'woocommerce_config_disconnect',
          'woocommerce_config',
          String(tenantId),
          {},
        )
        res.json({ success: true, data: { disconnected: true } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
