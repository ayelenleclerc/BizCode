import type { Application, Request, Response } from 'express'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  chequeBodySchema,
  chequeTransicionBodySchema,
  chequeUpdateBodySchema,
} from '../schemas/domain'
import type { ChequeEstado, ChequeInput, ChequeTipo, ChequeTransicionInput, ChequeUpdateInput } from '../createApp.types'
import { ChequeAlertasService } from '../services/ChequeAlertasService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const CHEQUE_TIPOS: ChequeTipo[] = ['recibido', 'emitido']
const CHEQUE_ESTADOS: ChequeEstado[] = [
  'en_cartera',
  'emitido',
  'depositado',
  'endosado',
  'descontado',
  'cobrado',
  'rechazado',
  'anulado',
]

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseEnumQuery<T extends string>(raw: unknown, allowed: T[]): T | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') return undefined
  const v = raw.trim() as T
  return allowed.includes(v) ? v : undefined
}

/**
 * @en Check portfolio REST API (#231).
 * @es API REST de cartera de cheques (#231).
 * @pt-BR API REST de carteira de cheques (#231).
 */
export function registerChequesRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { cheque } = services
  const alertas = new ChequeAlertasService(ctx.prisma)
  const chequesModule = requireModule('fiscal.cheques')

  app.get(
    '/api/cheques/resumen',
    chequesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await cheque.getResumen(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/cheques',
    chequesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const tipo = parseEnumQuery(req.query.tipo, CHEQUE_TIPOS)
        const estado = parseEnumQuery(req.query.estado, CHEQUE_ESTADOS)
        const banco = typeof req.query.banco === 'string' ? req.query.banco : undefined
        const { total, cheques } = await cheque.list(tenantId, take, skip, {
          tipo,
          estado,
          banco,
        })
        res.json(paginatedListJson(cheques, total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/cheques/:id',
    chequesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await cheque.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'Cheque not found' })
          return
        }
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/cheques',
    chequesModule,
    requireAnyPermission('sales.create', 'reports.financial.read'),
    validateBody(chequeBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ChequeInput
        const result = await cheque.create(tenantId, authReq.auth.claims.userId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'cheque_create', 'cheque', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/cheques/:id',
    chequesModule,
    requirePermission('sales.create'),
    validateBody(chequeUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parsePositiveIntParam(String(req.params.id))
        if (id === null) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await cheque.update(tenantId, id, req.body as ChequeUpdateInput)
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

  const transitionRoute = (
    path: string,
    action: keyof Pick<
      typeof cheque,
      'depositar' | 'endosar' | 'descontar' | 'cobrar' | 'rechazar' | 'devolverACartera' | 'anular'
    >,
    auditAction: string,
    permission: 'sales.create' | 'suppliers.manage' = 'sales.create',
  ) => {
    app.post(
      path,
      chequesModule,
      requirePermission(permission),
      validateBody(chequeTransicionBodySchema),
      async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest
        if (!authReq.auth) {
          res.status(401).json({ success: false, error: 'Authentication required' })
          return
        }
        try {
          const tenantId = getTenantId(req)
          const id = parsePositiveIntParam(String(req.params.id))
          if (id === null) {
            res.status(400).json({ success: false, error: 'Invalid id' })
            return
          }
          const body = req.body as ChequeTransicionInput
          const result = await cheque[action](tenantId, id, authReq.auth.claims.userId, body)
          if (!result.ok) {
            res.status(result.status).json({ success: false, error: result.error })
            return
          }
          await writeAudit(authReq, auditAction, 'cheque', String(id))
          res.json({ success: true, data: result.data })
        } catch (err: unknown) {
          res.status(500).json({ success: false, error: errorMessage(err) })
        }
      },
    )
  }

  transitionRoute('/api/cheques/:id/depositar', 'depositar', 'cheque_depositar')
  transitionRoute('/api/cheques/:id/endosar', 'endosar', 'cheque_endosar', 'suppliers.manage')
  transitionRoute('/api/cheques/:id/descontar', 'descontar', 'cheque_descontar')
  transitionRoute('/api/cheques/:id/cobrar', 'cobrar', 'cheque_cobrar')
  transitionRoute('/api/cheques/:id/rechazar', 'rechazar', 'cheque_rechazar')
  transitionRoute('/api/cheques/:id/devolver-cartera', 'devolverACartera', 'cheque_devolver_cartera')
  transitionRoute('/api/cheques/:id/anular', 'anular', 'cheque_anular')

  app.post(
    '/api/cheques/alertas/run',
    chequesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await alertas.runDailyJob(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
