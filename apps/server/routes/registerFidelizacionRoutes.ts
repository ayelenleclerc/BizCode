import type { Application, Request, Response } from 'express'
import type { ConfigFidelizacionUpsertInput, FidelizacionAjusteInput } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { fidelizacionMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  configFidelizacionUpsertBodySchema,
  fidelizacionAjusteBodySchema,
} from '../schemas/domain'
import { parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function clienteIdParam(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en Loyalty points REST endpoints (#250).
 * @es Endpoints REST de fidelización / puntos (#250).
 * @pt-BR Endpoints REST de fidelização / pontos (#250).
 */
export function registerFidelizacionRoutes(app: Application, ctx: RestRouteContext): void {
  const { fidelizacion } = ctx.services
  const loyaltyModule = requireModule('clients.loyalty')
  const readPermission = requirePermission('customers.read')
  const managePermission = requirePermission('customers.manage')

  app.get(
    '/api/fidelizacion/config',
    loyaltyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const data = await fidelizacion.getConfig(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/fidelizacion/config',
    loyaltyModule,
    managePermission,
    fidelizacionMutationHttpRateLimiter,
    validateBody(configFidelizacionUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await fidelizacion.upsertConfig(
          getTenantId(req),
          req.body as ConfigFidelizacionUpsertInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'fidelizacion_config_update',
          'config_fidelizacion',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fidelizacion/dashboard',
    loyaltyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const data = await fidelizacion.getDashboard(getTenantId(req))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fidelizacion/clientes/:id',
    loyaltyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const { take, skip } = parseListPagination(req)
        const result = await fidelizacion.getClientePuntos(
          getTenantId(req),
          clienteIdParam(req),
          take,
          skip,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fidelizacion/ajuste',
    loyaltyModule,
    managePermission,
    fidelizacionMutationHttpRateLimiter,
    validateBody(fidelizacionAjusteBodySchema),
    async (req: Request, res: Response) => {
      try {
        const userId = (req as AuthenticatedRequest).auth!.claims.userId
        const result = await fidelizacion.ajustar(
          getTenantId(req),
          userId,
          req.body as FidelizacionAjusteInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'fidelizacion_ajuste',
          'cliente',
          String((req.body as FidelizacionAjusteInput).clienteId),
          { puntos: (req.body as FidelizacionAjusteInput).puntos },
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
