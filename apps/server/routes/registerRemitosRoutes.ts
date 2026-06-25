import type { Application, Request, Response } from 'express'
import { requireAnyPermission, requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  remitoBodySchema,
  remitoEntregarBodySchema,
  remitoUpdateBodySchema,
} from '../schemas/domain'
import type { RemitoEntregarInput, RemitoEstado, RemitoInput, RemitoUpdateInput } from '@bizcode/types'
import { buildRemitoPdfBuffer, remitoPdfFilename } from '../fiscal/ar/remitoPdf'
import { mapRemitoPublic } from '../services/RemitoService'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const REMITO_ESTADOS: RemitoEstado[] = ['borrador', 'emitido', 'entregado', 'anulado']

function parseEstadoQuery(raw: unknown): RemitoEstado | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') return undefined
  const v = raw.trim() as RemitoEstado
  return REMITO_ESTADOS.includes(v) ? v : undefined
}

/**
 * @en Delivery note REST API (#230).
 * @es API REST de remitos (#230).
 * @pt-BR API REST de remessas (#230).
 */
export function registerRemitosRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services } = ctx
  const { remito } = services
  const remitoModule = requireModule('fiscal.remito')

  app.get(
    '/api/remitos',
    remitoModule,
    requireAnyPermission('sales.create', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const estado = parseEstadoQuery(req.query.estado)
        const clienteIdRaw = req.query.clienteId
        const clienteId =
          typeof clienteIdRaw === 'string' && clienteIdRaw.trim() !== ''
            ? parseInt(clienteIdRaw, 10)
            : undefined
        const { total, remitos } = await remito.list(tenantId, take, skip, {
          estado,
          clienteId: clienteId !== undefined && !Number.isNaN(clienteId) ? clienteId : undefined,
        })
        res.json(
          paginatedListJson(
            remitos.map((row) => mapRemitoPublic(row)),
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

  app.get(
    '/api/remitos/:id',
    remitoModule,
    requireAnyPermission('sales.create', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const row = await remito.getById(tenantId, id)
        if (!row) {
          res.status(404).json({ success: false, error: 'Remito not found' })
          return
        }
        res.json({ success: true, data: mapRemitoPublic(row) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/remitos',
    remitoModule,
    requirePermission('sales.create'),
    validateBody(remitoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const result = await remito.create(tenantId, req.body as RemitoInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/remitos/:id',
    remitoModule,
    requirePermission('sales.create'),
    validateBody(remitoUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await remito.update(tenantId, id, req.body as RemitoUpdateInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/remitos/:id/emitir',
    remitoModule,
    requirePermission('sales.create'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await remito.emitir(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/remitos/:id/entregar',
    remitoModule,
    requirePermission('sales.create'),
    validateBody(remitoEntregarBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await remito.entregar(tenantId, id, req.body as RemitoEntregarInput)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/remitos/:id/anular',
    remitoModule,
    requirePermission('sales.cancel'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await remito.anular(tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: mapRemitoPublic(result.data) })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/remitos/:id/pdf',
    remitoModule,
    requireAnyPermission('sales.create', 'reports.operational.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        if (Number.isNaN(id)) {
          res.status(400).json({ success: false, error: 'Invalid id' })
          return
        }
        const result = await buildRemitoPdfBuffer(prisma, tenantId, id)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        const row = await remito.getById(tenantId, id)
        const filename = remitoPdfFilename(id, row?.prefijo ?? null, row?.numero ?? null)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
