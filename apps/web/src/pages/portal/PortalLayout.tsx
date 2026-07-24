import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    'rounded px-3 py-2 text-sm font-medium',
    isActive
      ? 'bg-white/20 text-white'
      : 'text-white/80 hover:bg-white/10 hover:text-white',
  ].join(' ')
}

/**
 * @en Customer portal shell with tenant branding and section navigation (#240).
 * @es Shell del portal del cliente con branding del tenant y navegación (#240).
 * @pt-BR Shell do portal do cliente com branding do tenant e navegação (#240).
 */
export default function PortalLayout() {
  const { t } = useTranslation('portal')
  const { tenantSlug, branding, me, logout, status } = usePortalAuth()
  const navigate = useNavigate()
  const accent = branding?.primaryColor ?? '#2563eb'

  const handleLogout = async () => {
    await logout()
    navigate(`/portal/${tenantSlug}/login`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" data-testid="portal-layout">
      <header
        className="border-b border-white/10 text-white"
        style={{ backgroundColor: accent }}
        data-testid="portal-header"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt=""
                className="h-10 w-auto max-w-[120px] object-contain"
                data-testid="portal-logo"
              />
            ) : null}
            <div>
              <p className="text-lg font-semibold">{branding?.tenantName ?? tenantSlug}</p>
              {me ? (
                <p className="text-sm text-white/80" data-testid="portal-cliente-name">
                  {me.rsocial}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelect />
            {status === 'authenticated' ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
                data-testid="portal-logout"
              >
                {t('actions.logout')}
              </button>
            ) : null}
          </div>
        </div>
        {status === 'authenticated' ? (
          <nav
            className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 pb-3"
            aria-label={t('nav.aria')}
            data-testid="portal-nav"
          >
            <NavLink to={`/portal/${tenantSlug}/facturas`} className={navClassName}>
              {t('nav.facturas')}
            </NavLink>
            <NavLink to={`/portal/${tenantSlug}/cuenta-corriente`} className={navClassName}>
              {t('nav.cuentaCorriente')}
            </NavLink>
            {branding?.showPedidos !== false ? (
              <NavLink to={`/portal/${tenantSlug}/pedidos`} className={navClassName}>
                {t('nav.pedidos')}
              </NavLink>
            ) : null}
            <NavLink to={`/portal/${tenantSlug}/fidelizacion`} className={navClassName}>
              {t('nav.fidelizacion')}
            </NavLink>
            <NavLink to={`/portal/${tenantSlug}/mis-datos`} className={navClassName}>
              {t('nav.misDatos')}
            </NavLink>
          </nav>
        ) : null}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      {branding?.footerText ? (
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-sm text-slate-500">
          {branding.footerText}
        </footer>
      ) : null}
    </div>
  )
}
