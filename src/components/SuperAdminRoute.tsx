import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

/**
 * @en Restricts routes to platform super_admin role (#137).
 * @es Restringe rutas al rol super_admin de plataforma (#137).
 * @pt-BR Restringe rotas ao papel super_admin de plataforma (#137).
 */
export default function SuperAdminRoute() {
  const { claims, status } = useAuth()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
        data-testid="superadmin-loading"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }

  if (claims?.role !== 'super_admin') {
    return <Navigate to="/inicio" replace />
  }

  return <Outlet />
}
