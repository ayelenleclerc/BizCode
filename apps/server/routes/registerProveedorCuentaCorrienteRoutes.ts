import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  movimientoProveedorCCTipoSchema,
  proveedorCuentaCorrienteAjusteBodySchema,
} from '../schemas/domain'
import type { MovimientoProveedorCCTipo } from '../services/ProveedorCuentaCorrienteService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseIsoDateQuery(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const d = new Date(value.trim())
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

/**
 * @en Supplier accounts-payable ledger routes (#270).
 * @es Rutas de cuenta corriente de proveedor (#270).
 * @pt-BR Rotas de conta corrente de fornecedor (#270).
 */
export function registerProveedorCuentaCorrienteRoutes(
  app: Application,
  ctx: RestRouteContext,
): void {
  const { services, writeAudit } = ctx
  const { proveedorCuentaCorriente } = services
  const ledgerModule = requireModule('finance.ledger')

  app.get(
    '/api/proveedores/:id/cuenta-corriente',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const tipoParam = req.query.tipo
      let tipo: MovimientoProveedorCCTipo | undefined
      if (typeof tipoParam === 'string' && tipoParam.trim() !== '') {
        const parsed = movimientoProveedorCCTipoSchema.safeParse(tipoParam)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid tipo filter' })
          return
        }
        tipo = parsed.data
      }

      try {
        const tenantId = getTenantId(req)
        const data = await proveedorCuentaCorriente.getStatement(tenantId, proveedorId, {
          tipo,
          from: parseIsoDateQuery(req.query.from),
          to: parseIsoDateQuery(req.query.to),
        })
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
    '/api/proveedores/:id/cuenta-corriente/saldo',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const data = await proveedorCuentaCorriente.getSaldo(tenantId, proveedorId)
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

  app.post(
    '/api/proveedores/:id/cuenta-corriente/ajuste',
    ledgerModule,
    requirePermission('suppliers.manage'),
    validateBody(proveedorCuentaCorrienteAjusteBodySchema),
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

      const body = req.body as { monto: number; motivo: string }

      try {
        const tenantId = getTenantId(req)
        const movimiento = await proveedorCuentaCorriente.createAjuste(
          tenantId,
          proveedorId,
          authReq.auth.claims.userId,
          body.monto,
          body.motivo,
        )
        await writeAudit(
          authReq,
          'proveedor_cc_ajuste',
          'proveedor_cuenta_corriente',
          String(movimiento.id),
          { proveedorId, monto: body.monto, motivo: body.motivo },
        )
        res.status(201).json({ success: true, data: movimiento })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        if (msg.includes('required') || msg.includes('must be')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )
}
