import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import {
  shippingApiCarrierParamSchema,
  shippingCarrierConfigUpsertBodySchema,
} from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'
import type { ShippingApiCarrier } from '../services/ShippingCarrierConfigService'

/**
 * @en Shipping carrier credential routes (#193).
 * @es Rutas de credenciales de transportistas (#193).
 * @pt-BR Rotas de credenciais de transportadoras (#193).
 */
export function registerShippingCarrierRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const configs = services.shippingCarrierConfig

  app.get(
    '/api/shipping-carriers/:carrier/config',
    requirePermission('logistics.manage'),
    async (req: Request, res: Response) => {
      try {
        const parsed = shippingApiCarrierParamSchema.safeParse(req.params.carrier)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'carrier must be andreani or correo_argentino' })
          return
        }
        const tenantId = getTenantId(req)
        const row = await configs.getPublic(tenantId, parsed.data as ShippingApiCarrier)
        if (!row) {
          res.status(404).json({ success: false, error: 'Carrier config not found' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/shipping-carriers/:carrier/config',
    requirePermission('logistics.manage'),
    validateBody(shippingCarrierConfigUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const parsed = shippingApiCarrierParamSchema.safeParse(req.params.carrier)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'carrier must be andreani or correo_argentino' })
          return
        }
        const tenantId = getTenantId(req)
        const result = await configs.upsert(tenantId, parsed.data as ShippingApiCarrier, req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'shipping_carrier_config_upsert', 'shipping_carrier_config', parsed.data, {
          usernameLast4: result.data.usernameLast4,
          sandboxMode: result.data.sandboxMode,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
