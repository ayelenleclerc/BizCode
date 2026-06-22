import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { repartosAPI, type Reparto, type RepartoItemRow } from '@/lib/api'
import DriverDeliveryWizard from './DriverDeliveryWizard'
import { useDriverLocationTracking } from './useDriverLocationTracking'

export default function ChoferRepartosPage() {
  const { claims } = useAuth()
  const { hasModule } = useFeatureFlags()
  const { t } = useTranslation('pod')
  const canDeliver = claims?.permissions.includes('orders.deliver.confirm') ?? false
  const podEnabled = hasModule('logistics.pod')

  if (!canDeliver || !podEnabled) {
    return (
      <div className="p-8" data-testid="chofer-repartos-forbidden">
        <p>{t('forbidden')}</p>
      </div>
    )
  }

  return <ChoferRepartosContent driverId={claims!.userId} />
}

function ChoferRepartosContent({ driverId }: { driverId: number }) {
  const { t } = useTranslation('pod')
  const { hasModule } = useFeatureFlags()
  const [reparto, setReparto] = useState<Reparto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wizardItem, setWizardItem] = useState<RepartoItemRow | null>(null)

  const loadRoute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await repartosAPI.list({ choferId: driverId, estado: 'on_route', limit: 5 })
      const first = res?.data?.[0] ?? null
      if (first) {
        const detail = await repartosAPI.get(first.id)
        setReparto(detail ?? first)
      } else {
        setReparto(null)
      }
    } catch {
      setError(t('errors.save'))
    } finally {
      setLoading(false)
    }
  }, [driverId, t])

  useEffect(() => {
    void loadRoute()
  }, [loadRoute])

  const gpsEnabled = hasModule('logistics.gps') && reparto?.estado === 'on_route'
  useDriverLocationTracking(reparto?.id ?? null, gpsEnabled)

  const pendingItems = reparto?.items.filter((i) => i.estado === 'pending') ?? []

  return (
    <div className="p-4 max-w-lg mx-auto" data-testid="chofer-repartos-page">
      <div className="mb-4">
        <Link to="/logistica" className="text-sm text-blue-600 underline">
          {t('back', { defaultValue: 'Logística' })}
        </Link>
        <h1 className="text-xl font-bold mt-2">{t('choferTitle')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('choferSubtitle')}</p>
      </div>

      {loading && (
        <p role="status" aria-busy="true">
          …
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
      {!loading && !reparto && <p data-testid="chofer-no-route">{t('noRoute')}</p>}

      {reparto && (
        <>
          <p className="text-sm mb-3">
            Reparto #{reparto.id} · {reparto.progress.delivered}/{reparto.progress.total}
          </p>
          <ol className="space-y-3">
            {pendingItems.map((item) => (
              <li
                key={item.id}
                className="border rounded p-3 flex justify-between items-center gap-2 dark:border-slate-600"
                data-testid={`chofer-item-${item.id}`}
              >
                <span className="text-sm">
                  <span className="font-mono text-xs mr-2">{item.secuencia}.</span>
                  {item.ordenEntrega.cliente?.rsocial ?? `#${item.ordenEntregaId}`}
                </span>
                <button
                  type="button"
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded shrink-0"
                  onClick={() => setWizardItem(item)}
                  data-testid={`chofer-confirm-${item.id}`}
                >
                  {t('confirm')}
                </button>
              </li>
            ))}
          </ol>
          {pendingItems.length === 0 && (
            <p className="text-sm text-slate-500">{t('noRoute')}</p>
          )}
        </>
      )}

      {wizardItem && reparto && (
        <DriverDeliveryWizard
          repartoId={reparto.id}
          item={wizardItem}
          open
          onClose={() => setWizardItem(null)}
          onSaved={() => {
            setWizardItem(null)
            void loadRoute()
          }}
        />
      )}
    </div>
  )
}
