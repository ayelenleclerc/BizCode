import type { Application, Request, Response } from 'express'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { sellerPoliciesPatchBodySchema } from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'
import { STOCK_MULTIPLE_MAX_IDS } from '../services/SellerAlertService'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseIdsQuery(raw: unknown): { ok: true; ids: number[] } | { ok: false; error: string } {
  if (raw == null || raw === '') {
    return { ok: true, ids: [] }
  }
  if (typeof raw !== 'string') {
    return { ok: false, error: 'ids must be a comma-separated list of positive integers' }
  }
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  if (parts.length > STOCK_MULTIPLE_MAX_IDS) {
    return { ok: false, error: `ids exceeds max of ${STOCK_MULTIPLE_MAX_IDS}` }
  }
  const ids: number[] = []
  for (const part of parts) {
    const n = Number.parseInt(part, 10)
    if (!Number.isInteger(n) || n < 1 || String(n) !== part) {
      return { ok: false, error: 'ids must be a comma-separated list of positive integers' }
    }
    ids.push(n)
  }
  return { ok: true, ids }
}

/**
 * @en Seller credit / stock / policy alert routes (#256).
 * @es Rutas de alerta de crédito / stock / políticas Seller (#256).
 * @pt-BR Rotas de alerta de crédito / estoque / políticas Seller (#256).
 */
export function registerSellerAlertRoutes(app: Application, ctx: RestRouteContext): void {
  const { services } = ctx
  const { sellerAlert } = services

  app.get(
    '/api/clientes/:id/estado-credito',
    requireAnyPermission('orders.create', 'customers.read', 'customers.manage'),
    async (req: Request, res: Response) => {
      try {
        const clienteId = parsePositiveIntParam(String(req.params.id))
        if (clienteId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const tenantId = getTenantId(req)
        const data = await sellerAlert.getEstadoCredito(tenantId, clienteId)
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/stock-multiple',
    requireAnyPermission('orders.create', 'products.read'),
    async (req: Request, res: Response) => {
      try {
        const parsed = parseIdsQuery(req.query.ids)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const tenantId = getTenantId(req)
        const data = await sellerAlert.getStockMultiple(tenantId, parsed.ids)
        res.json({ success: true, data })
      } catch (err: unknown) {
        const status =
          typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
            ? (err as { status: number }).status
            : 500
        res.status(status).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/tenant-config/seller-policies',
    requirePermission('orders.create'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await sellerAlert.getSellerPolicies(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/tenant-config/seller-policies',
    requireAnyPermission('settings.business.manage', 'users.manage'),
    validateBody(sellerPoliciesPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const auth = req as AuthenticatedRequest
        const changedById = auth.auth?.claims.userId
        if (changedById == null || !Number.isInteger(changedById) || changedById < 1) {
          res.status(401).json({ success: false, error: 'Authentication required' })
          return
        }
        const data = await sellerAlert.patchSellerPolicies(tenantId, req.body, changedById)
        res.json({ success: true, data })
      } catch (err: unknown) {
        const status =
          typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
            ? (err as { status: number }).status
            : 500
        res.status(status).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
