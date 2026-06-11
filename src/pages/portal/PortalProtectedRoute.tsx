import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

export default function PortalProtectedRoute() {
  const { status, tenantSlug } = usePortalAuth()
  const location = useLocation()
  const { t } = useTranslation('common')

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
        data-testid="portal-auth-loading"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to={`/portal/${tenantSlug}/login`} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
