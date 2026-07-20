import type { Application, Request, Response } from 'express'
import type { Decimal } from '@prisma/client/runtime/library'
import type {
  MovimientoCajaManualInput,
  TurnoCajaCloseInput,
  TurnoCajaOpenInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { buildTurnoCajaPdfBuffer } from '../finance/turnoCajaPdf'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  cajaCreateBodySchema,
  movimientoCajaManualBodySchema,
  turnoCajaCloseBodySchema,
  turnoCajaOpenBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { TurnoCajaRowDb } from '../services/TurnoCajaService'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function turnoId(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

function dec(value: Decimal | number | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : Number(value.toString())
}

function mapTurno(row: TurnoCajaRowDb) {
  return {
    id: row.id,
    cajaId: row.cajaId,
    cajeroId: row.cajeroId,
    estado: row.estado,
    montoApertura: Number(row.montoApertura.toString()),
    fechaApertura: row.fechaApertura.toISOString(),
    fechaCierre: row.fechaCierre?.toISOString() ?? null,
    totalVentasEfectivo: dec(row.totalVentasEfectivo),
    totalVentasTarjeta: dec(row.totalVentasTarjeta),
    totalVentasMP: dec(row.totalVentasMP),
    totalVentasTransf: dec(row.totalVentasTransf),
    totalEgresos: dec(row.totalEgresos),
    totalIngresosExtra: dec(row.totalIngresosExtra),
    efectivoEsperado: dec(row.efectivoEsperado),
    efectivoContado: dec(row.efectivoContado),
    diferencia: dec(row.diferencia),
    observaciones: row.observaciones,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    caja: row.caja
      ? {
          id: row.caja.id,
          nombre: row.caja.nombre,
          activa: row.caja.activa,
          createdAt: row.caja.createdAt.toISOString(),
          updatedAt: row.caja.updatedAt.toISOString(),
        }
      : null,
    cajero: row.cajero,
    conteo: row.conteo
      ? {
          id: row.conteo.id,
          turnoId: row.conteo.turnoId,
          b1000: row.conteo.b1000,
          b500: row.conteo.b500,
          b200: row.conteo.b200,
          b100: row.conteo.b100,
          b50: row.conteo.b50,
          b20: row.conteo.b20,
          b10: row.conteo.b10,
          m10: row.conteo.m10,
          m5: row.conteo.m5,
          m2: row.conteo.m2,
          m1: row.conteo.m1,
          total: Number(row.conteo.total.toString()),
        }
      : null,
    movimientos: row.movimientos?.map((m) => ({
      id: m.id,
      turnoId: m.turnoId,
      tipo: m.tipo,
      formaPago: m.formaPago,
      importe: Number(m.importe.toString()),
      concepto: m.concepto,
      referenciaTipo: m.referenciaTipo,
      referenciaId: m.referenciaId,
      userId: m.userId,
      fecha: m.fecha.toISOString(),
      user: m.user,
    })),
  }
}

/**
 * @en Cash drawer and shift REST endpoints (#247).
 * @es Endpoints REST de cajas y turnos (#247).
 * @pt-BR Endpoints REST de caixas e turnos (#247).
 */
export function registerCajaRoutes(app: Application, ctx: RestRouteContext): void {
  const { turnoCaja } = ctx.services
  const posModule = requireModule('pos.cashier')
  const readPermission = requireAnyPermission('sales.create', 'reports.financial.read')
  const writePermission = requirePermission('sales.create')

  app.get('/api/cajas', posModule, readPermission, async (req: Request, res: Response) => {
    try {
      const rows = await turnoCaja.listCajas(getTenantId(req))
      res.json({
        success: true,
        data: rows.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          activa: c.activa,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/cajas',
    posModule,
    writePermission,
    validateBody(cajaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await turnoCaja.createCaja(getTenantId(req), req.body.nombre as string)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'caja_create', 'caja', String(result.data.id))
        res.status(201).json({
          success: true,
          data: {
            id: result.data.id,
            nombre: result.data.nombre,
            activa: result.data.activa,
            createdAt: result.data.createdAt.toISOString(),
            updatedAt: result.data.updatedAt.toISOString(),
          },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get('/api/turnos-caja', posModule, readPermission, async (req: Request, res: Response) => {
    try {
      const { take, skip } = parseListPagination(req)
      const estado = typeof req.query.estado === 'string' ? req.query.estado : null
      const cajaIdRaw = typeof req.query.cajaId === 'string' ? Number.parseInt(req.query.cajaId, 10) : null
      const result = await turnoCaja.listTurnos(getTenantId(req), take, skip, {
        estado,
        cajaId: cajaIdRaw != null && Number.isFinite(cajaIdRaw) ? cajaIdRaw : null,
      })
      res.json({
        ...paginatedListJson(result.turnos.map(mapTurno), result.total, take, skip),
        counts: result.counts,
      })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/turnos-caja/:id', posModule, readPermission, async (req: Request, res: Response) => {
    try {
      const result = await turnoCaja.getTurno(getTenantId(req), turnoId(req))
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      res.json({ success: true, data: mapTurno(result.data) })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/turnos-caja',
    posModule,
    writePermission,
    validateBody(turnoCajaOpenBodySchema),
    async (req: Request, res: Response) => {
      try {
        const userId = (req as AuthenticatedRequest).auth!.claims.userId
        const result = await turnoCaja.open(
          getTenantId(req),
          userId,
          req.body as TurnoCajaOpenInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'turno_caja_open', 'turno_caja', String(result.data.id))
        res.status(201).json({ success: true, data: mapTurno(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/turnos-caja/:id/movimientos',
    posModule,
    writePermission,
    validateBody(movimientoCajaManualBodySchema),
    async (req: Request, res: Response) => {
      try {
        const userId = (req as AuthenticatedRequest).auth!.claims.userId
        const result = await turnoCaja.addManualMovement(
          getTenantId(req),
          turnoId(req),
          userId,
          req.body as MovimientoCajaManualInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'turno_caja_movimiento',
          'turno_caja',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: mapTurno(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/turnos-caja/:id/cerrar',
    posModule,
    writePermission,
    validateBody(turnoCajaCloseBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await turnoCaja.close(
          getTenantId(req),
          turnoId(req),
          req.body as TurnoCajaCloseInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'turno_caja_close', 'turno_caja', String(result.data.id))
        res.json({ success: true, data: mapTurno(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/turnos-caja/:id/pdf',
    posModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await turnoCaja.getTurno(getTenantId(req), turnoId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        if (result.data.estado !== 'cerrado') {
          res.status(409).json({ success: false, error: 'PDF available only for closed turnos' })
          return
        }
        const buffer = await buildTurnoCajaPdfBuffer(result.data)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="turno-caja-${result.data.id}.pdf"`)
        res.send(buffer)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
