import type { Application, Request, Response } from 'express'
import { hasPermission } from '@bizcode/types'
import type { CobroInput } from '@bizcode/types'
import {
  getRequestedChannel,
  requireAnyPermission,
  requirePermission,
  type AuthenticatedRequest,
} from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { cobroBodySchema } from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, facturaFechaToPrismaDate, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseOptionalDateQuery(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined
  }
  return facturaFechaToPrismaDate(value.trim())
}

/**
 * @en Customer payment REST routes (`/api/cobros`), including App Driver scoped POST (#162).
 * @es Rutas REST de cobros de clientes (`/api/cobros`), incluido POST acotado App Driver (#162).
 * @pt-BR Rotas REST de recebimentos de clientes (`/api/cobros`), incluindo POST restrito App Driver (#162).
 */
export function registerCobrosRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { cobro, repartos } = services

  app.get('/api/cobros', requirePermission('reports.operational.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const clienteIdRaw = req.query.clienteId
      const clienteId =
        typeof clienteIdRaw === 'string' && clienteIdRaw.trim().length > 0
          ? Number.parseInt(clienteIdRaw, 10)
          : undefined
      if (clienteId !== undefined && (!Number.isFinite(clienteId) || clienteId < 1)) {
        res.status(400).json({ success: false, error: 'clienteId must be a positive integer' })
        return
      }

      const desde = parseOptionalDateQuery(req.query.desde)
      const hastaRaw = req.query.hasta
      let hasta: Date | undefined
      if (typeof hastaRaw === 'string' && hastaRaw.trim().length > 0) {
        hasta = facturaFechaToPrismaDate(hastaRaw.trim())
        hasta.setHours(23, 59, 59, 999)
      }

      const { take, skip } = parseListPagination(req)
      const { total, cobros } = await cobro.list(tenantId, { clienteId, desde, hasta }, take, skip)
      res.json(paginatedListJson(cobros, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get(
    '/api/cobros/transfer-info',
    requirePermission('orders.deliver.confirm'),
    async (req: Request, res: Response) => {
      if (getRequestedChannel(req) !== 'field') {
        res.status(403).json({ success: false, error: 'FIELD_CHANNEL_REQUIRED' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const cuenta = await prisma.cuentaBancaria.findFirst({
          where: { tenantId, activo: true },
          orderBy: { id: 'asc' },
          select: { banco: true, cbu: true, alias: true },
        })
        res.json({
          success: true,
          data: cuenta
            ? { banco: cuenta.banco, cbu: cuenta.cbu, alias: cuenta.alias ?? null }
            : null,
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get('/api/cobros/:id', requirePermission('reports.operational.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const id = Number.parseInt(String(req.params.id), 10)
      if (!Number.isFinite(id) || id < 1) {
        res.status(400).json({ success: false, error: 'Invalid cobro id' })
        return
      }
      const data = await cobro.getById(tenantId, id)
      if (!data) {
        res.status(404).json({ success: false, error: 'Cobro not found' })
        return
      }
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/cobros',
    requireAnyPermission('sales.create', 'orders.deliver.confirm'),
    validateBody(cobroBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const parsedValue = req.body as CobroInput
        const role = authReq.auth.claims.role
        if (!hasPermission(role, 'sales.create')) {
          if (getRequestedChannel(req) !== 'field') {
            res.status(403).json({ success: false, error: 'FIELD_CHANNEL_REQUIRED' })
            return
          }
          if (parsedValue.retenciones != null && parsedValue.retenciones.length > 0) {
            res.status(422).json({ success: false, error: 'DRIVER_RETENCIONES_NOT_ALLOWED' })
            return
          }
          const onMine = await repartos.clienteOnMine(
            tenantId,
            authReq.auth.claims.userId,
            parsedValue.clienteId,
            new Date(),
          )
          if (!onMine) {
            res.status(422).json({ success: false, error: 'CLIENTE_NOT_ON_ROUTE' })
            return
          }
        }
        const result = await cobro.create(tenantId, authReq.auth.claims.userId, parsedValue)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }

        const { cobro: created, updatedCliente, scoreChange, retenciones, montoBruto } = result.data
        await writeAudit(req as AuthenticatedRequest, 'cobro_create', 'cobro', String(created.id), {
          scoreBefore: scoreChange.scoreBefore,
          scoreAfter: scoreChange.scoreAfter,
          delta: scoreChange.delta,
        })
        res.json({
          success: true,
          data: { cobro: created, updatedCliente, retenciones, montoBruto },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  const retencionesModule = requireModule('finance.retenciones')

  app.get(
    '/api/cobros/:id/retenciones',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const cobroId = parsePositiveIntParam(String(req.params.id))
      if (cobroId == null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await cobro.listRetencionesByCobro(tenantId, cobroId)
        if (data == null) {
          res.status(404).json({ success: false, error: 'Cobro not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
