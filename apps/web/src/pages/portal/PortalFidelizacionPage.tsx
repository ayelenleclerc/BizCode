import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { portalAPI } from '@/lib/portalApi'
import type { PortalFidelizacionSummary } from '@bizcode/types'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

function money(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * @en Portal page showing loyalty points balance (#250).
 * @es Página del portal con saldo de puntos de fidelización (#250).
 * @pt-BR Página do portal com saldo de pontos de fidelização (#250).
 */
export default function PortalFidelizacionPage() {
  const { t } = useTranslation(['portal', 'fidelizacion'])
  const { tenantSlug } = usePortalAuth()
  const [data, setData] = useState<PortalFidelizacionSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void portalAPI
      .getFidelizacion(tenantSlug)
      .then((summary) => {
        if (!cancelled) {
          setData(summary)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'loadError')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tenantSlug])

  return (
    <section aria-labelledby="portal-fidelizacion-title" data-testid="portal-fidelizacion-page">
      <h1
        id="portal-fidelizacion-title"
        className="text-2xl font-semibold text-slate-900 dark:text-slate-100"
      >
        {t('portal:nav.fidelizacion')}
      </h1>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">…</p>
      ) : error ? (
        <p role="alert" className="mt-4 text-sm text-red-600" data-testid="portal-fidelizacion-error">
          {error}
        </p>
      ) : data ? (
        <div className="mt-6 space-y-3 rounded border border-slate-200 p-4 dark:border-slate-600">
          {!data.programaActivo ? (
            <p className="text-sm text-slate-500" data-testid="portal-fidelizacion-inactive">
              {t('fidelizacion:factura.inactive')}
            </p>
          ) : (
            <>
              {data.nombrePrograma ? (
                <p className="text-sm text-slate-500">{data.nombrePrograma}</p>
              ) : null}
              <p className="text-3xl font-semibold tabular-nums" data-testid="portal-fidelizacion-puntos">
                {data.puntos}
              </p>
              <p className="text-sm" data-testid="portal-fidelizacion-equiv">
                {t('fidelizacion:cliente.equivalente')}: {money(data.equivalenteDinero)}
              </p>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
