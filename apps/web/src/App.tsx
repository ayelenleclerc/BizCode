import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/layout/Layout'
import ModuleRoute from './components/ModuleRoute'
import ClientesPage from './pages/clientes'
import ArticulosPage from './pages/articulos'
import ProveedoresPage from './pages/proveedores'
import ComprasPage from './pages/compras'
import RecuentosPage from './pages/recuentos'
import FacturacionPage from './pages/facturacion'
import LoginPage from './pages/login'
import PrivacyPage from './pages/privacidad'
import UsersPage from './pages/users'
import InicioPage from './pages/inicio'
import LogisticaPage from './pages/logistica'
import RepartosPage from './pages/logistica/repartos'
import ChoferRepartosPage from './pages/logistica/repartos/chofer'
import PickingPage from './pages/logistica/picking'
import SeguimientoPage from './pages/logistica/seguimiento'
import FinanzasPage from './pages/finanzas'
import ReconciliacionMpPage from './pages/finanzas/ReconciliacionMpPage'
import ContracargosMpPage from './pages/finanzas/ContracargosMpPage'
import CobrosPage from './pages/cobros'
import PedidosPage from './pages/pedidos'
import ContratosPage from './pages/contratos'
import OrdenesTrabajoPage from './pages/ordenes-trabajo'
import GarantiasPage from './pages/garantias'
import FidelizacionPage from './pages/fidelizacion'
import LotesPage from './pages/lotes'
import CajaPage from './pages/caja'
import ListasPreciosPage from './pages/listas-precios'
import CategoriasArticuloPage from './pages/categorias-articulo'
import DepositosPage from './pages/depositos'
import TransferenciasDepositoPage from './pages/transferencias-deposito'
import ComisionesConfigPage from './pages/comisiones/config'
import ComisionesLiquidacionesPage from './pages/comisiones/liquidaciones'
import ComisionesMiasPage from './pages/comisiones/mias'
import ImportacionesPage from './pages/importaciones'
import TiposCambioPage from './pages/tipos-cambio'
import FormulasProduccionPage from './pages/formulas-produccion'
import OrdenesProduccionPage from './pages/ordenes-produccion'
import ReportesPage from './pages/reportes'
import ConfiguracionPage from './pages/configuracion'
import ZonasEntregaPage from './pages/configuracion/ZonasEntregaPage'
import EmpresaPage from './pages/configuracion/EmpresaPage'
import SeguridadPage from './pages/configuracion/SeguridadPage'
import { PortalAuthProvider } from './contexts/PortalAuthContext'
import PortalLayout from './pages/portal/PortalLayout'
import PortalLoginPage from './pages/portal/PortalLoginPage'
import PortalVerifyPage from './pages/portal/PortalVerifyPage'
import PortalProtectedRoute from './pages/portal/PortalProtectedRoute'
import PortalFacturasPage from './pages/portal/PortalFacturasPage'
import PortalCuentaCorrientePage from './pages/portal/PortalCuentaCorrientePage'
import PortalPedidosPage from './pages/portal/PortalPedidosPage'
import PortalMisDatosPage from './pages/portal/PortalMisDatosPage'
import PortalFidelizacionPage from './pages/portal/PortalFidelizacionPage'
import ChatPage from './pages/chat'
import AuditLogPage from './pages/admin/audit-log'
import SuperAdminRoute from './components/SuperAdminRoute'
import SuperadminHomePage from './pages/superadmin'
import TenantDetailPage from './pages/superadmin/TenantDetailPage'
import TenantModulesPage from './pages/superadmin/TenantModulesPage'
import SecurityEventsPage from './pages/superadmin/SecurityEventsPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FeatureFlagsProvider, FeatureFlagsGate } from './contexts/FeatureFlagsContext'
import { PlanProvider } from './contexts/PlanContext'

function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"
        role="status"
        aria-busy="true"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return (
    <FeatureFlagsGate>
      <Outlet />
    </FeatureFlagsGate>
  )
}

function LoginRoute() {
  const { status } = useAuth()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"
        role="status"
        aria-busy="true"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/inicio" replace />
  }
  return <LoginPage />
}

