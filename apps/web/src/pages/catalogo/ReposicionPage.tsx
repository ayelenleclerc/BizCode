import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import { articulosAPI, type ReplenishmentForecastRow } from '@/lib/api'
import type { ComprasOcPrefillState } from '@/lib/comprasOcPrefill'

/**
 * @en Replenishment list from moving-average demand forecast (#198).
 * @es Lista de reposición desde predicción de demanda por media móvil (#198).
 * @pt-BR Lista de reposição a partir de previsão de demanda por média móvel (#198).
 */
export default function ReposicionPage() {
  const { t } = useTranslation('reposicion')

  return (
    <CanAccess
      permission="products.read"
      fallback={
        <div data-testid="reposicion-forbidden">
          <p className="p-8 text-slate-600 dark:text-slate-300">{t('noAccess')}</p>
        </div>
      }
    >
      <ErrorBoundary>
        <ReposicionPageContent />
      </ErrorBoundary>
    </CanAccess>
  )
}

function ReposicionPageContent() {
  const { t } = useTranslation('reposicion')
  const navigate = useNavigate()
  const [rows, setRows] = useState<ReplenishmentForecastRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [proveedorId, setProveedorId] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await articulosAPI.listReposicion({ horizonDays: 30 })
      setRows(data ?? [])
      setSelected({})
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => Number(id)),
    [selected],
  )

  const handleGenerateOc = async () => {
    setActionError(null)
    const pid = Number.parseInt(proveedorId, 10)
    if (!Number.isInteger(pid) || pid < 1) {
      setActionError(t('errors.proveedorRequired'))
      return
    }
    if (selectedIds.length === 0) {
      setActionError(t('errors.selectArticles'))
      return
    }
    setActionLoading(true)
    try {
      const result = await articulosAPI.ordenCompraSugerida({
        proveedorId: pid,
        articuloIds: selectedIds,
        create: false,
      })
      const lines = result.prefill?.lines ?? []
      if (lines.length === 0) {
        setActionError(t('errors.noLines'))
        return
      }
      const state: ComprasOcPrefillState = {
        ocPrefill: {
          proveedorId: pid,
          lines: lines.map((l) => ({
            articuloId: l.articuloId,
            cantidad: l.cantidad,
            costoUnitario: l.costoUnitario,
          })),
        },
      }
      navigate('/compras', { state })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.generic'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4" data-testid="reposicion-page">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="reposicion-proveedor-id" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('proveedorId')}
            </label>
            <input
              id="reposicion-proveedor-id"
              type="number"
              min={1}
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="mt-1 w-40 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              data-testid="reposicion-proveedor-id"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateOc()}
            disabled={actionLoading}
            className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            data-testid="reposicion-generate-oc"
          >
            {actionLoading ? t('generating') : t('generateOc')}
          </button>
        </div>
      </header>

      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="reposicion-action-error">
          {actionError}
        </p>
      ) : null}

      <AsyncWrapper loading={loading} error={loadError}>
        {rows.length === 0 && !loading ? (
          <p className="text-slate-600 dark:text-slate-400" data-testid="reposicion-empty">
            {t('empty')}
          </p>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" data-testid="reposicion-table">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="py-2 pr-2">
                  <span className="sr-only">{t('columns.select')}</span>
                </th>
                <th scope="col" className="py-2 pr-2">{t('columns.codigo')}</th>
                <th scope="col" className="py-2 pr-2">{t('columns.descripcion')}</th>
                <th scope="col" className="py-2 pr-2">{t('columns.stock')}</th>
                <th scope="col" className="py-2 pr-2">{t('columns.days')}</th>
                <th scope="col" className="py-2 pr-2">{t('columns.qty')}</th>
                <th scope="col" className="py-2">{t('columns.status')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.articuloId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-2">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[row.articuloId])}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [row.articuloId]: e.target.checked }))
                      }
                      aria-label={t('columns.selectRow', { codigo: row.codigo })}
                      data-testid={`reposicion-select-${row.articuloId}`}
                    />
                  </td>
                  <td className="py-2 pr-2">{row.codigo}</td>
                  <td className="py-2 pr-2">{row.descripcion}</td>
                  <td className="py-2 pr-2">{row.stock}</td>
                  <td className="py-2 pr-2">{row.daysRemaining ?? '—'}</td>
                  <td className="py-2 pr-2">{row.suggestedOrderQty ?? '—'}</td>
                  <td className="py-2">
                    {row.status === 'ok' ? t('status.ok') : t('status.insufficient')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </AsyncWrapper>
    </div>
  )
}
