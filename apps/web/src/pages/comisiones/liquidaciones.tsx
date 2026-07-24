import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { comisionesAPI } from '@/lib/api'
import type { ComisionRankingRow, LiquidacionComisionRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

function currentPeriodo(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * @en Manager UI for monthly commission settlements and ranking (#237).
 * @es UI de manager para liquidaciones mensuales y ranking (#237).
 * @pt-BR UI de gestor para liquidações mensais e ranking (#237).
 */
export default function ComisionesLiquidacionesPage() {
  const { t } = useTranslation('comisiones')
  const [periodo, setPeriodo] = useState(currentPeriodo())
  const [rows, setRows] = useState<LiquidacionComisionRow[]>([])
  const [ranking, setRanking] = useState<ComisionRankingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [list, rank] = await Promise.all([
        comisionesAPI.listLiquidaciones({ take: 100, periodo }),
        comisionesAPI.ranking(periodo),
      ])
      setRows(list?.data ?? [])
      setRanking(rank ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('errors.load')))
    } finally {
      setLoading(false)
    }
  }, [periodo, t])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (fn: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await fn()
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.action'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="comisiones-liquidaciones-page">
        <header>
          <h1 className="text-xl font-semibold">{t('liquidacionesTitle')}</h1>
          <p className="text-sm text-slate-600">{t('liquidacionesSubtitle')}</p>
        </header>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="comisiones-liq-error">
            {actionError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            {t('periodo')}
            <input
              className="mt-1 block rounded border px-2 py-1"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              pattern="\d{4}-\d{2}"
              data-testid="comisiones-periodo"
            />
          </label>
          <CanAccess permission="commissions.manage">
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-2 text-white"
              onClick={() => void run(() => comisionesAPI.generarLiquidaciones({ periodo }))}
              data-testid="comisiones-generar"
            >
              {t('generar')}
            </button>
          </CanAccess>
        </div>

        <AsyncWrapper loading={loading} error={loadError}>
          <section>
            <h2 className="mb-2 text-sm font-semibold">{t('ranking')}</h2>
            {ranking.length === 0 ? (
              <p data-testid="comisiones-ranking-empty">{t('emptyLiquidaciones')}</p>
            ) : (
              <ul className="mb-4 space-y-1 text-sm" data-testid="comisiones-ranking">
                {ranking.map((r) => (
                  <li key={r.vendedorId} data-testid={`comisiones-rank-${r.vendedorId}`}>
                    {r.vendedorUsername}: {r.totalComision}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {rows.length === 0 ? (
            <p data-testid="comisiones-liq-empty">{t('emptyLiquidaciones')}</p>
          ) : (
            <table className="min-w-full text-left text-sm" data-testid="comisiones-liq-table">
              <thead>
                <tr>
                  <th>{t('vendedorId')}</th>
                  <th>{t('totalVentas')}</th>
                  <th>{t('totalComision')}</th>
                  <th>{t('estado')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} data-testid={`comisiones-liq-row-${row.id}`}>
                    <td>{row.vendedorUsername ?? row.vendedorId}</td>
                    <td>{row.totalVentas}</td>
                    <td>{row.totalComision}</td>
                    <td>{t(`estados.${row.estado}`)}</td>
                    <td className="space-x-2">
                      {row.estado === 'borrador' ? (
                        <CanAccess permission="commissions.approve">
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void run(() => comisionesAPI.aprobarLiquidacion(row.id))}
                            data-testid={`comisiones-aprobar-${row.id}`}
                          >
                            {t('aprobar')}
                          </button>
                        </CanAccess>
                      ) : null}
                      {row.estado === 'aprobada' ? (
                        <CanAccess permission="commissions.approve">
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void run(() => comisionesAPI.pagarLiquidacion(row.id))}
                            data-testid={`comisiones-pagar-${row.id}`}
                          >
                            {t('pagar')}
                          </button>
                        </CanAccess>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
