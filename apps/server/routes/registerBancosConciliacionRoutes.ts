/**
 * @en Bank reconciliation REST API: matching, lock, export (#191).
 * @es API REST de conciliación bancaria: matching, lock, export (#191).
 * @pt-BR API REST de conciliação bancária: matching, lock, export (#191).
 */
import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const bankModule = requireModule('finance.bank_reconcile')

function parseId(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseDateParam(value: unknown, fallback: Date): Date {
  if (typeof value !== 'string' || value.trim() === '') return fallback
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return d
}

function requireWriteRole(req: Request, res: Response): boolean {
  const role = (req as AuthenticatedRequest).auth?.claims.role
  if (role !== 'owner' && role !== 'manager' && role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Only owner, manager, or super_admin can modify bank reconciliation',
    })
    return false
  }
  return true
}

function defaultDesde(): Date {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function defaultHasta(): Date {
  const d = new Date()
  d.setUTCHours(23, 59, 59, 999)
  return d
}

export function registerBancosConciliacionRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { bancoConciliacion } = services
  const financialRead = requirePermission('reports.financial.read')

  app.get(
    '/api/bancos/cuentas/:id/conciliacion',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        const cuentaId = parseId(String(req.params.id))
        if (cuentaId == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const desde = parseDateParam(req.query.desde, defaultDesde())
        const hasta = parseDateParam(req.query.hasta, defaultHasta())
        const result = await bancoConciliacion.getConciliacion(getTenantId(req), cuentaId, desde, hasta)
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
    '/api/bancos/cuentas/:id/conciliacion/run',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const cuentaId = parseId(String(req.params.id))
        if (cuentaId == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const desde = parseDateParam(req.body?.desde ?? req.query.desde, defaultDesde())
        const hasta = parseDateParam(req.body?.hasta ?? req.query.hasta, defaultHasta())
        const result = await bancoConciliacion.runMatching(getTenantId(req), cuentaId, desde, hasta)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_conciliacion_run', 'cuenta_bancaria', String(cuentaId))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/bancos/cuentas/:id/conciliacion/export.xlsx',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        const cuentaId = parseId(String(req.params.id))
        if (cuentaId == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const desde = parseDateParam(req.query.desde, defaultDesde())
        const hasta = parseDateParam(req.query.hasta, defaultHasta())
        const buffer = await bancoConciliacion.exportExcel(getTenantId(req), cuentaId, desde, hasta)
        const filename = `conciliacion-bancaria-${cuentaId}.xlsx`
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.status(200).send(buffer)
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg === 'Bank account not found') {
          res.status(404).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )

  app.post(
    '/api/bancos/movimientos/:movId/conciliar',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const movId = parseId(String(req.params.movId))
        if (movId == null) {
          res.status(400).json({ success: false, error: 'Invalid movement id' })
          return
        }
        const tipo = String(req.body?.tipo ?? '')
        const id = parseId(String(req.body?.id ?? ''))
        if ((tipo !== 'recibo_forma' && tipo !== 'cobro') || id == null) {
          res.status(400).json({ success: false, error: 'Body requires tipo (recibo_forma|cobro) and id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const userId = authReq.auth?.claims.userId
        const result = await bancoConciliacion.conciliarManual(
          getTenantId(req),
          movId,
          { tipo, id },
          userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_conciliar_manual', 'movimiento_bancario', String(movId))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/bancos/movimientos/:movId/sugerencia/confirmar',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const movId = parseId(String(req.params.movId))
        if (movId == null) {
          res.status(400).json({ success: false, error: 'Invalid movement id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await bancoConciliacion.confirmarSugerencia(
          getTenantId(req),
          movId,
          authReq.auth?.claims.userId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_sugerencia_confirmar', 'movimiento_bancario', String(movId))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/bancos/movimientos/:movId/ignorar',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const movId = parseId(String(req.params.movId))
        if (movId == null) {
          res.status(400).json({ success: false, error: 'Invalid movement id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await bancoConciliacion.ignorar(getTenantId(req), movId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_movimiento_ignorar', 'movimiento_bancario', String(movId))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/bancos/movimientos/:movId/gasto-bancario',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const movId = parseId(String(req.params.movId))
        if (movId == null) {
          res.status(400).json({ success: false, error: 'Invalid movement id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await bancoConciliacion.marcarGastoBancario(getTenantId(req), movId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_gasto_bancario', 'movimiento_bancario', String(movId))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/bancos/cuentas/:id/periodos/:periodo/lock',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const cuentaId = parseId(String(req.params.id))
        if (cuentaId == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const periodo = String(req.params.periodo ?? '')
        const authReq = req as AuthenticatedRequest
        const userId = authReq.auth?.claims.userId
        if (userId == null) {
          res.status(401).json({ success: false, error: 'Unauthorized' })
          return
        }
        const result = await bancoConciliacion.lockPeriodo(getTenantId(req), cuentaId, periodo, userId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_periodo_lock', 'periodo_bancario', `${cuentaId}:${periodo}`)
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.delete(
    '/api/bancos/cuentas/:id/periodos/:periodo/lock',
    bankModule,
    financialRead,
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const cuentaId = parseId(String(req.params.id))
        if (cuentaId == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const periodo = String(req.params.periodo ?? '')
        const authReq = req as AuthenticatedRequest
        const result = await bancoConciliacion.unlockPeriodo(getTenantId(req), cuentaId, periodo)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_periodo_unlock', 'periodo_bancario', `${cuentaId}:${periodo}`)
        res.json({ success: true, data: null })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
