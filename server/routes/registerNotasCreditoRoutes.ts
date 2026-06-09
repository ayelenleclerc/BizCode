import type { Application, Request, Response } from 'express'
import { requireAnyPermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import {
  notasCreditoListQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Credit note REST routes (#146).
 * @es Rutas REST de notas de crédito (#146).
 * @pt-BR Rotas REST de notas de crédito (#146).
 */
export function registerNotasCreditoRoutes(app: Application, ctx: RestRouteContext): void {
  const { services } = ctx
  const { notaCredito } = services
  const creditNotesModule = requireModule('billing.credit_notes')

  app.get(
    '/api/notas-credito',
    creditNotesModule,
    requireAnyPermission('reports.financial.read', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsed = safeParseBodySchema(notasCreditoListQuerySchema, req.query)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const { take, skip } = parseListPagination(req)
        const { total, rows } = await notaCredito.list(tenantId, parsed.value, take, skip)
        res.json(paginatedListJson(rows, total, take, skip))
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg === 'INVALID_DATE_RANGE') {
          res.status(400).json({ success: false, error: 'Invalid from/to date range' })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.get(
    '/api/notas-credito/:id',
    creditNotesModule,
    requireAnyPermission('reports.financial.read', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await notaCredito.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'Not found' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
