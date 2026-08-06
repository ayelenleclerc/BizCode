import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { fiscalMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import type { FiscalConfigInput } from '../fiscal/ar/ArcaService'
import { ArcaFiscalAdapter } from '../fiscal/arca/ArcaFiscalAdapter'
import { FiscalProviderConfigService } from '../fiscal/FiscalProviderConfigService'
import { FiscalDocumentService } from '../fiscal/FiscalDocumentService'
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

/**
 * @en `/api/arca/*` compat routes (#378, ADR-0018): same paths and response shapes as
 *   before, now delegating to the multi-organism fiscal services so ARCA behaves as one
 *   provider adapter instead of a parallel implementation. `padron` stays AR-specific
 *   (unrelated to the generic fiscal contract, per the #378 inventory).
 * @es Rutas de compatibilidad `/api/arca/*` (#378, ADR-0018): mismos paths y formas de
 *   respuesta que antes, ahora delegando en los servicios fiscales multi-organismo para
 *   que ARCA se comporte como un adapter más en vez de una implementación paralela.
 *   `padron` sigue siendo específico de AR (no forma parte del contrato fiscal genérico,
 *   según el inventario #378).
 * @pt-BR Rotas de compatibilidade `/api/arca/*` (#378, ADR-0018): mesmos paths e formatos
 *   de resposta de antes, agora delegando nos serviços fiscais multi-organismo para que
 *   ARCA se comporte como um adapter em vez de uma implementação paralela. `padron`
 *   continua específico de AR (não faz parte do contrato fiscal genérico, conforme o
 *   inventário #378).
 */
export function registerArcaRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const providerConfigService = new FiscalProviderConfigService(prisma)
  const arcaAdapter = new ArcaFiscalAdapter(prisma)
  const documentService = new FiscalDocumentService(prisma)
  const padron = new PadronA4Service(prisma)

  app.get('/api/arca/config', requirePermission('settings.fiscal.manage'), async (req: Request, res: Response) => {
    try {
      const status = await providerConfigService.getArcaConfigStatus(getTenantId(req))
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
        const result = await providerConfigService.upsertArcaConfig(getTenantId(req), req.body as FiscalConfigInput)
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

  app.post(
    '/api/arca/auth',
    fiscalMutationHttpRateLimiter,
    requirePermission('settings.fiscal.manage'),
    async (req: Request, res: Response) => {
      try {
        const result = await arcaAdapter.authenticate(getTenantId(req))
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
    },
  )

  app.post(
    '/api/arca/cae',
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    validateBody(caeBodySchema),
    async (req: Request, res: Response) => {
      try {
        const { facturaId } = req.body as { facturaId: number }
        const tenantId = getTenantId(req)
        const result = await documentService.authorizeInvoice(tenantId, facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        const factura = await prisma.factura.findFirst({
          where: { id: facturaId, tenantId },
          select: { tipo: true },
        })
        await writeAudit(req as AuthenticatedRequest, 'arca_cae_request', 'factura', String(facturaId), {
          tipo: factura?.tipo,
          cae: result.data.authorizationCode,
        })
        res.json({
          success: true,
          data: { cae: result.data.authorizationCode, caeVto: result.data.authorizationExpiresAt },
        })
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
