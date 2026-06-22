import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { repartosAPI, type Reparto, type RepartoCloseSummary } from '@/lib/api'
import PodViewDialog from './PodViewDialog'

type Props = {
  reparto: Reparto
  canDispatch: boolean
  onUpdated: (reparto: Reparto) => void
}

export default function RepartosTrackingPanel({ reparto, canDispatch, onUpdated }: Props) {
  const { t } = useTranslation('repartos')
  const { t: tPod } = useTranslation('pod')
  const { hasModule } = useFeatureFlags()
  const podEnabled = hasModule('logistics.pod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closeSummary, setCloseSummary] = useState<RepartoCloseSummary | null>(null)
  const [podViewItemId, setPodViewItemId] = useState<number | null>(null)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const updated = await repartosAPI.iniciar(reparto.id)
      if (updated) onUpdated(updated)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('REPARTO_INVALID_STATE') ? t('errors.invalidState') : t('errors.start'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await repartosAPI.cerrar(reparto.id)
      if (result) {
        setCloseSummary(result.summary)
        onUpdated(result.reparto)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('REPARTO_INVALID_STATE') ? t('errors.invalidState') : t('errors.close'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="mt-6 rounded-lg border border-slate-200 dark:border-slate-600 p-4"
      aria-labelledby="repartos-tracking-title"
      data-testid="repartos-tracking-panel"
    >
      <h2 id="repartos-tracking-title" className="text-lg font-semibold mb-3">
        {t('tracking.title')} #{reparto.id}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
        {t(`estado.${reparto.estado}`)} · {reparto.chofer.username}
        {reparto.vehiculo ? ` · ${reparto.vehiculo}` : ''}
      </p>
      <p className="text-sm mb-4">
        {t('list.progress')}: {reparto.progress.delivered}/{reparto.progress.total}
      </p>

      <ol className="space-y-2 mb-4" data-testid="repartos-tracking-items">
        {reparto.items.map((item) => (
          <li
            key={item.id}
            className="text-sm border-b border-slate-100 dark:border-slate-700 pb-2 flex flex-wrap items-center gap-2 justify-between"
          >
            <span>
              <span className="font-mono text-xs text-slate-500 mr-2">{item.secuencia}.</span>
              {item.ordenEntrega.cliente?.rsocial ?? `#${item.ordenEntregaId}`}
              <span className="ml-2 text-slate-500">({t(`itemEstado.${item.estado}`)})</span>
              {podEnabled && item.hasPod && (
                <span
                  className="ml-2 text-xs font-medium text-green-700 dark:text-green-400"
                  data-testid={`reparto-item-pod-badge-${item.id}`}
                >
                  {tPod('podAvailable')}
                </span>
              )}
            </span>
            {podEnabled && item.hasPod && (
              <button
                type="button"
                className="text-xs text-blue-600 underline"
                onClick={() => setPodViewItemId(item.id)}
                data-testid={`reparto-view-pod-${item.id}`}
              >
                {tPod('viewPod')}
              </button>
            )}
          </li>
        ))}
      </ol>

      {closeSummary && (
        <p role="status" className="text-sm text-slate-700 dark:text-slate-300 mb-3" data-testid="repartos-close-summary">
          {t('tracking.summaryClose', { pending: closeSummary.pendingClosed })}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3" data-testid="repartos-tracking-error">
          {error}
        </p>
      )}

      {podViewItemId != null && (
        <PodViewDialog
          repartoId={reparto.id}
          itemId={podViewItemId}
          open
          onClose={() => setPodViewItemId(null)}
        />
      )}

      {canDispatch && (
        <div className="flex gap-2">
          {reparto.estado === 'planned' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleStart()}
              className="px-3 py-2 text-sm bg-green-700 text-white rounded disabled:opacity-50"
              data-testid="repartos-start-btn"
            >
              {t('actions.start')}
            </button>
          )}
          {reparto.estado === 'on_route' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleClose()}
              className="px-3 py-2 text-sm bg-amber-700 text-white rounded disabled:opacity-50"
              data-testid="repartos-close-btn"
            >
              {t('actions.close')}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
