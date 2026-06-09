import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { reciboPagoBodySchema } from '../schemas/domain'
import type { ReciboPagoInput } from '../createApp.types'
import { buildReciboPagoPdfBuffer } from '../finance/reciboPagoPdf'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { reciboPagoPdfFilename } from '../services/ReciboPagoService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

/**
 * @en Supplier payment receipt routes (#271).
 * @es Rutas de recibo de pago a proveedor (#271).
 * @pt-BR Rotas de recibo de pagamento a fornecedor (#271).
 */
export function registerReciboPagoRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { reciboPago } = services
  const receiptsModule = requireModule('finance.receipts')

  app.get(
    '/api/proveedores/:id/pagos/comprobantes-pendientes',
    receiptsModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await reciboPago.listComprobantesPendientes(tenantId, proveedorId)
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
    '/api/proveedores/:id/pagos',
    receiptsModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const { total, recibos } = await reciboPago.list(tenantId, proveedorId, take, skip)
        res.json(paginatedListJson(recibos, total, take, skip))
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

  app.post(
    '/api/proveedores/:id/pagos',
    receiptsModule,
    requirePermission('suppliers.manage'),
    validateBody(reciboPagoBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ReciboPagoInput
        const result = await reciboPago.create(
          tenantId,
          proveedorId,
          authReq.auth.claims.userId,
          body,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recibo_pago_create', 'recibo_pago', String(result.data.id), {
          proveedorId,
          numero: result.data.numero,
          total: result.data.total,
        })
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/proveedores/:id/pagos/:reciboId/anular',
    receiptsModule,
    requirePermission('suppliers.manage'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      const reciboId = parsePositiveIntParam(String(req.params.reciboId))
      if (proveedorId === null || reciboId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const result = await reciboPago.voidRecibo(
          tenantId,
          proveedorId,
          reciboId,
          authReq.auth.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recibo_pago_void', 'recibo_pago', String(reciboId), {
          proveedorId,
          numero: result.data.numero,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/proveedores/:id/pagos/:reciboId/retenciones',
    receiptsModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      const reciboId = parsePositiveIntParam(String(req.params.reciboId))
      if (proveedorId === null || reciboId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await reciboPago.listRetencionesByRecibo(tenantId, proveedorId, reciboId)
        if (data == null) {
          res.status(404).json({ success: false, error: 'Recibo not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/proveedores/:id/pagos/:reciboId/pdf',
    receiptsModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      const reciboId = parsePositiveIntParam(String(req.params.reciboId))
      if (proveedorId === null || reciboId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const pdfData = await reciboPago.getPdfData(tenantId, proveedorId, reciboId)
        if (!pdfData) {
          res.status(404).json({ success: false, error: 'Recibo not found' })
          return
        }
        const buffer = await buildReciboPagoPdfBuffer(pdfData)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${reciboPagoPdfFilename(pdfData.recibo.numero)}"`,
        )
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
