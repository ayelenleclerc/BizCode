import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { garantiasAPI } from '@/lib/api'
import type { GarantiaRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type Counts = {
  vigente?: number
  vencida?: number
  anulada?: number
  vencenEsteMes?: number
  vencenProximos3Meses?: number
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString()
}

export default function GarantiasPage() {
  const { t } = useTranslation('garantias')
  const [rows, setRows] = useState<GarantiaRow[]>([])
  const [counts, setCounts] = useState<Counts>({})
  const [q, setQ] = useState('')
  const [proximas, setProximas] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await garantiasAPI.list({
        q: q.trim() || undefined,
        proximas: proximas || undefined,
      })
      setRows(res?.data ?? [])
      setCounts((res?.counts as Counts) ?? {})
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [q, proximas, t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSearch(event: FormEvent): Promise<void> {
    event.preventDefault()
    await load()
  }

  async function handleAnular(id: number): Promise<void> {
    setActionId(id)
    try {
      await garantiasAPI.anular(id)
      await load()
    } finally {
      setActionId(null)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="garantias-page">
        <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>

        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
          data-testid="garantias-counts"
          role="region"
          aria-label={t('title')}
        >
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.vigente')}</div>
            <div className="text-xl font-semibold">{counts.vigente ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.vencida')}</div>
            <div className="text-xl font-semibold">{counts.vencida ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.anulada')}</div>
            <div className="text-xl font-semibold">{counts.anulada ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.vencenEsteMes')}</div>
            <div className="text-xl font-semibold">{counts.vencenEsteMes ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.vencenProximos3Meses')}</div>
            <div className="text-xl font-semibold">{counts.vencenProximos3Meses ?? 0}</div>
          </div>
        </div>

        <form
          className="flex flex-wrap gap-3 items-end mb-4"
          onSubmit={(e) => void handleSearch(e)}
          data-testid="garantias-search-form"
        >
          <label className="flex flex-col gap-1 flex-1 min-w-[12rem]">
            <span className="text-sm text-slate-300">{t('search')}</span>
            <input
              data-testid="garantias-search-input"
              className="rounded border border-slate-600 bg-slate-900 px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
          </label>
          <label className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              data-testid="garantias-proximas"
              checked={proximas}
              onChange={(e) => setProximas(e.target.checked)}
            />
            <span className="text-sm">{t('proximas')}</span>
          </label>
          <button
            type="submit"
            data-testid="garantias-search-submit"
            className="rounded bg-sky-700 hover:bg-sky-600 px-4 py-2"
          >
            {t('search')}
          </button>
          <button
            type="button"
            data-testid="garantias-refresh"
            className="rounded border border-slate-600 px-4 py-2"
            onClick={() => void load()}
          >
            {t('actions.refresh')}
          </button>
        </form>

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="garantias-empty" className="text-slate-400">
              {t('empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" data-testid="garantias-table">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="py-2 pr-3">{t('columns.serie')}</th>
                    <th className="py-2 pr-3">{t('columns.cliente')}</th>
                    <th className="py-2 pr-3">{t('columns.articulo')}</th>
                    <th className="py-2 pr-3">{t('columns.vence')}</th>
                    <th className="py-2 pr-3">{t('columns.estado')}</th>
                    <th className="py-2 pr-3">{t('columns.usos')}</th>
                    <th className="py-2">{' '}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800" data-testid={`garantia-row-${row.id}`}>
                      <td className="py-2 pr-3">
                        {row.nroSerie || row.nroImei || '—'}
                      </td>
                      <td className="py-2 pr-3">{row.cliente?.rsocial ?? row.clienteId}</td>
                      <td className="py-2 pr-3">{row.articulo?.descripcion ?? row.articuloId}</td>
                      <td className="py-2 pr-3">{formatDate(row.fechaVencimiento)}</td>
                      <td className="py-2 pr-3">{t(`estado.${row.estado}`)}</td>
                      <td className="py-2 pr-3">{row.usos?.length ?? 0}</td>
                      <td className="py-2">
                        {row.estado === 'vigente' ? (
                          <CanAccess permission="sales.create">
                            <button
                              type="button"
                              data-testid={`garantia-anular-${row.id}`}
                              className="text-amber-400 hover:underline disabled:opacity-50"
                              disabled={actionId === row.id}
                              onClick={() => void handleAnular(row.id)}
                            >
                              {t('actions.anular')}
                            </button>
                          </CanAccess>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
