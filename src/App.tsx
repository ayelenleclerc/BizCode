import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/layout/Layout'
import ClientesPage from './pages/clientes'
import ArticulosPage from './pages/articulos'
import FacturacionPage from './pages/facturacion'
import LoginPage from './pages/login'
import UsersPage from './pages/users'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900" role="status" aria-busy="true">
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

function LoginRoute() {
  const { status } = useAuth()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900" role="status" aria-busy="true">
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/clientes" replace />
  }
  return <LoginPage />
}

function RootRedirect() {
  const { status } = useAuth()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900" role="status" aria-busy="true">
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/clientes" replace />
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
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="articulos" element={<ArticulosPage />} />
          <Route path="facturacion" element={<FacturacionPage />} />
          <Route path="users" element={<UsersPage />} />
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
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
