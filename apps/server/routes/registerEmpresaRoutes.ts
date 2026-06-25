import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { empresaUpdateBodySchema } from '../schemas/domain'
import type { EmpresaInput } from '@bizcode/types'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Company settings REST routes (`GET/PUT /api/empresa`).
 * @es Rutas REST de configuración de empresa (`GET/PUT /api/empresa`).
 * @pt-BR Rotas REST de configuração da empresa (`GET/PUT /api/empresa`).
 */
export function registerEmpresaRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { empresa } = services

  app.get('/api/empresa', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    try {
      const tenantId = getTenantId(req)
      const data = await empresa.getByTenant(tenantId)
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put(
    '/api/empresa',
    requirePermission('settings.business.manage'),
    validateBody(empresaUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as EmpresaInput
        const before = await empresa.getByTenant(tenantId)
        const data = await empresa.upsert(tenantId, body)
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'empresa_update', 'param_empresa', data.id != null ? String(data.id) : undefined, {
          puntoVentaBefore: before.puntoVenta,
          puntoVentaAfter: data.puntoVenta,
          tipoFacturaBefore: before.tipoFactura,
          tipoFacturaAfter: data.tipoFactura,
        })
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
