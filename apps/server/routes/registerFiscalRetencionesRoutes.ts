import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  fiscalRetencionesConfigBodySchema,
  regimenRetencionBodySchema,
  regimenRetencionUpdateBodySchema,
  retencionesPreviewQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type {
  FiscalRetencionesConfigInput,
  RegimenRetencionInput,
  RegimenRetencionUpdateInput,
} from '@bizcode/types'
import { FiscalRetencionesService } from '../services/FiscalRetencionesService'
import { RegimenRetencionService } from '../services/RegimenRetencionService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (value == null || String(value).trim() === '') return undefined
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

/**
 * @en Fiscal withholding/perception configuration routes (#228).
 * @es Rutas de configuración de retenciones/percepciones (#228).
 * @pt-BR Rotas de configuração de retenções/percepções (#228).
 */
export function registerFiscalRetencionesRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const regimenService = new RegimenRetencionService(prisma)
  const fiscalRetenciones = new FiscalRetencionesService(prisma)
  const retencionesModule = requireModule('finance.retenciones')

  app.get(
    '/api/fiscal/regimenes',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const activoRaw = req.query.activo
        let activo: boolean | undefined
        if (activoRaw === 'true') activo = true
        else if (activoRaw === 'false') activo = false
        const data = await regimenService.list(tenantId, activo)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fiscal/regimenes',
    retencionesModule,
    requirePermission('settings.fiscal.manage'),
    validateBody(regimenRetencionBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as RegimenRetencionInput
        const data = await regimenService.create(tenantId, body)
        await writeAudit(
          req as AuthenticatedRequest,
          'regimen_retencion_create',
          'regimen_retencion',
          String(data.id),
        )
        res.status(201).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/fiscal/regimenes/:id',
    retencionesModule,
    requirePermission('settings.fiscal.manage'),
    validateBody(regimenRetencionUpdateBodySchema),
    async (req: Request, res: Response) => {
      const id = parsePositiveIntParam(String(req.params.id))
      if (id == null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const body = req.body as RegimenRetencionUpdateInput
        const data = await regimenService.update(tenantId, id, body)
        await writeAudit(
          req as AuthenticatedRequest,
          'regimen_retencion_update',
          'regimen_retencion',
          String(data.id),
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.get(
    '/api/fiscal/config-retenciones',
    retencionesModule,
    requirePermission('settings.fiscal.manage'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await fiscalRetenciones.getConfig(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/fiscal/config-retenciones',
    retencionesModule,
    requirePermission('settings.fiscal.manage'),
    validateBody(fiscalRetencionesConfigBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as FiscalRetencionesConfigInput
        const data = await fiscalRetenciones.upsertConfig(tenantId, body)
        await writeAudit(
          req as AuthenticatedRequest,
          'fiscal_retenciones_config_update',
          'fiscal_retenciones_config',
          String(tenantId),
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fiscal/retenciones',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined
        const from = parseOptionalDate(req.query.from)
        const to = parseOptionalDate(req.query.to)
        const { total, items } = await fiscalRetenciones.listAplicadas(
          tenantId,
          { from, to, tipo },
          take,
          skip,
        )
        res.json(paginatedListJson(items, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fiscal/retenciones/preview',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const parsed = safeParseBodySchema(retencionesPreviewQuerySchema, req.query)
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await fiscalRetenciones.preview(tenantId, parsed.value)
        res.json({ success: true, data })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.get(
    '/api/fiscal/retenciones/:id/comprobante/pdf',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const id = parsePositiveIntParam(String(req.params.id))
      if (id == null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const pdfData = await fiscalRetenciones.getConstanciaPdfData(tenantId, id)
        if (pdfData == null) {
          res.status(404).json({ success: false, error: 'Retencion not found' })
          return
        }
        const { buildRetencionConstanciaPdfBuffer, retencionConstanciaPdfFilename } = await import(
          '../finance/retencionConstanciaPdf'
        )
        const buffer = await buildRetencionConstanciaPdfBuffer(pdfData)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${retencionConstanciaPdfFilename(pdfData.retencion.constanciaNum, pdfData.retencion.id)}"`,
        )
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fiscal/retenciones/export',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const formatRaw = String(req.query.format ?? 'sicore').toLowerCase()
      if (formatRaw !== 'sicore' && formatRaw !== 'sifere') {
        res.status(400).json({ success: false, error: 'format must be sicore or sifere' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const from = parseOptionalDate(req.query.from)
        const to = parseOptionalDate(req.query.to)
        const txt = await fiscalRetenciones.buildExportTxt(
          tenantId,
          formatRaw,
          from,
          to,
        )
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="retenciones-${formatRaw}.txt"`,
        )
        res.send(txt)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
