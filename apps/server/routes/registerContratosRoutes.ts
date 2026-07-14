import type { Application, Request, Response } from 'express'
import type {
  ContratoAjusteManualInput,
  ContratoInput,
  ContratoUpdateInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  contratoAjusteManualBodySchema,
  contratoBodySchema,
  contratoUpdateBodySchema,
} from '../schemas/domain'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function contratoId(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en Recurring service-contract REST endpoints (#245).
 * @es Endpoints REST de contratos de servicio recurrentes (#245).
 * @pt-BR Endpoints REST de contratos de serviço recorrentes (#245).
 */
export function registerContratosRoutes(app: Application, ctx: RestRouteContext): void {
  const { contrato } = ctx.services
  const contractsModule = requireModule('service.contracts')
  const readPermission = requireAnyPermission('sales.create', 'reports.operational.read')
  const writePermission = requirePermission('sales.create')

  app.get('/api/contratos', contractsModule, readPermission, async (req: Request, res: Response) => {
    try {
      const { take, skip } = parseListPagination(req)
      const result = await contrato.list(getTenantId(req), take, skip)
      res.json(paginatedListJson(result.contratos, result.total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/contratos/:id', contractsModule, readPermission, async (req: Request, res: Response) => {
    try {
      const result = await contrato.getById(getTenantId(req), contratoId(req))
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      res.json({ success: true, data: result.data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get(
    '/api/contratos/:id/facturas',
    contractsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await contrato.listFacturas(getTenantId(req), contratoId(req))
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
    '/api/contratos',
    contractsModule,
    writePermission,
    validateBody(contratoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await contrato.create(getTenantId(req), req.body as ContratoInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'contrato_create', 'contrato', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/contratos/:id',
    contractsModule,
    writePermission,
    validateBody(contratoUpdateBodySchema),
    async (req: Request, res: Response) => {
      const id = contratoId(req)
      try {
        const result = await contrato.update(getTenantId(req), id, req.body as ContratoUpdateInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'contrato_update', 'contrato', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post('/api/contratos/:id/pause', contractsModule, writePermission, async (req: Request, res: Response) => {
    const id = contratoId(req)
    try {
      const result = await contrato.pause(getTenantId(req), id)
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      await ctx.writeAudit(req as AuthenticatedRequest, 'contrato_pause', 'contrato', String(id))
      res.json({ success: true, data: result.data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/contratos/:id/resume', contractsModule, writePermission, async (req: Request, res: Response) => {
    const id = contratoId(req)
    try {
      const result = await contrato.resume(getTenantId(req), id)
      if (!result.ok) {
        res.status(result.status).json({ success: false, error: result.error })
        return
      }
      await ctx.writeAudit(req as AuthenticatedRequest, 'contrato_resume', 'contrato', String(id))
      res.json({ success: true, data: result.data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/contratos/:id/ajuste-manual',
    contractsModule,
    writePermission,
    validateBody(contratoAjusteManualBodySchema),
    async (req: Request, res: Response) => {
      const id = contratoId(req)
      const input = req.body as ContratoAjusteManualInput
      try {
        const result = await contrato.applyManualAdjustment(getTenantId(req), id, input)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(req as AuthenticatedRequest, 'contrato_ajuste_manual', 'contrato', String(id), {
          porcentaje: input.porcentaje,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
