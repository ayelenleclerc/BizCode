import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { comisionesAPI } from '@/lib/api'
import type { MisComisionesResponse } from '@bizcode/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

function currentPeriodo(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * @en Seller self-view for estimated and historical commissions (#237).
 * @es Vista propia del vendedor para comisión estimada e historial (#237).
 * @pt-BR Visão própria do vendedor para comissão estimada e histórico (#237).
 */
export default function ComisionesMiasPage() {
  const { t } = useTranslation('comisiones')
  const [periodo, setPeriodo] = useState(currentPeriodo())
  const [data, setData] = useState<MisComisionesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setData(await comisionesAPI.misComisiones(periodo))
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('errors.load')))
    } finally {
      setLoading(false)
    }
  }, [periodo, t])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="comisiones-mias-page">
        <header>
          <h1 className="text-xl font-semibold">{t('miasTitle')}</h1>
          <p className="text-sm text-slate-600">{t('miasSubtitle')}</p>
        </header>

        <label className="text-sm">
          {t('periodo')}
          <input
            className="mt-1 block rounded border px-2 py-1"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            pattern="\d{4}-\d{2}"
            data-testid="comisiones-mias-periodo"
          />
        </label>

        <AsyncWrapper loading={loading} error={loadError}>
          {data ? (
            <>
              <section data-testid="comisiones-estimacion">
                <h2 className="text-sm font-semibold">{t('estimacion')}</h2>
                <p data-testid="comisiones-est-total">
                  {t('totalComision')}: {data.estimacion.totalComision}
                </p>
                {data.estimacion.lineas.length === 0 ? (
                  <p>{t('emptyEstimacion')}</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.estimacion.lineas.map((l, idx) => (
                      <li key={`${l.facturaId ?? 'x'}-${idx}`}>
                        {l.concepto}: {l.comision}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section data-testid="comisiones-historial">
                <h2 className="mt-4 text-sm font-semibold">{t('historial')}</h2>
                {data.liquidaciones.length === 0 ? (
                  <p>{t('emptyLiquidaciones')}</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.liquidaciones.map((liq) => (
                      <li key={liq.id} data-testid={`comisiones-hist-${liq.id}`}>
                        {liq.periodo}: {liq.totalComision} ({t(`estados.${liq.estado}`)})
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
