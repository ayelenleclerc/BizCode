import type { Application } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import type { AuthenticatedRequest } from './auth'
import { writeAuditEvent } from './audit'
import { registerArticulosRoutes } from './routes/registerArticulosRoutes'
import { registerClientesRoutes } from './routes/registerClientesRoutes'
import { registerComprasRoutes } from './routes/registerComprasRoutes'
import { registerRecuentosRoutes } from './routes/registerRecuentosRoutes'
import { registerCobrosRoutes } from './routes/registerCobrosRoutes'
import { registerReportesRoutes } from './routes/registerReportesRoutes'
import { registerFacturasRoutes } from './routes/registerFacturasRoutes'
import { registerNotasCreditoRoutes } from './routes/registerNotasCreditoRoutes'
import { registerContabilidadRoutes } from './routes/registerContabilidadRoutes'
import { registerFormasPagoRoutes } from './routes/registerFormasPagoRoutes'
import { registerHealthRoute } from './routes/registerHealthRoute'
import { registerMeFeaturesRoute } from './routes/registerMeFeaturesRoute'
import { registerPlanRoutes } from './routes/registerPlanRoutes'
import { registerSuperadminTenantPlanRoutes } from './routes/registerSuperadminTenantPlanRoutes'
import { registerModulesCatalogRoute } from './routes/registerModulesCatalogRoute'
import { registerSuperadminTenantConfigRoutes } from './routes/registerSuperadminTenantConfigRoutes'
import { registerSuperadminTenantPricingTrialsRoutes } from './routes/registerSuperadminTenantPricingTrialsRoutes'
import { registerSuperadminTenantsRoutes } from './routes/registerSuperadminTenantsRoutes'
import { registerProveedoresRoutes } from './routes/registerProveedoresRoutes'
import { registerRubrosRoutes } from './routes/registerRubrosRoutes'
import type { RestRouteContext } from './routes/restRouteTypes'
import { registerZonasEntregaRoutes } from './routes/registerZonasEntregaRoutes'
import { registerOrdenesEntregaRoutes } from './routes/registerOrdenesEntregaRoutes'
import { registerLogisticaReportesRoutes } from './routes/registerLogisticaReportesRoutes'
import { registerRepartosRoutes } from './routes/registerRepartosRoutes'
import { registerAfipRoutes } from './routes/registerAfipRoutes'
import { registerCobranzasRoutes } from './routes/registerCobranzasRoutes'
import { registerPedidosRoutes } from './routes/registerPedidosRoutes'
import { registerEmpresaRoutes } from './routes/registerEmpresaRoutes'
import { registerPrintingRoutes } from './routes/registerPrintingRoutes'
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
  registerRecuentosRoutes(app, ctx)
  registerFormasPagoRoutes(app, ctx)
  registerFacturasRoutes(app, ctx)
  registerNotasCreditoRoutes(app, ctx)
  registerAfipRoutes(app, ctx)
  registerPedidosRoutes(app, ctx)
  registerCobrosRoutes(app, ctx)
  registerCobranzasRoutes(app, ctx)
  registerReportesRoutes(app, ctx)
  registerContabilidadRoutes(app, ctx)
  registerZonasEntregaRoutes(app, ctx)
  registerOrdenesEntregaRoutes(app, ctx)
  registerRepartosRoutes(app, ctx)
  registerLogisticaReportesRoutes(app, ctx)
  registerEmpresaRoutes(app, ctx)
  registerPrintingRoutes(app)
  registerHealthRoute(app, ctx)
  registerModulesCatalogRoute(app, ctx)
  registerMeFeaturesRoute(app, prisma)
  registerPlanRoutes(app, prisma)
  registerSuperadminTenantsRoutes(app, prisma)
  registerSuperadminTenantConfigRoutes(app, prisma)
  registerSuperadminTenantPricingTrialsRoutes(app, prisma)
  registerSuperadminTenantPlanRoutes(app, prisma, ctx)
}
