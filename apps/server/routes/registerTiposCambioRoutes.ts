import type { Application, Request, Response } from 'express'
import type { MonedaFx, TipoCambioTipo } from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { tiposCambioMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import {
  tipoCambioManualBodySchema,
  tipoCambioPreferidoBodySchema,
  tipoCambioSyncBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import { paginatedListJson } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en REST endpoints for exchange rates and FX preference (#243).
 * @es Endpoints REST de tipos de cambio y preferencia FX (#243).
 * @pt-BR Endpoints REST de câmbio e preferência FX (#243).
 */
export function registerTiposCambioRoutes(app: Application, ctx: RestRouteContext): void {
  const { tipoCambio } = ctx.services
  const moduleGuard = requireModule('catalog.multicurrency')
  const readPermission = requirePermission('products.read')
  const managePermission = requirePermission('products.manage')
  const settingsPermission = requirePermission('settings.business.manage')

  app.get(
    '/api/tipos-cambio',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await tipoCambio.list(getTenantId(req), req)
        res.json(paginatedListJson(result.items, result.total, result.limit, result.offset))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/tipos-cambio/vigente',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const moneda = typeof req.query.moneda === 'string' ? req.query.moneda : ''
        if (moneda !== 'USD' && moneda !== 'EUR') {
          res.status(400).json({ success: false, error: 'moneda must be USD or EUR' })
          return
        }
        const tipoRaw = typeof req.query.tipo === 'string' ? req.query.tipo : undefined
        const tipo = tipoRaw as TipoCambioTipo | undefined
        const result = await tipoCambio.getVigente(getTenantId(req), moneda, tipo)
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

  app.get(
    '/api/tipos-cambio/preferido',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const preferido = await tipoCambio.getPreferido(getTenantId(req))
        res.json({ success: true, data: { tipoCambioPreferido: preferido } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/tipos-cambio/preferido',
    tiposCambioMutationHttpRateLimiter,
    moduleGuard,
    settingsPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(tipoCambioPreferidoBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await tipoCambio.setPreferido(
          getTenantId(req),
          parsed.value.tipoCambioPreferido,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'tipos_cambio.preferido',
          'tenant_config',
          String(getTenantId(req)),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/tipos-cambio/actualizar-manual',
    tiposCambioMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(tipoCambioManualBodySchema, req.body)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const userId = (req as AuthenticatedRequest).auth?.claims.userId ?? null
        const result = await tipoCambio.createManual(getTenantId(req), userId, parsed.value)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'tipos_cambio.manual',
          'tipo_cambio',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data, recalc: result.recalc })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/tipos-cambio/sincronizar',
    tiposCambioMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(tipoCambioSyncBodySchema, req.body ?? {})
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const moneda = (parsed.value.moneda ?? 'USD') as MonedaFx
        const userId = (req as AuthenticatedRequest).auth?.claims.userId ?? null
        const result = await tipoCambio.syncBcraOficial(getTenantId(req), userId, moneda)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'tipos_cambio.sync_bcra',
          'tipo_cambio',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data, recalc: result.recalc })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
