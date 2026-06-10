import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { reciboCobroBodySchema, reciboCobroVoidBodySchema } from '../schemas/domain'
import type { ReciboCobroInput } from '../createApp.types'
import { buildReciboCobroPdfBuffer } from '../finance/reciboCobroPdf'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { reciboCobroPdfFilename } from '../services/ReciboCobroService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

/**
 * @en Customer payment receipt routes (#233).
 * @es Rutas de recibo de cobro a cliente (#233).
 * @pt-BR Rotas de recibo de cobrança de cliente (#233).
 */
export function registerReciboCobroRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { reciboCobro } = services
  const receiptsModule = requireModule('finance.receipts')

  app.get(
    '/api/clientes/:id/facturas-pendientes',
    receiptsModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await reciboCobro.listFacturasPendientes(tenantId, clienteId)
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
    '/api/clientes/:id/recibos',
    receiptsModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const { total, recibos } = await reciboCobro.list(tenantId, clienteId, take, skip)
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
    '/api/clientes/:id/recibos',
    receiptsModule,
    requirePermission('sales.create'),
    validateBody(reciboCobroBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ReciboCobroInput
        const result = await reciboCobro.create(
          tenantId,
          clienteId,
          authReq.auth.claims.userId,
          body,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recibo_cobro_create', 'recibo_cobro', String(result.data.id), {
          clienteId,
          numero: result.data.numero,
          totalCobrado: result.data.totalCobrado,
        })
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/clientes/:id/recibos/:reciboId/anular',
    receiptsModule,
    requirePermission('sales.create'),
    validateBody(reciboCobroVoidBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      const clienteId = parsePositiveIntParam(String(req.params.id))
      const reciboId = parsePositiveIntParam(String(req.params.reciboId))
      if (clienteId === null || reciboId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const { anulacionMotivo } = req.body as { anulacionMotivo: string }
        const result = await reciboCobro.voidRecibo(
          tenantId,
          clienteId,
          reciboId,
          authReq.auth.claims.userId,
          anulacionMotivo,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recibo_cobro_void', 'recibo_cobro', String(reciboId), {
          clienteId,
          numero: result.data.numero,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/clientes/:id/recibos/:reciboId/pdf',
    receiptsModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      const reciboId = parsePositiveIntParam(String(req.params.reciboId))
      if (clienteId === null || reciboId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const pdfData = await reciboCobro.getPdfData(tenantId, clienteId, reciboId)
        if (!pdfData) {
          res.status(404).json({ success: false, error: 'Recibo not found' })
          return
        }
        const buffer = await buildReciboCobroPdfBuffer(pdfData)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${reciboCobroPdfFilename(pdfData.recibo.numero)}"`,
        )
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
