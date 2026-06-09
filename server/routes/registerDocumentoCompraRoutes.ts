import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import {
  documentoCompraUploadBatch,
  documentoCompraUploadSingle,
  resolveDocumentoCompraTipoArchivo,
} from '../documentoCompraUpload'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  documentoCompraConfirmBodySchema,
  documentoCompraTemplateBodySchema,
} from '../schemas/domain'
import type { DocumentoCompraConfirmInput } from '../services/DocumentoCompraImportService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

/**
 * @en Purchase document import routes — upload, queue, templates, confirm (#277).
 * @es Rutas de importación de documentos de compra — subida, cola, plantillas, confirmación (#277).
 * @pt-BR Rotas de importação de documentos de compra — upload, fila, templates, confirmação (#277).
 */
export function registerDocumentoCompraRoutes(app: Application, ctx: RestRouteContext): void {
  const { documentoCompraImport } = ctx.services
  const ledgerModule = requireModule('finance.ledger')
  const purchasesModule = requireModule('logistics.purchases')
  const readPermission = requirePermission('reports.financial.read')
  const fiscalManagePermission = requirePermission('settings.fiscal.manage')
  const upload = documentoCompraUploadSingle()
  const uploadBatch = documentoCompraUploadBatch()

  app.post(
    '/api/documentos-compra/procesar',
    ledgerModule,
    purchasesModule,
    readPermission,
    (req, res, next) => {
      upload(req, res, (err: unknown) => {
        if (err) {
          res.status(400).json({ success: false, error: errorMessage(err) })
          return
        }
        next()
      })
    },
    async (req: Request, res: Response) => {
      try {
        const file = req.file
        if (!file?.buffer) {
          res.status(400).json({
            success: false,
            error: 'Expected multipart field "file" with a PDF or image (pdf, jpg, png, webp, heic)',
          })
          return
        }
        const tipoArchivo = resolveDocumentoCompraTipoArchivo(file.mimetype, file.originalname)
        if (!tipoArchivo) {
          res.status(400).json({ success: false, error: 'Unsupported file type' })
          return
        }
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const data = await documentoCompraImport.procesar(tenantId, authReq.auth!.claims.userId, {
          originalName: file.originalname,
          mimeType: file.mimetype,
          tipoArchivo,
          buffer: file.buffer,
        })
        await ctx.writeAudit(
          authReq,
          'documento_compra_procesar',
          'documento_compra_importado',
          String(data.id),
          { tipoArchivo, tier: data.tier },
        )
        res.status(201).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/documentos-compra/procesar-lote',
    ledgerModule,
    purchasesModule,
    readPermission,
    (req, res, next) => {
      uploadBatch(req, res, (err: unknown) => {
        if (err) {
          res.status(400).json({ success: false, error: errorMessage(err) })
          return
        }
        next()
      })
    },
    async (req: Request, res: Response) => {
      try {
        const files = req.files
        if (!Array.isArray(files) || files.length === 0) {
          res.status(400).json({
            success: false,
            error: 'Expected multipart field "files" with one or more PDF/image uploads',
          })
          return
        }
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const inputs = files
          .map((file) => {
            const tipoArchivo = resolveDocumentoCompraTipoArchivo(file.mimetype, file.originalname)
            if (!tipoArchivo || !file.buffer) return null
            return {
              originalName: file.originalname,
              mimeType: file.mimetype,
              tipoArchivo,
              buffer: file.buffer,
            }
          })
          .filter((item): item is NonNullable<typeof item> => item != null)

        if (inputs.length === 0) {
          res.status(400).json({ success: false, error: 'No supported files in batch' })
          return
        }

        const data = await documentoCompraImport.procesarLote(
          tenantId,
          authReq.auth!.claims.userId,
          inputs,
        )
        await ctx.writeAudit(
          authReq,
          'documento_compra_procesar_lote',
          'documento_compra_importado',
          String(data.length),
          { count: data.length },
        )
        res.status(201).json({ success: true, data })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('Batch limit') || msg.includes('At least one')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.get(
    '/api/documentos-compra/verificar-duplicado',
    ledgerModule,
    purchasesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const proveedorId = parsePositiveIntParam(String(req.query.proveedorId ?? ''))
        const tipo = String(req.query.tipo ?? '').trim()
        const prefijo = String(req.query.prefijo ?? '').trim()
        const numeroRaw = Number.parseInt(String(req.query.numero ?? ''), 10)
        if (
          proveedorId == null ||
          tipo.length === 0 ||
          prefijo.length === 0 ||
          !Number.isInteger(numeroRaw) ||
          numeroRaw < 1
        ) {
          res.status(400).json({
            success: false,
            error: 'proveedorId, tipo, prefijo and numero (positive integer) are required',
          })
          return
        }
        const data = await documentoCompraImport.verificarDuplicado(
          tenantId,
          proveedorId,
          tipo,
          prefijo,
          numeroRaw,
        )
        res.status(200).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/documentos-compra/cola',
    ledgerModule,
    purchasesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const data = await documentoCompraImport.getColaEstado(
          tenantId,
          authReq.auth!.claims.userId,
        )
        res.status(200).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/documentos-compra/templates',
    ledgerModule,
    purchasesModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = documentoCompraImport.listTemplates(tenantId)
        res.status(200).json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/documentos-compra/templates',
    ledgerModule,
    purchasesModule,
    fiscalManagePermission,
    validateBody(documentoCompraTemplateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const body = req.body as { content: string }
        const template = documentoCompraImport.saveTemplate(tenantId, body.content)
        await ctx.writeAudit(
          authReq,
          'documento_compra_template_save',
          'documento_compra_template',
          template.issuer,
          { issuer: template.issuer },
        )
        res.status(201).json({ success: true, data: template })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('Template') || msg.includes('required')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.post(
    '/api/documentos-compra/confirmar',
    ledgerModule,
    purchasesModule,
    readPermission,
    validateBody(documentoCompraConfirmBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const authReq = req as AuthenticatedRequest
        const body = req.body as DocumentoCompraConfirmInput & { documentoId: number }
        const { documentoId, items, ...comprobanteInput } = body
        const result = await documentoCompraImport.confirmar(
          tenantId,
          authReq.auth!.claims.userId,
          documentoId,
          { ...comprobanteInput, items },
        )
        await ctx.writeAudit(
          authReq,
          'documento_compra_confirmar',
          'documento_compra_importado',
          String(documentoId),
          { comprobanteCompraId: result.comprobanteCompra.id },
        )
        res.status(201).json({
          success: true,
          data: {
            documento: result.documento,
            comprobanteCompra: result.comprobanteCompra,
          },
        })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        if (msg.includes('already exists') || msg.includes('Conflict')) {
          res.status(409).json({ success: false, error: msg })
          return
        }
        if (msg.includes('Invalid') || msg.includes('pending review')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.get(
    '/api/documentos-compra/:id/original',
    ledgerModule,
    purchasesModule,
    readPermission,
    async (req: Request, res: Response) => {
      const documentoId = parsePositiveIntParam(String(req.params.id))
      if (documentoId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const file = await documentoCompraImport.readOriginalFile(tenantId, documentoId)
        res.setHeader('Content-Type', file.mime)
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`)
        res.send(file.buffer)
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
}
