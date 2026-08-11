import type { Application, Request, Response } from 'express'
import { hasPermission, type UserRole } from '@bizcode/types'
import {
  requireAnyPermission,
  requirePermission,
  type AuthenticatedRequest,
} from '../auth'
import { validateBody } from '../middleware/validateBody'
import { feriadoCreateBodySchema } from '../schemas/domain'
import type { FeriadoCreateInput } from '@bizcode/types'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function canCreateFeriado(role: string): boolean {
  return (
    role === 'owner' ||
    role === 'admin' ||
    hasPermission(role as UserRole, 'customers.manage') ||
    hasPermission(role as UserRole, 'users.manage')
  )
}

/**
 * @en Holiday calendar REST (#267).
 * @es REST de calendario de feriados (#267).
 * @pt-BR REST do calendário de feriados (#267).
 */
export function registerFeriadosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { feriado } = services

  app.get(
    '/api/feriados',
    requireAnyPermission('orders.create', 'reports.operational.read', 'customers.manage'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const yearRaw = typeof req.query.year === 'string' ? req.query.year : ''
        const year = yearRaw ? parseInt(yearRaw, 10) : new Date().getUTCFullYear()
        const fechaRaw = typeof req.query.fecha === 'string' ? req.query.fecha.trim() : ''
        if (fechaRaw) {
          const day = await feriado.listOnDate(tenantId, fechaRaw)
          if (!day.ok) {
            res.status(day.status).json({ success: false, error: day.error })
            return
          }
          res.json({ success: true, data: day.data, total: day.data.length })
          return
        }
        const result = await feriado.listByYear(tenantId, year)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data.feriados, total: result.data.total })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/feriados',
    requirePermission('customers.manage'),
    validateBody(feriadoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        if (!canCreateFeriado(authReq.auth!.claims.role)) {
          res.status(403).json({ success: false, error: 'Forbidden' })
          return
        }
        const tenantId = getTenantId(req)
        const body = req.body as FeriadoCreateInput
        const result = await feriado.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(
          req as AuthenticatedRequest,
          'feriado_create',
          'feriado',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
