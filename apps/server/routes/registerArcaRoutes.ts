import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { ArcaService, type FiscalConfigInput } from '../fiscal/ar/ArcaService'
import { PadronA4Service } from '../fiscal/ar/PadronA4Service'
import { modulesInclude } from '../services/TenantConfigService'
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

export function registerArcaRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const arca = new ArcaService(prisma)
  const padron = new PadronA4Service(prisma)

  app.get('/api/arca/config', requirePermission('settings.fiscal.manage'), async (req: Request, res: Response) => {
    try {
      const status = await arca.getConfigStatus(getTenantId(req))
      res.json({ success: true, data: status })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put(
    '/api/arca/config',
    requirePermission('settings.fiscal.manage'),
    validateBody(fiscalConfigSchema),
    async (req: Request, res: Response) => {
      try {
        const result = await arca.upsertConfig(getTenantId(req), req.body as FiscalConfigInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'arca_config_upsert', 'tenant_fiscal_config', String(result.data.id))
        res.json({ success: true, data: { configured: true } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post('/api/arca/auth', requirePermission('settings.fiscal.manage'), async (req: Request, res: Response) => {
    try {
      const result = await arca.getTa(getTenantId(req))
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
    '/api/arca/cae',
    requirePermission('sales.create'),
    validateBody(caeBodySchema),
    async (req: Request, res: Response) => {
      try {
        const { facturaId } = req.body as { facturaId: number }
        const result = await arca.requestCaeForFactura(getTenantId(req), facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'arca_cae_request', 'factura', String(facturaId), {
          tipo: result.data.tipo,
          cae: result.data.cae,
        })
        res.json({ success: true, data: { cae: result.data.cae, caeVto: result.data.caeVto } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/arca/padron/:cuit',
    requirePermission('customers.manage'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const moduleEnabled = modulesInclude(authReq.tenantModules, 'billing.arca_cae')
        const result = await padron.consulta(getTenantId(req), String(req.params.cuit ?? ''), {
          moduleEnabled,
        })
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
