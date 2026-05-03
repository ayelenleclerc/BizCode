import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import {
  deliveryZoneCreateBodySchema,
  deliveryZoneUpdateBodySchema,
} from '../schemas/domain'
import type { DeliveryZoneCreateParsed, DeliveryZoneUpdateParsed } from '../createApp.types'
import { parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage } from './restDomainShared'

/**
 * @en Delivery zone CRUD routes.
 */
export function registerZonasEntregaRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  app.get('/api/zonas-entrega', requirePermission('logistics.read'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const { take, skip } = parseListPagination(req)
      const zones = await prisma.deliveryZone.findMany({
        where: { tenantId },
        orderBy: { nombre: 'asc' },
        take,
        skip,
      })
      res.json({ success: true, data: zones })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.post(
    '/api/zonas-entrega',
    requirePermission('logistics.manage'),
    validateBody(deliveryZoneCreateBodySchema),
    async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const { nombre, tipo, diasEntrega, horario } = req.body as DeliveryZoneCreateParsed
      const zone = await prisma.deliveryZone.create({
        data: { tenantId, nombre, tipo, diasEntrega, horario },
      })
      await writeAudit(authReq, 'delivery_zone_create', 'delivery_zone', String(zone.id))
      res.status(201).json({ success: true, data: zone })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
  
  app.put(
    '/api/zonas-entrega/:id',
    requirePermission('logistics.manage'),
    validateBody(deliveryZoneUpdateBodySchema),
    async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const id = parseInt(String(req.params.id), 10)
  
      // Verify the zone belongs to the tenant before updating
      const existing = await prisma.deliveryZone.findFirst({ where: { id, tenantId } })
      if (!existing) {
        res.status(404).json({ success: false, error: 'Delivery zone not found' })
        return
      }
  
      const { nombre, tipo, diasEntrega, horario, activo } = req.body as DeliveryZoneUpdateParsed
      const zone = await prisma.deliveryZone.update({
        where: { id },
        data: {
          ...(nombre !== undefined && { nombre }),
          ...(tipo !== undefined && { tipo }),
          ...(diasEntrega !== undefined && { diasEntrega }),
          ...(horario !== undefined && { horario }),
          ...(activo !== undefined && { activo }),
        },
      })
      await writeAudit(authReq, 'delivery_zone_update', 'delivery_zone', String(zone.id))
      res.json({ success: true, data: zone })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
}
