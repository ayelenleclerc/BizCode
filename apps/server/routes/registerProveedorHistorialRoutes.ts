import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { parseProveedorHistorialPeriodo } from '../lib/proveedorHistorialPeriodo'
import { ProveedorHistorialService } from '../services/ProveedorHistorialService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

/**
 * @en Supplier purchase history routes (#272).
 * @es Rutas de historial de compras de proveedor (#272).
 * @pt-BR Rotas de histórico de compras de fornecedor (#272).
 */
export function registerProveedorHistorialRoutes(app: Application, ctx: RestRouteContext): void {
  const historialService = new ProveedorHistorialService(ctx.prisma)
  const ledgerModule = requireModule('finance.ledger')

  app.get(
    '/api/proveedores/:id/historial',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const periodoDias = parseProveedorHistorialPeriodo(req.query.dias)
      if (periodoDias === null) {
        res.status(400).json({ success: false, error: 'dias must be one of: 30, 90, 180, 365' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const data = await historialService.getHistorial(tenantId, proveedorId, periodoDias)
        if (!data) {
          res.status(404).json({ success: false, error: 'Proveedor not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/proveedores/:id/articulos',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const periodoDias = parseProveedorHistorialPeriodo(req.query.dias)
      if (periodoDias === null) {
        res.status(400).json({ success: false, error: 'dias must be one of: 30, 90, 180, 365' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const data = await historialService.getArticulos(tenantId, proveedorId, periodoDias)
        if (!data) {
          res.status(404).json({ success: false, error: 'Proveedor not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
