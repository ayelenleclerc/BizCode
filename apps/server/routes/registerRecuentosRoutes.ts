import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { buildRecuentoPdfBuffer, recuentoPdfFilename } from '../inventory/recuentoPdf'
import { recuentoItemsBodySchema } from '../schemas/domain'
import type { RecuentoItemLineInput } from '@bizcode/types'
import type { RecuentoService } from '../services/RecuentoService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Physical inventory count REST routes (`/api/recuentos`) — issue #136.
 */
export function registerRecuentosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const recuentos: RecuentoService = services.recuentos

  app.get(
    '/api/recuentos',
    requirePermission('inventory.count'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const { total, recuentos: rows } = await recuentos.list(tenantId, take, skip)
        res.json(paginatedListJson(rows, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/recuentos/:id',
    requirePermission('inventory.count'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await recuentos.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'Recuento not found' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/recuentos',
    requirePermission('inventory.count'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const result = await recuentos.start(tenantId, authReq.auth!.claims.userId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recuento_start', 'recuento', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/recuentos/:id/items',
    requirePermission('inventory.count'),
    validateBody(recuentoItemsBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const body = req.body as { lines: RecuentoItemLineInput[] }
        const result = await recuentos.updateItems(tenantId, id, body.lines)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recuento_update_items', 'recuento', String(id), {
          lineCount: body.lines.length,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/recuentos/:id/close',
    requirePermission('inventory.count'),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await recuentos.close(tenantId, id, authReq.auth!.claims.userId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'recuento_close', 'recuento', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        if (errorMessage(err) === 'INSUFFICIENT_STOCK') {
          res.status(422).json({ success: false, error: 'INSUFFICIENT_STOCK' })
          return
        }
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/recuentos/:id/pdf',
    requirePermission('inventory.count'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await recuentos.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'Recuento not found' })
          return
        }
        if (row.estado !== 'closed') {
          res.status(422).json({ success: false, error: 'RECUENTO_NOT_CLOSED' })
          return
        }
        const buffer = await buildRecuentoPdfBuffer(row)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${recuentoPdfFilename(id)}"`)
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
