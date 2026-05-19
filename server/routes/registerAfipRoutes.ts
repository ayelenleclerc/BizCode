import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { AfipService, type FiscalConfigInput } from '../fiscal/ar/AfipService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const fiscalConfigSchema = z
  .object({
    cuit: z.string().min(11).max(14),
    certificate: z.string().min(1),
    privateKey: z.string().min(1),
    ambiente: z.enum(['homologacion', 'produccion']).optional(),
  })
  .transform(
    (d): FiscalConfigInput => ({
      cuit: d.cuit,
      certificate: d.certificate,
      privateKey: d.privateKey,
      ambiente: d.ambiente,
    }),
  )

const caeBodySchema = z.object({ facturaId: z.number().int().min(1) })

export function registerAfipRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const afip = new AfipService(prisma)

  app.get('/api/afip/config', requirePermission('settings.fiscal.manage'), async (req: Request, res: Response) => {
    try {
      const status = await afip.getConfigStatus(getTenantId(req))
      res.json({ success: true, data: status })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put(
    '/api/afip/config',
    requirePermission('settings.fiscal.manage'),
    validateBody(fiscalConfigSchema),
    async (req: Request, res: Response) => {
      try {
        const result = await afip.upsertConfig(getTenantId(req), req.body as FiscalConfigInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'afip_config_upsert', 'tenant_fiscal_config', String(result.data.id))
        res.json({ success: true, data: { configured: true } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post('/api/afip/auth', requirePermission('settings.fiscal.manage'), async (req: Request, res: Response) => {
    try {
      const result = await afip.getTa(getTenantId(req))
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      res.json({
        success: true,
        data: {
          token: result.data.token,
          sign: result.data.sign,
          expiration: result.data.expiration.toISOString(),
        },
      })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/afip/cae',
    requirePermission('sales.create'),
    validateBody(caeBodySchema),
    async (req: Request, res: Response) => {
      try {
        const { facturaId } = req.body as { facturaId: number }
        const result = await afip.requestCaeForFactura(getTenantId(req), facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'afip_cae_request', 'factura', String(facturaId), {
          tipo: result.data.tipo,
          cae: result.data.cae,
        })
        res.json({ success: true, data: { cae: result.data.cae, caeVto: result.data.caeVto } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
