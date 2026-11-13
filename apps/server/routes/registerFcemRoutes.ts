/**
 * @en FCEM MiPyME REST routes — mock WSFECM + local acceptance (#239).
 * @es Rutas REST FCEM MiPyME — mock WSFECM + aceptación local (#239).
 * @pt-BR Rotas REST FCEM MiPyME — mock WSFECM + aceitação local (#239).
 */

import type { Application, Request, Response } from 'express'
import { z } from 'zod'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { fiscalMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import { FcemService } from '../fiscal/ar/FcemService'
import { notifyTenantOwners } from '../notifications'
import { logger } from '../logger'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const rejectBodySchema = z.object({
  reason: z.string().trim().max(200).optional(),
})

/**
 * @en Registers `/api/fcem/*` under module `billing.fcem_mipyme`.
 * @es Registra `/api/fcem/*` bajo el módulo `billing.fcem_mipyme`.
 * @pt-BR Registra `/api/fcem/*` sob o módulo `billing.fcem_mipyme`.
 */
export function registerFcemRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const fcem = new FcemService(prisma)
  const fcemModule = requireModule('billing.fcem_mipyme')

  app.get(
    '/api/fcem/facturas/:facturaId',
    fcemModule,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const facturaId = Number(req.params.facturaId)
        if (!Number.isInteger(facturaId) || facturaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid facturaId' })
          return
        }
        const result = await fcem.evaluate(getTenantId(req), facturaId)
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
    '/api/fcem/facturas/:facturaId/emitir',
    fcemModule,
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const facturaId = Number(req.params.facturaId)
        if (!Number.isInteger(facturaId) || facturaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid facturaId' })
          return
        }
        const result = await fcem.emit(getTenantId(req), facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'fcem_emit', 'factura', String(facturaId), {
          fcemTipoCbte: result.data.fcemTipoCbte,
          cae: result.data.cae,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fcem/facturas/:facturaId/aceptar',
    fcemModule,
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const facturaId = Number(req.params.facturaId)
        if (!Number.isInteger(facturaId) || facturaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid facturaId' })
          return
        }
        const result = await fcem.accept(getTenantId(req), facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'fcem_accept', 'factura', String(facturaId), {
          fcemEstado: result.data.fcemEstado,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fcem/facturas/:facturaId/rechazar',
    fcemModule,
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    validateBody(rejectBodySchema),
    async (req: Request, res: Response) => {
      try {
        const facturaId = Number(req.params.facturaId)
        if (!Number.isInteger(facturaId) || facturaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid facturaId' })
          return
        }
        const body = req.body as { reason?: string }
        const result = await fcem.reject(getTenantId(req), facturaId, body.reason)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'fcem_reject', 'factura', String(facturaId), {
          fcemEstado: result.data.fcemEstado,
          reason: result.data.fcemRejectReason,
        })
        const tenantId = getTenantId(req)
        try {
          await notifyTenantOwners(prisma, tenantId, 'fcem_rejected', {
            facturaId,
            ...(result.data.fcemRejectReason
              ? { detail: result.data.fcemRejectReason }
              : {}),
          })
        } catch (notifyErr: unknown) {
          logger.warn(
            {
              err:
                notifyErr instanceof Error
                  ? { name: notifyErr.name, message: notifyErr.message }
                  : String(notifyErr),
              tenantId,
              facturaId,
            },
            '[fcem] owner notify on reject failed',
          )
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fcem/facturas/:facturaId/aceptar-tacita',
    fcemModule,
    fiscalMutationHttpRateLimiter,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const facturaId = Number(req.params.facturaId)
        if (!Number.isInteger(facturaId) || facturaId < 1) {
          res.status(400).json({ success: false, error: 'Invalid facturaId' })
          return
        }
        const result = await fcem.acceptTacita(getTenantId(req), facturaId)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'fcem_accept_tacita', 'factura', String(facturaId), {
          fcemEstado: result.data.fcemEstado,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
