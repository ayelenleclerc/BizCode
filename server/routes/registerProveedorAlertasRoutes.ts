import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  alertaProveedorConfigBodySchema,
  facturasPendientesQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type { AlertaProveedorConfigInput } from '../createApp.types'
import { ProveedorAlertasService } from '../services/ProveedorAlertasService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Supplier payable due-date alerts (#275).
 * @es Alertas de vencimiento de facturas a pagar (#275).
 * @pt-BR Alertas de vencimento de faturas a pagar (#275).
 */
export function registerProveedorAlertasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const alertas = new ProveedorAlertasService(prisma)
  const ledgerModule = requireModule('finance.ledger')

  app.get(
    '/api/proveedores/facturas-pendientes',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsed = safeParseBodySchema(facturasPendientesQuerySchema, req.query)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const data = await alertas.listFacturasPendientes(tenantId, {
          estado: parsed.value.estado,
          proveedorId: parsed.value.proveedorId,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/configuracion/alertas-proveedores',
    ledgerModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await alertas.getConfig(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/configuracion/alertas-proveedores',
    ledgerModule,
    requirePermission('suppliers.manage'),
    validateBody(alertaProveedorConfigBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as AlertaProveedorConfigInput
        const data = await alertas.upsertConfig(tenantId, body)
        await writeAudit(
          req as AuthenticatedRequest,
          'alerta_proveedor_config_update',
          'alerta_proveedor_config',
          String(tenantId),
        )
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
