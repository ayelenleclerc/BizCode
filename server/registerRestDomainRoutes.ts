import type { Application } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import type { AuthenticatedRequest } from './auth'
import { writeAuditEvent } from './audit'
import { registerArticulosRoutes } from './routes/registerArticulosRoutes'
import { registerClientesRoutes } from './routes/registerClientesRoutes'
import { registerComprasRoutes } from './routes/registerComprasRoutes'
import { registerCobrosRoutes } from './routes/registerCobrosRoutes'
import { registerReportesRoutes } from './routes/registerReportesRoutes'
import { registerFacturasRoutes } from './routes/registerFacturasRoutes'
import { registerFormasPagoRoutes } from './routes/registerFormasPagoRoutes'
import { registerHealthRoute } from './routes/registerHealthRoute'
import { registerModulesCatalogRoute } from './routes/registerModulesCatalogRoute'
import { registerProveedoresRoutes } from './routes/registerProveedoresRoutes'
import { registerRubrosRoutes } from './routes/registerRubrosRoutes'
import type { RestRouteContext } from './routes/restRouteTypes'
import { registerZonasEntregaRoutes } from './routes/registerZonasEntregaRoutes'
import { registerOrdenesEntregaRoutes } from './routes/registerOrdenesEntregaRoutes'
import { registerEmpresaRoutes } from './routes/registerEmpresaRoutes'
import { createDomainServices } from './services/createDomainServices'

/**
 * @en Registers core REST handlers (customers, products, invoicing, delivery zones, health).
 */
export function registerRestDomainRoutes(app: Application, prisma: PrismaClient): void {
  function writeAudit(
    req: AuthenticatedRequest,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    return writeAuditEvent({
      prisma,
      tenantId: req.auth!.claims.tenantId,
      userId: req.auth!.claims.userId,
      action,
      resource,
      resourceId: resourceId ?? null,
      ipAddress: req.ip,
      metadata,
    })
  }

  const ctx: RestRouteContext = { prisma, services: createDomainServices(prisma), writeAudit }

  registerClientesRoutes(app, ctx)
  registerArticulosRoutes(app, ctx)
  registerRubrosRoutes(app, ctx)
  registerProveedoresRoutes(app, ctx)
  registerComprasRoutes(app, ctx)
  registerFormasPagoRoutes(app, ctx)
  registerFacturasRoutes(app, ctx)
  registerCobrosRoutes(app, ctx)
  registerReportesRoutes(app, ctx)
  registerZonasEntregaRoutes(app, ctx)
  registerOrdenesEntregaRoutes(app, ctx)
  registerEmpresaRoutes(app, ctx)
  registerHealthRoute(app, ctx)
  registerModulesCatalogRoute(app, ctx)
}
