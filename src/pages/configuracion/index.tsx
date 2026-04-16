import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const TILES = [
  { key: 'users', path: '/users', icon: '👥' },
  { key: 'zonasEntrega', path: '/configuracion/zonas-entrega', icon: '📍' },
] as const

export default function ConfiguracionPage() {
  const { t } = useTranslation('common')

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        {t('nav.configuracion')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            to={tile.path}
            className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition"
          >
            <span className="text-3xl" aria-hidden="true">{tile.icon}</span>
            <span className="text-base font-medium text-slate-800 dark:text-slate-200">
              {t(`nav.${tile.key}`)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
