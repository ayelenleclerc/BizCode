/**
 * @en Generic multi-organism fiscal e-invoicing routes (#378, ADR-0018): provider
 *   config/capabilities and document authorization. `/api/arca/*` (registerArcaRoutes.ts)
 *   keeps working as a compat alias that delegates to the same services.
 * @es Rutas genéricas de facturación electrónica multi-organismo (#378, ADR-0018):
 *   config/capacidades de proveedor y autorización de documentos. `/api/arca/*`
 *   (registerArcaRoutes.ts) sigue funcionando como alias de compatibilidad que delega
 *   en los mismos servicios.
 * @pt-BR Rotas genéricas de nota fiscal eletrônica multi-organismo (#378, ADR-0018):
 *   config/capacidades de provedor e autorização de documentos. `/api/arca/*`
 *   (registerArcaRoutes.ts) continua funcionando como alias de compatibilidade que
 *   delega para os mesmos serviços.
 */

import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { fiscalMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { FiscalProviderConfigService } from '../fiscal/FiscalProviderConfigService'
import { FiscalDocumentService } from '../fiscal/FiscalDocumentService'
import { FISCAL_PROVIDER_CODES } from '../fiscal/types'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const providerConfigBodySchema = z.object({
  provider: z.enum(FISCAL_PROVIDER_CODES).default('arca_wsfe'),
  cuit: z.string().min(11).max(14).optional(),
  certificate: z.string().min(1).optional(),
  privateKey: z.string().min(1).optional(),
  ambiente: z.enum(['homologacion', 'produccion']).optional(),
})

const validateProviderBodySchema = z.object({
  provider: z.enum(FISCAL_PROVIDER_CODES),
})

const facturaIdParamSchema = z.coerce.number().int().min(1)

export function registerFiscalRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const providerConfigService = new FiscalProviderConfigService(prisma)
  const documentService = new FiscalDocumentService(prisma)

  app.get(
    '/api/fiscal/providers/config',
    requirePermission('settings.fiscal.manage'),
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
    '/api/fiscal/providers/config',
    requirePermission('settings.fiscal.manage'),
    validateBody(providerConfigBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as z.infer<typeof providerConfigBodySchema>
        if (body.provider !== 'arca_wsfe') {
          res.status(501).json({ success: false, error: 'FISCAL_PROVIDER_NOT_IMPLEMENTED' })
          return
        }
        if (!body.cuit || !body.certificate || !body.privateKey) {
          res.status(400).json({ success: false, error: 'CUIT_CERTIFICATE_PRIVATEKEY_REQUIRED' })
          return
        }
        const result = await providerConfigService.upsertArcaConfig(getTenantId(req), {
          cuit: body.cuit,
          certificate: body.certificate,
          privateKey: body.privateKey,
          ambiente: body.ambiente,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'fiscal_provider_config_upsert',
          'fiscal_provider_config',
          String(result.data.id),
          { provider: body.provider },
        )
        res.json({ success: true, data: { configured: true } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fiscal/providers/validate',
    requirePermission('settings.fiscal.manage'),
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
    '/api/fiscal/providers/capabilities',
    requirePermission('settings.fiscal.manage'),
    (_req: Request, res: Response) => {
      try {
        res.json({ success: true, data: providerConfigService.getCapabilities() })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fiscal/documents/:facturaId/authorize',
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const parsedId = facturaIdParamSchema.safeParse(req.params.facturaId)
        if (!parsedId.success) {
          res.status(400).json({ success: false, error: 'INVALID_FACTURA_ID' })
          return
        }
        const tenantId = getTenantId(req)
        const result = await documentService.authorizeInvoice(tenantId, parsedId.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'fiscal_document_authorize',
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
}
