import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pedidosAPI, remitosAPI, type PedidoRow } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import IfIntegration from '@/components/IfIntegration'
import IfModule from '@/components/IfModule'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import MeliOrdenesPanel from './MeliOrdenesPanel'

const ESTADOS = ['draft', 'confirmed', 'invoiced', 'cancelled'] as const

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export default function PedidosPage() {
  const { t } = useTranslation('pedidos')
  const [tab, setTab] = useState<'pedidos' | 'meli'>('pedidos')
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [filterEstado, setFilterEstado] = useState('')
  const [selectedRow, setSelectedRow] = useState(0)
  const [remitoLoadingId, setRemitoLoadingId] = useState<number | null>(null)
  const listShortcuts = useGlobalListShortcuts()

  const loadPedidos = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await pedidosAPI.list({
        estado: filterEstado || undefined,
      })
      setPedidos(res?.data ?? [])
      setSelectedRow(0)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [filterEstado, t])

  useEffect(() => {
    if (tab === 'pedidos') {
      void loadPedidos()
    }
  }, [loadPedidos, tab])

  const handleKeyDown = useListKeyboardNav({
    itemCount: pedidos.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  useListPageHotkeys({
    searchInputId: 'search-pedidos-estado',
  })

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="pedidos-page">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
          </div>
          {tab === 'pedidos' ? (
            <CanAccess permission="orders.create">
              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                data-testid="pedidos-new-btn"
                disabled
              >
                {t('newOrder')}
              </button>
            </CanAccess>
          ) : null}
        </header>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700" role="tablist" aria-label={t('tabsLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'pedidos'}
            className={`px-3 py-2 text-sm ${tab === 'pedidos' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
            data-testid="pedidos-tab-pedidos"
            onClick={() => setTab('pedidos')}
          >
            {t('tabPedidos')}
          </button>
          <IfIntegration id="meli">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'meli'}
              className={`px-3 py-2 text-sm ${tab === 'meli' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
              data-testid="pedidos-tab-meli"
              onClick={() => setTab('meli')}
            >
              {t('tabMeli')}
            </button>
          </IfIntegration>
        </div>

        {tab === 'meli' ? (
          <MeliOrdenesPanel />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <label htmlFor="search-pedidos-estado" className="text-sm text-slate-600 dark:text-slate-300">
                {t('filterEstado')}
              </label>
              <select
                id="search-pedidos-estado"
                className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-600"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                data-testid="search-pedidos-estado"
              >
                <option value="">{t('filterAll')}</option>
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>
                    {t(`estado.${est}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
                onClick={() => void loadPedidos()}
                data-testid="pedidos-refresh-btn"
                aria-label={t('filterEstado')}
              >
                ↻
              </button>
            </div>

            <AsyncWrapper loading={loading} error={loadError}>
              {pedidos.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400" data-testid="pedidos-empty">
                  {t('empty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm" data-testid="pedidos-table">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4">{t('columns.id')}</th>
                        <th className="py-2 pr-4">{t('columns.cliente')}</th>
                        <th className="py-2 pr-4">{t('columns.estado')}</th>
                        <th className="py-2 pr-4">{t('columns.total')}</th>
                        <th className="py-2 pr-4">{t('columns.fecha')}</th>
                        <th className="py-2">{t('columns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((p, idx) => (
                        <tr
                          key={p.id}
                          role="row"
                          {...(selectedRow === idx
                            ? { 'aria-selected': 'true' as const }
                            : { 'aria-selected': 'false' as const })}
                          className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition ${
                            selectedRow === idx
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                          data-testid={`pedidos-row-${p.id}`}
                          tabIndex={0}
                          onClick={() => setSelectedRow(idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                        >
                          <td className="py-2 pr-4">{p.id}</td>
                          <td className="py-2 pr-4">{p.cliente?.rsocial ?? p.clienteId}</td>
                          <td className="py-2 pr-4">{t(`estado.${p.estado}`)}</td>
                          <td className="py-2 pr-4">{formatMoney(p.total)}</td>
                          <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-2">
                            {p.estado === 'confirmed' && (
                              <IfModule flag="fiscal.remito">
                                <CanAccess permission="sales.create">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-teal-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-remito-${p.id}`}
                                    disabled={remitoLoadingId === p.id}
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      setRemitoLoadingId(p.id)
                                      try {
                                        await remitosAPI.createFromPedido(p.id)
                                        await loadPedidos()
                                      } finally {
                                        setRemitoLoadingId(null)
                                      }
                                    }}
                                  >
                                    {remitoLoadingId === p.id ? t('remitoCreating') : t('generateRemito')}
                                  </button>
                                </CanAccess>
                              </IfModule>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AsyncWrapper>

            <KeyboardHint shortcuts={listShortcuts} className="mt-4" />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}
