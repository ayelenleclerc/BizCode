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
import UsersPage from './pages/users'
import InicioPage from './pages/inicio'
import LogisticaPage from './pages/logistica'
import RepartosPage from './pages/logistica/repartos'
import FinanzasPage from './pages/finanzas'
import CobrosPage from './pages/cobros'
import PedidosPage from './pages/pedidos'
import ReportesPage from './pages/reportes'
import ConfiguracionPage from './pages/configuracion'
import ZonasEntregaPage from './pages/configuracion/ZonasEntregaPage'
import EmpresaPage from './pages/configuracion/EmpresaPage'
import ChatPage from './pages/chat'
import AuditLogPage from './pages/admin/audit-log'
import SuperAdminRoute from './components/SuperAdminRoute'
import SuperadminHomePage from './pages/superadmin'
import TenantDetailPage from './pages/superadmin/TenantDetailPage'
import TenantModulesPage from './pages/superadmin/TenantModulesPage'
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
            path="logistica/repartos"
            element={
              <ModuleRoute moduleKey="logistics.dispatches">
                <RepartosPage />
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
