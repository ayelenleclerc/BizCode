import type { NextFunction, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import { getTenantId } from '../routes/restDomainShared'

/**
 * @en Tenant-scoped models supported by `verifyOwnership` (#215 anti-IDOR).
 * @es Modelos con alcance de tenant soportados por `verifyOwnership` (#215 anti-IDOR).
 * @pt-BR Modelos com escopo de tenant suportados por `verifyOwnership` (#215 anti-IDOR).
 */
export type OwnershipModel = 'cliente' | 'articulo' | 'factura' | 'proveedor' | 'pedido' | 'visita'

/**
 * @en Ensures `:id` belongs to the session tenant via `findFirst({ id, tenantId })`; 404 otherwise (no cross-tenant leak).
 * @es Asegura que `:id` pertenece al tenant de sesión con `findFirst({ id, tenantId })`; 404 si no (sin filtrar cross-tenant).
 * @pt-BR Garante que `:id` pertence ao tenant da sessão via `findFirst({ id, tenantId })`; 404 caso contrário (sem vazamento cross-tenant).
 */
export function verifyOwnership(prisma: PrismaClient, model: OwnershipModel, paramName = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = getTenantId(req)
      const raw = req.params[paramName]
      const id = parseInt(String(raw), 10)
      if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ success: false, error: `Invalid ${paramName}` })
        return
      }

      let found: { id: number } | null = null
      switch (model) {
        case 'cliente':
          found = await prisma.cliente.findFirst({ where: { id, tenantId }, select: { id: true } })
          break
        case 'articulo':
          found = await prisma.articulo.findFirst({ where: { id, tenantId }, select: { id: true } })
          break
        case 'factura':
          found = await prisma.factura.findFirst({ where: { id, tenantId }, select: { id: true } })
          break
        case 'proveedor':
          found = await prisma.proveedor.findFirst({ where: { id, tenantId }, select: { id: true } })
          break
        case 'pedido':
          found = await prisma.pedido.findFirst({ where: { id, tenantId }, select: { id: true } })
          break
        case 'visita':
          found = await prisma.visitaVendedor.findFirst({
            where: { id, tenantId },
            select: { id: true },
          })
          break
        default: {
          const _exhaustive: never = model
          res.status(500).json({ success: false, error: `Unsupported ownership model: ${String(_exhaustive)}` })
          return
        }
      }

      if (!found) {
        res.status(404).json({ success: false, error: 'Not found' })
        return
      }
      next()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ownership check failed'
      res.status(500).json({ success: false, error: message })
    }
  }
}
