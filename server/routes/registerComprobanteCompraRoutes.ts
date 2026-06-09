import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { comprobanteCompraBodySchema } from '../schemas/domain'
import { ProveedorAlertasService } from '../services/ProveedorAlertasService'
import type { ComprobanteCompraCreateInput } from '../services/ComprobanteCompraService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Supplier purchase fiscal vouchers (#306).
 * @es Comprobantes fiscales de compra a proveedor (#306).
 * @pt-BR Comprovantes fiscais de compra de fornecedor (#306).
 */
export function registerComprobanteCompraRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { comprobanteCompra } = services
  const alertas = new ProveedorAlertasService(prisma)
  const ledgerModule = requireModule('finance.ledger')

  app.post(
    '/api/comprobantes-compra',
    ledgerModule,
    requirePermission('reports.financial.read'),
    validateBody(comprobanteCompraBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ComprobanteCompraCreateInput
        const authReq = req as AuthenticatedRequest
        const created = await comprobanteCompra.create(
          tenantId,
          body,
          authReq.auth!.claims.userId,
        )
        alertas
          .notifyCreditLimitIfExceeded(tenantId, created.proveedorId)
          .catch(() => { /* notification failure must not block registration */ })

        await writeAudit(
          req as AuthenticatedRequest,
          'comprobante_compra_create',
          'comprobante_compra',
          String(created.id),
        )
        res.status(201).json({ success: true, data: created })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        if (msg.includes('already exists') || msg.includes('Conflict')) {
          res.status(409).json({ success: false, error: msg })
          return
        }
        if (msg.includes('Invalid')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )
}
