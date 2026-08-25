import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { articulosAPI, type ReplenishmentForecastRow } from '@/lib/api'
import IfModule from '@/components/IfModule'

type Props = {
  articuloId: number
}

/**
 * @en Shows moving-average stock-out estimate on the article form (#198).
 * @es Muestra estimado de agotamiento (media móvil) en la ficha de artículo (#198).
 * @pt-BR Mostra estimativa de esgotamento (média móvel) na ficha do artigo (#198).
 */
export default function ArticuloReposicionForecastSection({ articuloId }: Props) {
  const { t } = useTranslation('articulos')
  const [row, setRow] = useState<ReplenishmentForecastRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    void articulosAPI
      .reposicionForecast(articuloId)
      .then((data) => {
        if (!cancelled) setRow(data)
      })
      .catch(() => {
        if (!cancelled) {
          setRow(null)
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [articuloId])

  return (
    <IfModule flag="logistics.purchases">
      <section
        className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
        aria-labelledby="articulo-reposicion-title"
        data-testid="articulo-reposicion-forecast"
      >
        <h3 id="articulo-reposicion-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {t('reposicionForecast.title')}
        </h3>
        {loading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="articulo-reposicion-loading">
            {t('reposicionForecast.loading')}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-amber-700 dark:text-amber-300" data-testid="articulo-reposicion-error">
            {t('reposicionForecast.error')}
          </p>
        ) : null}
        {!loading && !error && row?.status === 'insufficient_data' ? (
          <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="articulo-reposicion-insufficient">
            {t('reposicionForecast.insufficientData')}
          </p>
        ) : null}
        {!loading && !error && row?.status === 'ok' ? (
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1" data-testid="articulo-reposicion-ok">
            <li>
              {t('reposicionForecast.daysRemaining', {
                days: row.daysRemaining ?? '—',
              })}
            </li>
            <li>
              {t('reposicionForecast.suggestedQty', {
                qty: row.suggestedOrderQty ?? '—',
              })}
            </li>
            <li>
              {t('reposicionForecast.velocity', {
                velocity: row.velocityPerDay != null ? row.velocityPerDay.toFixed(2) : '—',
              })}
            </li>
          </ul>
        ) : null}
        <p className="mt-2 text-sm">
          <Link
            to="/catalogo/reposicion"
            className="text-blue-700 dark:text-blue-300 underline"
            data-testid="articulo-reposicion-link"
          >
            {t('reposicionForecast.openList')}
          </Link>
        </p>
      </section>
    </IfModule>
  )
}
