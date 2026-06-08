import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from '@/components/ErrorBoundary'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import { useAuth } from '@/contexts/AuthContext'
import { repartosAPI, type Reparto, type RepartoEstado } from '@/lib/api'
import RepartoFormDialog from './RepartoFormDialog'
import RepartosTrackingPanel from './RepartosTrackingPanel'

const ESTADOS: RepartoEstado[] = ['planned', 'on_route', 'completed', 'cancelled']

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function RepartosPage() {
  const { claims } = useAuth()
  const { t } = useTranslation('repartos')
  const canRead = claims?.permissions.includes('logistics.read') ?? false
  const canDispatch = claims?.permissions.includes('orders.dispatch') ?? false

  if (!canRead) {
    return (
      <div className="p-8" data-testid="repartos-forbidden">
        <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <RepartosPageContent canDispatch={canDispatch} />
    </ErrorBoundary>
  )
}

function RepartosPageContent({ canDispatch }: { canDispatch: boolean }) {
  const { t } = useTranslation('repartos')
  const listShortcuts = useGlobalListShortcuts()
  const [fecha, setFecha] = useState(todayIso)
  const [estado, setEstado] = useState<RepartoEstado | ''>('')
  const [repartos, setRepartos] = useState<Reparto[]>([])
  const [selected, setSelected] = useState<Reparto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedRow, setSelectedRow] = useState(0)

  const loadRepartos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await repartosAPI.list({
        fecha,
        ...(estado ? { estado } : {}),
        limit: 100,
      })
      setRepartos(res?.data ?? [])
      setSelectedRow(0)
    } catch {
      setError(t('errors.load'))
      setRepartos([])
    } finally {
      setLoading(false)
    }
  }, [estado, fecha, t])

  useEffect(() => {
    void loadRepartos()
  }, [loadRepartos])

  const selectReparto = useCallback(async (id: number) => {
    try {
      const detail = await repartosAPI.get(id)
      if (detail) setSelected(detail)
    } catch {
      setError(t('errors.load'))
    }
  }, [t])

  const onOpenRow = useCallback(
    (index: number) => {
      const reparto = repartos[index]
      if (reparto) void selectReparto(reparto.id)
    },
    [repartos, selectReparto],
  )

  const handleKeyDown = useListKeyboardNav({
    itemCount: repartos.length,
    selectedRow,
    setSelectedRow,
    onOpenRow,
  })

  useListPageHotkeys({
    searchInputId: 'search-repartos',
    onNew: canDispatch ? () => setShowForm(true) : undefined,
    onClose: () => setShowForm(false),
    isOverlayOpen: showForm,
  })

  return (
    <div className="p-8 max-w-6xl mx-auto" data-testid="repartos-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          to="/logistica"
          className="text-sm text-blue-600 dark:text-blue-400 underline"
          data-testid="repartos-back-link"
        >
          {t('backToOrders')}
        </Link>
      </div>

      <KeyboardHint shortcuts={listShortcuts} className="mb-4" />

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400">{t('filters.fecha')}</span>
          <input
            id="search-repartos"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 border rounded px-2 py-1 dark:bg-slate-800"
            data-testid="repartos-filter-fecha"
          />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400">{t('filters.estado')}</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as RepartoEstado | '')}
            className="mt-1 border rounded px-2 py-1 dark:bg-slate-800"
            data-testid="repartos-filter-estado"
          >
            <option value="">{t('filters.allEstados')}</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {t(`estado.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void loadRepartos()}
          className="px-3 py-2 text-sm border rounded"
          data-testid="repartos-refresh"
        >
          {t('actions.refresh')}
        </button>
        {canDispatch && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
            data-testid="repartos-new-btn"
          >
            {t('actions.newRoute')}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-red-600 text-sm mb-4" data-testid="repartos-error">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" aria-busy="true" data-testid="repartos-loading">
          {t('list.loading')}
        </p>
      ) : repartos.length === 0 ? (
        <p data-testid="repartos-empty">{t('list.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="repartos-table">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">{t('list.chofer')}</th>
                <th className="py-2 pr-4">{t('filters.estado')}</th>
                <th className="py-2 pr-4">{t('list.progress')}</th>
                <th className="py-2 pr-4">{t('list.vehiculo')}</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {repartos.map((r, idx) => (
                <tr
                  key={r.id}
                  role="row"
                  tabIndex={0}
                  {...(selectedRow === idx
                    ? { 'aria-selected': 'true' as const }
                    : { 'aria-selected': 'false' as const })}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`border-b border-slate-100 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="py-2 pr-4">{r.id}</td>
                  <td className="py-2 pr-4">{r.chofer.username}</td>
                  <td className="py-2 pr-4">{t(`estado.${r.estado}`)}</td>
                  <td className="py-2 pr-4">
                    {r.progress.delivered}/{r.progress.total}
                  </td>
                  <td className="py-2 pr-4">{r.vehiculo ?? '—'}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      className="text-blue-600 underline text-xs"
                      onClick={() => void selectReparto(r.id)}
                      data-testid={`repartos-view-${r.id}`}
                    >
                      {t('tracking.title')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <RepartosTrackingPanel
          reparto={selected}
          canDispatch={canDispatch}
          onUpdated={(r) => {
            setSelected(r)
            void loadRepartos()
          }}
        />
      )}

      <RepartoFormDialog
        open={showForm}
        fecha={fecha}
        onClose={() => setShowForm(false)}
        onCreated={() => void loadRepartos()}
      />
    </div>
  )
}
