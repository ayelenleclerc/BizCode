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
import { registerComprobanteCompraRoutes } from './routes/registerComprobanteCompraRoutes'
import { registerDocumentoCompraRoutes } from './routes/registerDocumentoCompraRoutes'
import { registerFiscalRetencionesRoutes } from './routes/registerFiscalRetencionesRoutes'
import { registerFiscalPresentacionesRoutes } from './routes/registerFiscalPresentacionesRoutes'
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
import { registerSuperadminSecurityRoutes } from './routes/registerSuperadminSecurityRoutes'
import { registerProveedoresRoutes } from './routes/registerProveedoresRoutes'
import { registerProveedorCuentaCorrienteRoutes } from './routes/registerProveedorCuentaCorrienteRoutes'
import { registerClienteCuentaCorrienteRoutes } from './routes/registerClienteCuentaCorrienteRoutes'
import { registerReciboPagoRoutes } from './routes/registerReciboPagoRoutes'
import { registerReciboCobroRoutes } from './routes/registerReciboCobroRoutes'
import { registerProveedorAlertasRoutes } from './routes/registerProveedorAlertasRoutes'
import { registerProveedorHistorialRoutes } from './routes/registerProveedorHistorialRoutes'
import { registerProveedorCatalogoRoutes } from './routes/registerProveedorCatalogoRoutes'
import { registerArticuloProveedoresComparadorRoutes } from './routes/registerArticuloProveedoresComparadorRoutes'
import { registerRubrosRoutes } from './routes/registerRubrosRoutes'
import type { RestRouteContext } from './routes/restRouteTypes'
import { registerZonasEntregaRoutes } from './routes/registerZonasEntregaRoutes'
import { registerOrdenesEntregaRoutes } from './routes/registerOrdenesEntregaRoutes'
import { registerShippingCarrierRoutes } from './routes/registerShippingCarrierRoutes'
import { registerLogisticaReportesRoutes } from './routes/registerLogisticaReportesRoutes'
import { registerRepartosRoutes } from './routes/registerRepartosRoutes'
import { registerArcaRoutes } from './routes/registerArcaRoutes'
import { registerCobranzasRoutes } from './routes/registerCobranzasRoutes'
import { registerPedidosRoutes } from './routes/registerPedidosRoutes'
import { registerRemitosRoutes } from './routes/registerRemitosRoutes'
import { registerChequesRoutes } from './routes/registerChequesRoutes'
import { registerBancosRoutes } from './routes/registerBancosRoutes'
import { registerBancosConciliacionRoutes } from './routes/registerBancosConciliacionRoutes'
import { registerEmpresaRoutes } from './routes/registerEmpresaRoutes'
import { registerPortalRoutes } from './routes/registerPortalRoutes'
import { registerMercadoPagoReconciliationRoutes } from './routes/registerMercadoPagoReconciliationRoutes'
import { registerMercadoPagoRoutes } from './routes/registerMercadoPagoRoutes'
import { registerMercadoPagoFacturaRoutes } from './routes/registerMercadoPagoFacturaRoutes'
import { registerMercadoPagoRefundRoutes } from './routes/registerMercadoPagoRefundRoutes'
import { registerMercadoPagoWebhookRoutes } from './routes/registerMercadoPagoWebhookRoutes'
import { registerMeliOAuthRoutes } from './routes/registerMeliOAuthRoutes'
import { registerMeliCatalogRoutes } from './routes/registerMeliCatalogRoutes'
import { registerMeliOrdersRoutes } from './routes/registerMeliOrdersRoutes'
import { registerEcommerceSyncRoutes } from './routes/registerEcommerceSyncRoutes'
import { registerMeliWebhookRoutes } from './routes/registerMeliWebhookRoutes'
import { registerTiendanubeOAuthRoutes } from './routes/registerTiendanubeOAuthRoutes'
import { registerTiendanubeCatalogRoutes } from './routes/registerTiendanubeCatalogRoutes'
import { registerTiendanubeOrdersRoutes } from './routes/registerTiendanubeOrdersRoutes'
import { registerTiendanubeWebhookRoutes } from './routes/registerTiendanubeWebhookRoutes'
import { registerWooCommerceConfigRoutes } from './routes/registerWooCommerceConfigRoutes'
import { registerWooCommerceCatalogRoutes } from './routes/registerWooCommerceCatalogRoutes'
import { registerWooCommerceOrdersRoutes } from './routes/registerWooCommerceOrdersRoutes'
import { registerWooCommerceWebhookRoutes } from './routes/registerWooCommerceWebhookRoutes'
import { registerPrintingRoutes } from './routes/registerPrintingRoutes'
import { registerContratosRoutes } from './routes/registerContratosRoutes'
import { registerOrdenTrabajoRoutes } from './routes/registerOrdenTrabajoRoutes'
import { registerGarantiasRoutes } from './routes/registerGarantiasRoutes'
import { registerFidelizacionRoutes } from './routes/registerFidelizacionRoutes'
import { registerLotesRoutes } from './routes/registerLotesRoutes'
import { registerCajaRoutes } from './routes/registerCajaRoutes'
import { registerListasPreciosRoutes } from './routes/registerListasPreciosRoutes'
import { registerCategoriasArticuloRoutes } from './routes/registerCategoriasArticuloRoutes'
import { registerArticuloVariantesRoutes } from './routes/registerArticuloVariantesRoutes'
import { registerDepositosRoutes } from './routes/registerDepositosRoutes'
import { registerComisionesRoutes } from './routes/registerComisionesRoutes'
import { registerImportacionesRoutes } from './routes/registerImportacionesRoutes'
import { registerTiposCambioRoutes } from './routes/registerTiposCambioRoutes'
import { registerFormulasProduccionRoutes } from './routes/registerFormulasProduccionRoutes'
import { registerOrdenesProduccionRoutes } from './routes/registerOrdenesProduccionRoutes'
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

  registerMercadoPagoWebhookRoutes(app, ctx)
  registerMeliOAuthRoutes(app, ctx)
  registerMeliCatalogRoutes(app, ctx)
  registerMeliOrdersRoutes(app, ctx)
  registerEcommerceSyncRoutes(app, ctx)
  registerMeliWebhookRoutes(app, ctx)
  registerTiendanubeOAuthRoutes(app, ctx)
  registerTiendanubeCatalogRoutes(app, ctx)
  registerTiendanubeOrdersRoutes(app, ctx)
  registerTiendanubeWebhookRoutes(app, ctx)
  registerWooCommerceConfigRoutes(app, ctx)
  registerWooCommerceCatalogRoutes(app, ctx)
  registerWooCommerceOrdersRoutes(app, ctx)
  registerWooCommerceWebhookRoutes(app, ctx)
  registerClientesRoutes(app, ctx)
  registerClienteCuentaCorrienteRoutes(app, ctx)
  registerArticuloVariantesRoutes(app, ctx)
  registerArticulosRoutes(app, ctx)
  registerRubrosRoutes(app, ctx)
  registerProveedorAlertasRoutes(app, ctx)
  registerArticuloProveedoresComparadorRoutes(app, ctx)
  registerProveedoresRoutes(app, ctx)
  registerProveedorCuentaCorrienteRoutes(app, ctx)
  registerProveedorHistorialRoutes(app, ctx)
  registerProveedorCatalogoRoutes(app, ctx)
  registerReciboPagoRoutes(app, ctx)
  registerReciboCobroRoutes(app, ctx)
  registerComprasRoutes(app, ctx)
  registerRecuentosRoutes(app, ctx)
  registerFormasPagoRoutes(app, ctx)
  registerFacturasRoutes(app, ctx)
  registerNotasCreditoRoutes(app, ctx)
  registerArcaRoutes(app, ctx)
  registerPedidosRoutes(app, ctx)
  registerContratosRoutes(app, ctx)
  registerOrdenTrabajoRoutes(app, ctx)
  registerGarantiasRoutes(app, ctx)
  registerFidelizacionRoutes(app, ctx)
  registerLotesRoutes(app, ctx)
  registerCajaRoutes(app, ctx)
  registerListasPreciosRoutes(app, ctx)
  registerCategoriasArticuloRoutes(app, ctx)
  registerDepositosRoutes(app, ctx)
  registerComisionesRoutes(app, ctx)
  registerImportacionesRoutes(app, ctx)
  registerTiposCambioRoutes(app, ctx)
  registerFormulasProduccionRoutes(app, ctx)
  registerOrdenesProduccionRoutes(app, ctx)
  registerRemitosRoutes(app, ctx)
  registerChequesRoutes(app, ctx)
  registerBancosRoutes(app, ctx)
  registerBancosConciliacionRoutes(app, ctx)
  registerCobrosRoutes(app, ctx)
  registerCobranzasRoutes(app, ctx)
  registerReportesRoutes(app, ctx)
  registerComprobanteCompraRoutes(app, ctx)
  registerDocumentoCompraRoutes(app, ctx)
  registerFiscalRetencionesRoutes(app, ctx)
  registerFiscalPresentacionesRoutes(app, ctx)
  registerContabilidadRoutes(app, ctx)
  registerZonasEntregaRoutes(app, ctx)
  registerOrdenesEntregaRoutes(app, ctx)
  registerShippingCarrierRoutes(app, ctx)
  registerRepartosRoutes(app, ctx)
  registerLogisticaReportesRoutes(app, ctx)
  registerEmpresaRoutes(app, ctx)
  registerPortalRoutes(app, ctx)
  registerMercadoPagoRoutes(app, ctx)
  registerMercadoPagoFacturaRoutes(app, ctx)
  registerMercadoPagoReconciliationRoutes(app, ctx)
  registerMercadoPagoRefundRoutes(app, ctx)
  registerPrintingRoutes(app)
  registerHealthRoute(app, ctx)
  registerModulesCatalogRoute(app, ctx)
  registerMeFeaturesRoute(app, prisma)
  registerPlanRoutes(app, prisma)
  registerSuperadminTenantsRoutes(app, prisma)
  registerSuperadminSecurityRoutes(app, prisma)
  registerSuperadminTenantConfigRoutes(app, prisma)
  registerSuperadminTenantPricingTrialsRoutes(app, prisma)
  registerSuperadminTenantPlanRoutes(app, prisma, ctx)
}
