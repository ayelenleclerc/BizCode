import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cobrosAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import type { Cobro } from '@bizcode/types'
import CobroForm from './CobroForm'

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('es-AR')
}

export default function CobrosPage() {
  const { t } = useTranslation('cobros')
  const [searchParams] = useSearchParams()
  const presetClienteId = searchParams.get('clienteId')
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterClienteId, setFilterClienteId] = useState(presetClienteId ?? '')
  const [filterDesde, setFilterDesde] = useState('')
  const [filterHasta, setFilterHasta] = useState('')
  const [selectedRow, setSelectedRow] = useState(0)
  const listShortcuts = useGlobalListShortcuts()

  const loadCobros = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const clienteId =
        filterClienteId.trim().length > 0 ? Number.parseInt(filterClienteId, 10) : undefined
      const res = await cobrosAPI.list({
        clienteId: clienteId && Number.isFinite(clienteId) ? clienteId : undefined,
        desde: filterDesde || undefined,
        hasta: filterHasta || undefined,
      })
      setCobros(res?.data ?? [])
      setSelectedRow(0)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [filterClienteId, filterDesde, filterHasta])

  useEffect(() => {
    void loadCobros()
  }, [loadCobros])

  useEffect(() => {
    if (presetClienteId) {
      setFilterClienteId(presetClienteId)
      setShowForm(true)
    }
  }, [presetClienteId])

  const handleKeyDown = useListKeyboardNav({
    itemCount: cobros.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  useListPageHotkeys({
    searchInputId: 'search-cobros-cliente',
    onNew: () => setShowForm(true),
    onClose: () => setShowForm(false),
    isOverlayOpen: showForm,
  })

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="cobros-page">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
          </div>
          <CanAccess permission="sales.create">
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowForm(true)}
              data-testid="cobros-new-btn"
            >
              {t('newPayment')}
            </button>
          </CanAccess>
        </div>

        <CobrosFiltersBar
          filterClienteId={filterClienteId}
          setFilterClienteId={setFilterClienteId}
          filterDesde={filterDesde}
          setFilterDesde={setFilterDesde}
          filterHasta={filterHasta}
          setFilterHasta={setFilterHasta}
          onApply={() => void loadCobros()}
          t={t}
        />

        <AsyncWrapper loading={loading} error={loadError}>
          {cobros.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400" data-testid="cobros-empty">
              {t('empty')}
            </p>
          ) : (
            <CobrosTableView cobros={cobros} t={t} selectedRow={selectedRow} onKeyDown={handleKeyDown} onSelectRow={setSelectedRow} />
          )}
        </AsyncWrapper>

        <KeyboardHint shortcuts={listShortcuts} className="mt-4" />

        {showForm && (
          <CobrosModalOverlay onClose={() => setShowForm(false)}>
            <CobroForm
              initialClienteId={
                presetClienteId ? Number.parseInt(presetClienteId, 10) : undefined
              }
              onSaved={() => {
                setShowForm(false)
                void loadCobros()
              }}
              onCancel={() => setShowForm(false)}
            />
          </CobrosModalOverlay>
        )}
      </div>
    </ErrorBoundary>
  )
}

function CobrosFiltersBar({
  filterClienteId,
  setFilterClienteId,
  filterDesde,
  setFilterDesde,
  filterHasta,
  setFilterHasta,
  onApply,
  t,
}: {
  filterClienteId: string
  setFilterClienteId: (v: string) => void
  filterDesde: string
  setFilterDesde: (v: string) => void
  filterHasta: string
  setFilterHasta: (v: string) => void
  onApply: () => void
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 items-end" data-testid="cobros-filters">
      <div>
        <label htmlFor="search-cobros-cliente" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
          {t('filters.client')}
        </label>
        <input
          id="search-cobros-cliente"
          data-testid="search-cobros-cliente"
          type="number"
          min={1}
          placeholder={t('filters.clientPlaceholder')}
          aria-label={t('filters.client')}
          className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-28"
          value={filterClienteId}
          onChange={(e) => setFilterClienteId(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-desde" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
          {t('filters.from')}
        </label>
        <input
          id="filter-desde"
          type="date"
          aria-label={t('filters.from')}
          className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
          value={filterDesde}
          onChange={(e) => setFilterDesde(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-hasta" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
          {t('filters.to')}
        </label>
        <input
          id="filter-hasta"
          type="date"
          aria-label={t('filters.to')}
          className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
          value={filterHasta}
          onChange={(e) => setFilterHasta(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        onClick={onApply}
      >
        {t('filters.apply')}
      </button>
    </div>
  )
}

function CobrosTableView({
  cobros,
  t,
  selectedRow,
  onKeyDown,
  onSelectRow,
}: {
  cobros: Cobro[]
  t: (key: string) => string
  selectedRow: number
  onKeyDown: (e: React.KeyboardEvent, index: number) => void
  onSelectRow: (row: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="cobros-table">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th className="py-2 pr-4">{t('table.date')}</th>
            <th className="py-2 pr-4">{t('table.client')}</th>
            <th className="py-2 pr-4">{t('table.amount')}</th>
            <th className="py-2 pr-4">{t('table.reference')}</th>
          </tr>
        </thead>
        <tbody>
          {cobros.map((c, idx) => (
            <tr
              key={c.id}
              role="row"
              {...(selectedRow === idx
                ? { 'aria-selected': 'true' as const }
                : { 'aria-selected': 'false' as const })}
              className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition ${
                selectedRow === idx
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
              }`}
              tabIndex={0}
              onClick={() => onSelectRow(idx)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <td className="py-2 pr-4">{formatDate(c.fecha)}</td>
              <td className="py-2 pr-4">
                {c.cliente ? `${c.cliente.codigo} — ${c.cliente.rsocial}` : c.clienteId}
              </td>
              <td className="py-2 pr-4 font-mono">{formatMoney(c.monto)}</td>
              <td className="py-2 pr-4">{c.referencia ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CobrosModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { t: tc } = useTranslation('common')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/50"
        aria-label={tc('actions.cancel')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        data-testid="dialog-cobro-form"
        className="relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
