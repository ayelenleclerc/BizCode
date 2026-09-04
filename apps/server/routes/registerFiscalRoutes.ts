/**
 * @en Generic multi-organism fiscal e-invoicing routes (#378, ADR-0018): provider
 *   config/capabilities, document authorization/cancel, and SAT catalog search (#210).
 *   `/api/arca/*` (registerArcaRoutes.ts) keeps working as a compat alias.
 * @es Rutas genéricas de facturación electrónica multi-organismo (#378, ADR-0018):
 *   config/capacidades, autorización/cancelación y búsqueda de catálogo SAT (#210).
 * @pt-BR Rotas genéricas de nota fiscal eletrônica multi-organismo (#378, ADR-0018):
 *   config/capacidades, autorização/cancelamento e busca de catálogo SAT (#210).
 */

import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { fiscalMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { FiscalProviderConfigService } from '../fiscal/FiscalProviderConfigService'
import { FiscalDocumentService } from '../fiscal/FiscalDocumentService'
import { SatCatalogService } from '../fiscal/mx/SatCatalogService'
import { SAT_CATALOG_NAMES, SAT_CFDI_CANCEL_REASON_CODES } from '../fiscal/mx/satCatalogFixtures'
import { FISCAL_PROVIDER_CODES } from '../fiscal/types'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const providerConfigBodySchema = z.object({
  provider: z.enum(FISCAL_PROVIDER_CODES).default('arca_wsfe'),
  cuit: z.string().min(11).max(14).optional(),
  certificate: z.string().min(1).optional(),
  privateKey: z.string().min(1).optional(),
  ambiente: z.enum(['homologacion', 'produccion']).optional(),
  rfc: z.string().min(12).max(13).optional(),
  legalName: z.string().max(160).optional(),
})

const validateProviderBodySchema = z.object({
  provider: z.enum(FISCAL_PROVIDER_CODES),
})

const facturaIdParamSchema = z.coerce.number().int().min(1)

const cancelDocumentBodySchema = z.object({
  documentType: z.enum(['invoice', 'credit_note']).default('invoice'),
  reasonCode: z.enum(SAT_CFDI_CANCEL_REASON_CODES),
})

export function registerFiscalRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const providerConfigService = new FiscalProviderConfigService(prisma)
  const documentService = new FiscalDocumentService(prisma)
  const satCatalogService = new SatCatalogService(prisma)

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
        if (body.provider === 'arca_wsfe') {
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
          return
        }

        if (body.provider === 'mexico_sat_pac') {
          if (!body.rfc) {
            res.status(400).json({ success: false, error: 'RFC_REQUIRED' })
            return
          }
          const result = await providerConfigService.upsertMexicoSatConfig(getTenantId(req), {
            rfc: body.rfc,
            ambiente: body.ambiente,
            legalName: body.legalName,
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
          return
        }

        res.status(501).json({ success: false, error: 'FISCAL_PROVIDER_NOT_IMPLEMENTED' })
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

  app.get(
    '/api/fiscal/sat/catalog',
    requirePermission('products.read'),
    async (req: Request, res: Response) => {
      try {
        const catalog =
          typeof req.query.catalog === 'string' && req.query.catalog.length > 0
            ? req.query.catalog
            : undefined
        const q = typeof req.query.q === 'string' ? req.query.q : undefined
        const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined
        if (catalog && !(SAT_CATALOG_NAMES as readonly string[]).includes(catalog)) {
          res.status(400).json({ success: false, error: 'INVALID_SAT_CATALOG' })
          return
        }
        const result = await satCatalogService.search({
          catalog,
          q,
          limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
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

  app.post(
    '/api/fiscal/documents/:documentId/cancel',
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    validateBody(cancelDocumentBodySchema),
    async (req: Request, res: Response) => {
      try {
        const parsedId = facturaIdParamSchema.safeParse(req.params.documentId)
        if (!parsedId.success) {
          res.status(400).json({ success: false, error: 'INVALID_DOCUMENT_ID' })
          return
        }
        const body = req.body as z.infer<typeof cancelDocumentBodySchema>
        const tenantId = getTenantId(req)
        const result = await documentService.cancelDocument(
          tenantId,
          body.documentType,
          parsedId.data,
          body.reasonCode,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'fiscal_document_cancel',
          body.documentType === 'invoice' ? 'factura' : 'nota_credito',
          String(parsedId.data),
          { provider: result.data.provider, status: result.data.status, reasonCode: body.reasonCode },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
