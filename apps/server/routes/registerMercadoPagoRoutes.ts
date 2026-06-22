import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireMercadoPagoIntegration } from '../middleware/requireMercadoPagoIntegration'
import { mercadopagoTestHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { mercadoPagoConfigUpsertBodySchema } from '../schemas/mercadopago'
import { MercadoPagoConfigService } from '../services/MercadoPagoConfigService'
import { MercadoPagoQrService } from '../services/MercadoPagoQrService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Mercado Pago tenant credentials API (#174).
 * @es API de credenciales Mercado Pago por tenant (#174).
 * @pt-BR API de credenciais Mercado Pago por tenant (#174).
 */
export function registerMercadoPagoRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const mpConfig = new MercadoPagoConfigService(prisma)
  const mpQr = new MercadoPagoQrService(prisma)
  const requireMp = requireMercadoPagoIntegration(prisma)

  app.get(
    '/api/configuracion/mercadopago',
    requirePermission('settings.business.manage'),
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const data = await mpConfig.getStatus(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/configuracion/mercadopago',
    requirePermission('settings.business.manage'),
    requireMp,
    validateBody(mercadoPagoConfigUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as {
          accessToken?: string
          publicKey: string
          webhookSecret?: string
          sandboxMode?: boolean
          activo?: boolean
          collectorId?: string
          externalPosId?: string
          staticQrData?: string
        }
        const result = await mpConfig.upsert(getTenantId(req), body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'mercadopago_config_upsert',
          'mercadopago_config',
          String(getTenantId(req)),
          {
            sandboxMode: body.sandboxMode,
            activo: body.activo,
            publicKeySet: Boolean(body.publicKey),
          },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/configuracion/mercadopago/test',
    requirePermission('settings.business.manage'),
    requireMp,
    mercadopagoTestHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const result = await mpConfig.testCredentials(getTenantId(req))
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
    '/api/configuracion/mercadopago/qr-estatico',
    requirePermission('settings.business.manage'),
    requireMp,
    async (req: Request, res: Response) => {
      try {
        const result = await mpQr.getStaticQr(getTenantId(req))
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
}