function RootRedirect() {
  const { status } = useAuth()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"
        role="status"
        aria-busy="true"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/inicio" replace />
  }
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route
        path="/portal/:tenantSlug"
        element={
          <PortalAuthProvider>
            <PortalLayout />
          </PortalAuthProvider>
        }
      >
        <Route path="login" element={<PortalLoginPage />} />
        <Route path="auth/verify" element={<PortalVerifyPage />} />
        <Route element={<PortalProtectedRoute />}>
          <Route index element={<Navigate to="facturas" replace />} />
          <Route path="facturas" element={<PortalFacturasPage />} />
          <Route path="cuenta-corriente" element={<PortalCuentaCorrientePage />} />
          <Route path="pedidos" element={<PortalPedidosPage />} />
          <Route path="fidelizacion" element={<PortalFidelizacionPage />} />
          <Route path="mis-datos" element={<PortalMisDatosPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="inicio" element={<InicioPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="articulos" element={<ArticulosPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route
            path="compras"
            element={
              <ModuleRoute moduleKey="logistics.purchases">
                <ComprasPage />
              </ModuleRoute>
            }
          />
          <Route
            path="recuentos"
            element={
              <ModuleRoute moduleKey="inventory.count">
                <RecuentosPage />
              </ModuleRoute>
            }
          />
          <Route path="facturacion" element={<FacturacionPage />} />
          <Route
            path="pedidos"
            element={
              <ModuleRoute moduleKey="billing.orders">
                <PedidosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="contratos"
            element={
              <ModuleRoute moduleKey="service.contracts">
                <ContratosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="ordenes-trabajo"
            element={
              <ModuleRoute moduleKey="service.orders">
                <OrdenesTrabajoPage />
              </ModuleRoute>
            }
          />
          <Route
            path="garantias"
            element={
              <ModuleRoute moduleKey="service.warranties">
                <GarantiasPage />
              </ModuleRoute>
            }
          />
          <Route
            path="fidelizacion"
            element={
              <ModuleRoute moduleKey="clients.loyalty">
                <FidelizacionPage />
              </ModuleRoute>
            }
          />
          <Route
            path="lotes"
            element={
              <ModuleRoute moduleKey="inventory.fefo">
                <LotesPage />
              </ModuleRoute>
            }
          />
          <Route
            path="caja"
            element={
              <ModuleRoute moduleKey="pos.cashier">
                <CajaPage />
              </ModuleRoute>
            }
          />
          <Route
            path="listas-precios"
            element={
              <ModuleRoute moduleKey="catalog.pricelists">
                <ListasPreciosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="categorias-articulo"
            element={
              <ModuleRoute moduleKey="catalog.variants">
                <CategoriasArticuloPage />
              </ModuleRoute>
            }
          />
          <Route
            path="depositos"
            element={
              <ModuleRoute moduleKey="inventory.warehouses">
                <DepositosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="transferencias-deposito"
            element={
              <ModuleRoute moduleKey="inventory.warehouses">
                <TransferenciasDepositoPage />
              </ModuleRoute>
            }
          />
          <Route
            path="comisiones/config"
            element={
              <ModuleRoute moduleKey="finance.commissions">
                <ComisionesConfigPage />
              </ModuleRoute>
            }
          />
          <Route
            path="comisiones/liquidaciones"
            element={
              <ModuleRoute moduleKey="finance.commissions">
                <ComisionesLiquidacionesPage />
              </ModuleRoute>
            }
          />
          <Route
            path="comisiones/mias"
            element={
              <ModuleRoute moduleKey="finance.commissions">
                <ComisionesMiasPage />
              </ModuleRoute>
            }
          />
          <Route
            path="importaciones"
            element={
              <ModuleRoute moduleKey="platform.data_import">
                <ImportacionesPage />
              </ModuleRoute>
            }
          />
          <Route
            path="tipos-cambio"
            element={
              <ModuleRoute moduleKey="catalog.multicurrency">
                <TiposCambioPage />
              </ModuleRoute>
            }
          />
          <Route
            path="formulas-produccion"
            element={
              <ModuleRoute moduleKey="production.bom">
                <FormulasProduccionPage />
              </ModuleRoute>
            }
          />
          <Route
            path="ordenes-produccion"
            element={
              <ModuleRoute moduleKey="production.orders">
                <OrdenesProduccionPage />
              </ModuleRoute>
            }
          />
          <Route path="users" element={<UsersPage />} />
          <Route
            path="logistica"
            element={
              <ModuleRoute moduleKey="logistics.dispatches">
                <LogisticaPage />
              </ModuleRoute>
            }
          />
          <Route
            path="logistica/picking"
            element={
              <ModuleRoute moduleKey="logistics.picking">
                <PickingPage />
              </ModuleRoute>
            }
          />
          <Route
            path="logistica/seguimiento"
            element={
              <ModuleRoute moduleKey="logistics.gps">
                <SeguimientoPage />
              </ModuleRoute>
            }
          />
          <Route
            path="logistica/repartos"
            element={
              <ModuleRoute moduleKey="logistics.dispatches">
                <RepartosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="logistica/repartos/chofer"
            element={
              <ModuleRoute moduleKey="logistics.dispatches">
                <ChoferRepartosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="finanzas"
            element={
              <ModuleRoute moduleKey="finance.collections">
                <FinanzasPage />
              </ModuleRoute>
            }
          />
          <Route
            path="finanzas/reconciliacion-mp"
            element={
              <ModuleRoute moduleKey="finance.collections">
                <ReconciliacionMpPage />
              </ModuleRoute>
            }
          />
          <Route
            path="finanzas/contracargos-mp"
            element={
              <ModuleRoute moduleKey="finance.collections">
                <ContracargosMpPage />
              </ModuleRoute>
            }
          />
          <Route
            path="cobros"
            element={
              <ModuleRoute moduleKey="finance.collections">
                <CobrosPage />
              </ModuleRoute>
            }
          />
          <Route
            path="reportes"
            element={
              <ModuleRoute moduleKey="analytics.dashboard">
                <ReportesPage />
              </ModuleRoute>
            }
          />
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="configuracion/zonas-entrega" element={<ZonasEntregaPage />} />
          <Route path="configuracion/empresa" element={<EmpresaPage />} />
          <Route path="configuracion/seguridad" element={<SeguridadPage />} />
          <Route
            path="chat"
            element={
              <ModuleRoute moduleKey="comms.chat">
                <ChatPage />
              </ModuleRoute>
            }
          />
          <Route
            path="admin/audit-log"
            element={
              <ModuleRoute moduleKey="admin.audit_log">
                <AuditLogPage />
              </ModuleRoute>
            }
          />
          <Route element={<SuperAdminRoute />}>
            <Route path="superadmin" element={<SuperadminHomePage />} />
            <Route path="superadmin/security" element={<SecurityEventsPage />} />
            <Route path="superadmin/tenants/:tenantId" element={<TenantDetailPage />} />
            <Route path="superadmin/tenants/:tenantId/modules" element={<TenantModulesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <FeatureFlagsProvider>
        <PlanProvider>
          <Router>
            <AppRoutes />
          </Router>
        </PlanProvider>
      </FeatureFlagsProvider>
    </AuthProvider>
  )
}

export default App
