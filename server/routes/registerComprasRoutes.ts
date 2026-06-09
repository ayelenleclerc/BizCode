import type { Application, NextFunction, Request, Response } from 'express'
import { hasPermission, type Permission } from '../../src/lib/rbac'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import {
  buildOrdenCompraPdfBuffer,
  ordenCompraPdfFilename,
} from '../logistics/ordenCompraPdf'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  ordenCompraCreateBodySchema,
  ordenCompraReceiveBodySchema,
  ordenCompraUpdateBodySchema,
} from '../schemas/domain'
import type {
  OrdenCompraCreateInput,
  OrdenCompraEstado,
  OrdenCompraUpdateInput,
} from '../createApp.types'
import { ORDEN_COMPRA_ESTADOS, type CompraService } from '../services/CompraService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parseOptionalEstado(value: unknown): OrdenCompraEstado | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  const trimmed = value.trim() as OrdenCompraEstado
  return ORDEN_COMPRA_ESTADOS.includes(trimmed) ? trimmed : undefined
}

function requirePermissions(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    for (const permission of permissions) {
      if (!hasPermission(authReq.auth.claims.role, permission)) {
        res.status(403).json({ success: false, error: 'Forbidden' })
        return
      }
    }
    next()
  }
}

/**
 * @en Purchase order REST routes (`/api/compras`) — issue #135.
 */
export function registerComprasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const compras: CompraService = services.compras
  const purchasesModule = requireModule('logistics.purchases')

  app.get(
    '/api/compras',
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const estadoRaw = req.query.estado
        const estado = parseOptionalEstado(estadoRaw)
        if (typeof estadoRaw === 'string' && estadoRaw.trim().length > 0 && estado === undefined) {
          res.status(400).json({ success: false, error: 'estado must be a valid purchase order status' })
          return
        }
        let proveedorId: number | undefined
        const proveedorRaw = req.query.proveedorId
        if (typeof proveedorRaw === 'string' && proveedorRaw.trim().length > 0) {
          proveedorId = Number.parseInt(proveedorRaw, 10)
          if (!Number.isFinite(proveedorId) || proveedorId < 1) {
            res.status(400).json({ success: false, error: 'proveedorId must be a positive integer' })
            return
          }
        }
        const { take, skip } = parseListPagination(req)
        const { total, ordenes } = await compras.list(tenantId, { estado, proveedorId }, take, skip)
        res.json(paginatedListJson(ordenes, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/compras/:id/pdf',
    purchasesModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await compras.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'OrdenCompra not found' })
          return
        }
        const proveedor = await prisma.proveedor.findFirst({
          where: { id: row.proveedorId, tenantId },
          select: { rsocial: true, codigo: true, cuit: true },
        })
        if (!proveedor) {
          res.status(404).json({ success: false, error: 'Proveedor not found' })
          return
        }
        const buffer = await buildOrdenCompraPdfBuffer({
          orden: row,
          proveedor: {
            rsocial: proveedor.rsocial,
            codigo: proveedor.codigo,
            cuit: proveedor.cuit,
          },
        })
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(ordenCompraPdfFilename(id))}"`,
        )
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/compras/:id',
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await compras.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'OrdenCompra not found' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/compras',
    requirePermission('suppliers.manage'),
    validateBody(ordenCompraCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as OrdenCompraCreateInput
        const result = await compras.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'orden_compra_create',
          'orden_compra',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/compras/:id',
    requirePermission('suppliers.manage'),
    validateBody(ordenCompraUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const body = req.body as OrdenCompraUpdateInput
        const result = await compras.update(tenantId, id, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'orden_compra_update',
          'orden_compra',
          String(id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/compras/:id/send',
    requirePermission('suppliers.manage'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await compras.send(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'orden_compra_send',
          'orden_compra',
          String(id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/compras/:id/cancel',
    requirePermission('suppliers.manage'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await compras.cancel(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'orden_compra_cancel',
          'orden_compra',
          String(id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/compras/:id/receive',
    requirePermissions('suppliers.manage', 'inventory.adjust'),
    validateBody(ordenCompraReceiveBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = Number.parseInt(String(req.params.id), 10)
        if (!Number.isFinite(id) || id < 1) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const body = req.body as { lines: { itemId: number; cantidad: number }[] }
        const result = await compras.receive(tenantId, id, authReq.auth!.claims.userId, body.lines)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'orden_compra_receive', 'orden_compra', String(id), {
          lineCount: body.lines.length,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
