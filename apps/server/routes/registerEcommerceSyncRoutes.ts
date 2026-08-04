/**
 * @en Ecommerce sync connectors + SyncLog routes (#189).
 * @es Rutas de conectores eCommerce + SyncLog (#189).
 * @pt-BR Rotas de conectores eCommerce + SyncLog (#189).
 */
import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { EcommerceSyncEngine } from '../services/EcommerceSyncEngine'
import { parseListPagination, paginatedListJson } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Registers GET connectors and sync-logs under /api/ecommerce (#189).
 * @es Registra GET connectors y sync-logs bajo /api/ecommerce (#189).
 * @pt-BR Registra GET connectors e sync-logs sob /api/ecommerce (#189).
 */
export function registerEcommerceSyncRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma } = ctx
  bootstrapEcommerceConnectors()
  const engine = new EcommerceSyncEngine(prisma)

  app.get(
    '/api/ecommerce/connectors',
    requirePermission('settings.business.manage'),
    async (req: Request, res: Response) => {
      try {
        const connectors = await engine.listConnectorStatuses(getTenantId(req))
        res.json({ success: true, data: connectors })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/ecommerce/sync-logs',
    requirePermission('settings.business.manage'),
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const connectorType =
          typeof req.query.connectorType === 'string' && req.query.connectorType.trim()
            ? req.query.connectorType.trim()
            : undefined
        const status =
          typeof req.query.status === 'string' && req.query.status.trim()
            ? req.query.status.trim()
            : undefined
        const { total, logs } = await engine.listSyncLogs(getTenantId(req), {
          connectorType,
          status,
          take,
          skip,
        })
        res.json(
          paginatedListJson(
            logs.map((row) => ({
              ...row,
              createdAt: row.createdAt.toISOString(),
            })),
            total,
            take,
            skip,
          ),
        )
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
