import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { facturaBodySchema, facturaVoidBodySchema } from '../schemas/domain'
import type { FacturaInput } from '../createApp.types'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import { dispatchNotification } from '../channels'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, facturaFechaToPrismaDate, getTenantId } from './restDomainShared'

/**
 * @en Invoice create/list and void routes.
 */
export function registerFacturasRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  
  app.get('/api/facturas', requirePermission('reports.operational.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const { take, skip } = parseListPagination(req)
      const where = { tenantId }
      const [total, facturas] = await Promise.all([
        prisma.factura.count({ where }),
        prisma.factura.findMany({
          where,
          include: { cliente: true, items: true },
          orderBy: { fecha: 'desc' },
          take,
          skip,
        }),
      ])
      res.json(paginatedListJson(facturas, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.post(
    '/api/facturas',
    requirePermission('sales.create'),
    validateBody(facturaBodySchema),
    async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const parsedValue = req.body as FacturaInput
      const { items, fecha, ...factura } = parsedValue
      const clienteId = factura.clienteId
  
      const articuloIds = [...new Set(items.map((it) => it.articuloId))]
      const articulosOk = await prisma.articulo.findMany({
        where: { tenantId, id: { in: articuloIds } },
        select: { id: true },
      })
      if (articulosOk.length !== articuloIds.length) {
        res.status(400).json({ success: false, error: 'One or more articuloId values are not valid for this tenant' })
        return
      }
  
      // Check suspension before creating the factura
      const clienteCheck = await prisma.cliente.findFirst({
        where: { id: clienteId, tenantId },
        select: { suspended: true },
      })
      if (!clienteCheck) {
        res.status(400).json({ success: false, error: 'clienteId is not valid for this tenant' })
        return
      }
      if (clienteCheck.suspended) {
        res.status(422).json({ success: false, error: 'CLIENT_SUSPENDED' })
        return
      }
  
      // Create factura and update customer balance atomically
      const [result, updatedCliente] = await prisma.$transaction(async (tx) => {
        const newFactura = await tx.factura.create({
          data: {
            ...factura,
            fecha: facturaFechaToPrismaDate(fecha),
            tenantId,
            items: { create: items },
          } as Parameters<typeof prisma.factura.create>[0]['data'],
          include: { items: true },
        })
  
        const updated = await tx.cliente.update({
          where: { id: clienteId },
          data: { balance: { increment: newFactura.total } },
          select: { id: true, rsocial: true, balance: true, creditLimit: true },
        })
  
        return [newFactura, updated] as const
      })
  
      // Dispatch to all configured channels if balance exceeds credit limit (non-blocking)
      if (
        updatedCliente.creditLimit !== null &&
        Number(updatedCliente.balance) > Number(updatedCliente.creditLimit)
      ) {
        const authReq = req as AuthenticatedRequest
        dispatchNotification(prisma, authReq.auth!.claims.tenantId, 'credit_limit_exceeded', {
          clienteId: updatedCliente.id,
          rsocial: updatedCliente.rsocial,
          amount: String(updatedCliente.balance),
          limit: String(updatedCliente.creditLimit),
        }).catch(() => { /* notification failure must not block the sale */ })
      }
  
      await writeAudit(req as AuthenticatedRequest, 'factura_create', 'factura', String(result.id))
      res.json({ success: true, data: result })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
  
  // ============ ANULACIÓN DE FACTURAS ============
  
  app.put(
    '/api/facturas/:id/void',
    requirePermission('sales.cancel'),
    validateBody(facturaVoidBodySchema),
    async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = getTenantId(req)
      const id = parseInt(String(req.params.id), 10)
      const { motivo } = req.body as { motivo: string }
  
      const factura = await prisma.factura.findFirst({
        where: { id, tenantId },
        select: { id: true, estado: true, total: true, clienteId: true },
      })
  
      if (!factura) {
        res.status(404).json({ success: false, error: 'Factura not found' })
        return
      }
  
      if (factura.estado === 'N') {
        res.status(409).json({ success: false, error: 'Factura already voided' })
        return
      }
  
      // Void atomically: set estado='N', reverse customer balance
      const updated = await prisma.$transaction(async (tx) => {
        const voided = await tx.factura.update({
          where: { id },
          data: { estado: 'N' },
        })
        await tx.cliente.update({
          where: { id: factura.clienteId },
          data: { balance: { decrement: factura.total } },
        })
        return voided
      })
  
      await writeAudit(authReq, 'factura_void', 'factura', String(id), { motivo })
      res.json({ success: true, data: updated })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
}
