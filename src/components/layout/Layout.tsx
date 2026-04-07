import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common')
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    // Lazy initializer: reads localStorage once at mount, no extra render
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })
  const location = useLocation()

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

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col" aria-label={t('nav.clientes') + ' / ' + t('nav.articulos') + ' / ' + t('nav.facturacion')}>
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('app.name')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('app.version')}</p>
          {status === 'authenticated' && claims ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400" data-testid="auth-user-label">
              {t('auth.userLabel', { username: claims.username, role: claims.role })}
            </p>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" aria-label={t('nav.main')}>
          <Link
            to="/clientes"
            className={`block px-4 py-3 rounded transition ${
              isActive('/clientes')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            📋 {t('nav.clientes')}
          </Link>
          <Link
            to="/articulos"
            className={`block px-4 py-3 rounded transition ${
              isActive('/articulos')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            📦 {t('nav.articulos')}
          </Link>
          <Link
            to="/facturacion"
            className={`block px-4 py-3 rounded transition ${
              isActive('/facturacion')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            🧾 {t('nav.facturacion')}
          </Link>
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
            onClick={() => {
              void logout()
            }}
            className="w-full mb-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition text-white"
            data-testid="logout-button"
          >
            {t('auth.logout')}
          </button>
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
            data-testid="layout-logout"
            className="w-full px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition text-slate-800 dark:text-slate-200"
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            {t('session.logout')}
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
            💡 {t('shortcuts.title')}: <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">F2</kbd> {t('shortcuts.search')} •
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs ml-1">F3</kbd> {t('shortcuts.new')} •
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs ml-1">F5</kbd> {t('shortcuts.save')} •
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs ml-1">Esc</kbd> {t('shortcuts.cancel')} •
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs ml-1">↑↓</kbd> {t('shortcuts.navigate')}
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
