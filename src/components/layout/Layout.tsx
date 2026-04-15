import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/rbac'

interface LayoutProps {
  children: React.ReactNode
}

/**
 * @en Nav sections and the roles that can see each one.
 *     `null` means visible to every authenticated user.
 * @es Secciones del nav y los roles que pueden verlas.
 *     `null` significa visible para todo usuario autenticado.
 * @pt-BR Seções do nav e os papéis que podem visualizá-las.
 *     `null` significa visível para todo usuário autenticado.
 */
const NAV_SECTIONS: {
  key: string
  path: string
  icon: string
  roles: readonly UserRole[] | null
}[] = [
  {
    key: 'inicio',
    path: '/inicio',
    icon: '🏠',
    roles: null,
  },
  {
    key: 'ventas',
    path: '/facturacion',
    icon: '💰',
    roles: ['owner', 'manager', 'seller', 'billing', 'cashier'],
  },
  {
    key: 'clientes',
    path: '/clientes',
    icon: '📋',
    roles: ['owner', 'manager', 'seller', 'backoffice', 'collections', 'finance', 'auditor'],
  },
  {
    key: 'catalogo',
    path: '/articulos',
    icon: '📦',
    roles: ['owner', 'manager', 'seller', 'backoffice', 'warehouse_op', 'warehouse_lead', 'logistics_planner'],
  },
  {
    key: 'logistica',
    path: '/logistica',
    icon: '🚚',
    roles: ['owner', 'manager', 'warehouse_op', 'warehouse_lead', 'logistics_planner', 'driver'],
  },
  {
    key: 'finanzas',
    path: '/finanzas',
    icon: '💹',
    roles: ['owner', 'manager', 'billing', 'cashier', 'collections', 'finance', 'auditor'],
  },
  {
    key: 'configuracion',
    path: '/users',
    icon: '⚙️',
    roles: ['owner', 'manager'],
  },
]

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common')
  const { logout, status, claims } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isDark, setIsDark] = useState(() => {
    // Lazy initializer: reads localStorage once at mount, no extra render
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [isDark])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const isActive = (path: string) => location.pathname === path

  const userRole = claims?.role ?? null
  const visibleSections = NAV_SECTIONS.filter(
    (s) => s.roles === null || (userRole !== null && s.roles.includes(userRole)),
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside
        className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col"
        aria-label={t('nav.main')}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('app.name')}</h1>
          {status === 'authenticated' && claims ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400" data-testid="auth-user-label">
              {t('auth.userLabel', { username: claims.username, role: claims.role })}
            </p>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label={t('nav.main')}>
          {visibleSections.map((section) => (
            <Link
              key={section.key}
              to={section.path}
              className={`flex items-center gap-3 px-4 py-3 rounded transition ${
                isActive(section.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span aria-hidden="true">{section.icon}</span>
              {t(`nav.${section.key}`)}
            </Link>
          ))}
        </nav>

        {/* Language, theme, session */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <LanguageSelect
            data-testid="layout-language"
            id="layout-language-select"
            className="w-full"
            selectClassName="w-full"
          />
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition text-slate-800 dark:text-slate-200"
            title={t('theme.toggleTitle')}
          >
            {isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
          </button>
          <button
            type="button"
            data-testid="logout-button"
            className="w-full px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition text-white"
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('app.tagline')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            💡 {t('shortcuts.title')}:{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">F2</kbd>{' '}
            {t('shortcuts.search')} •{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">F3</kbd>{' '}
            {t('shortcuts.new')} •{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">F5</kbd>{' '}
            {t('shortcuts.save')} •{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Esc</kbd>{' '}
            {t('shortcuts.cancel')} •{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">↑↓</kbd>{' '}
            {t('shortcuts.navigate')}
          </p>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  )
}
