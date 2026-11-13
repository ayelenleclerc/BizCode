import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnomaliaDetectadaRow } from '@bizcode/types'
import { anomaliasAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'

const PAGE_SIZE = 50

/**
 * @en Admin list of persisted billing anomalies (#200 residual).
 * @es Listado Admin de anomalías de facturación persistidas (#200 residual).
 * @pt-BR Listagem Admin de anomalias de faturamento persistidas (#200 residual).
 */
export default function AnomaliasPage() {
  const { t } = useTranslation('anomalias')
  const baseId = useId()
  const idConfirmada = `${baseId}-confirmada`
  const idCliente = `${baseId}-cliente`
  const idFactura = `${baseId}-factura`

  const [tipoStr, setTipoStr] = useState('')
  const [confirmadaStr, setConfirmadaStr] = useState('')
  const [clienteIdStr, setClienteIdStr] = useState('')
  const [facturaIdStr, setFacturaIdStr] = useState('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [rows, setRows] = useState<AnomaliaDetectadaRow[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRow, setSelectedRow] = useState(0)
  const listShortcuts = useGlobalListShortcuts()

  type FilterFields = {
    tipoStr: string
    confirmadaStr: string
    clienteIdStr: string
    facturaIdStr: string
  }

  const fetchPage = async (off: number, f: FilterFields) => {
    setLoading(true)
    setError(false)
    try {
      const clienteId = Number.parseInt(f.clienteIdStr.trim(), 10)
      const facturaId = Number.parseInt(f.facturaIdStr.trim(), 10)
      let confirmada: boolean | undefined
      if (f.confirmadaStr === 'true') confirmada = true
      else if (f.confirmadaStr === 'false') confirmada = false
      const res = await anomaliasAPI.list({
        limit: PAGE_SIZE,
        offset: off,
        ...(f.tipoStr.trim() ? { tipo: f.tipoStr.trim() } : {}),
        ...(confirmada != null ? { confirmada } : {}),
        ...(Number.isFinite(clienteId) && clienteId > 0 ? { clienteId } : {}),
        ...(Number.isFinite(facturaId) && facturaId > 0 ? { facturaId } : {}),
      })
      setRows(res.data)
      setTotal(res.total)
      setSelectedRow(0)
    } catch {
      setRows([])
      setTotal(0)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filterSnapshot = (): FilterFields => ({
    tipoStr,
    confirmadaStr,
    clienteIdStr,
    facturaIdStr,
  })

  useEffect(() => {
    void fetchPage(offset, filterSnapshot())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on offset with current filters
  }, [offset])

  const onApplyFilters = () => {
    if (offset === 0) void fetchPage(0, filterSnapshot())
    else setOffset(0)
  }

  const onClearFilters = () => {
    setTipoStr('')
    setConfirmadaStr('')
    setClienteIdStr('')
    setFacturaIdStr('')
    const cleared = { tipoStr: '', confirmadaStr: '', clienteIdStr: '', facturaIdStr: '' }
    if (offset === 0) void fetchPage(0, cleared)
    else setOffset(0)
  }

  useListKeyboardNav({
    itemCount: rows.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  useListPageHotkeys({
    searchInputId: 'search-anomalias-tipo',
  })

  const from = total === 0 ? 0 : offset + 1
  const to = offset + rows.length
  const canPrev = offset > 0
  const canNext = offset + PAGE_SIZE < total

  return (
    <CanAccess
      permission="audit.read"
      fallback={
        <div className="p-8 max-w-3xl" role="alert" data-testid="anomalias-forbidden">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('forbidden')}</p>
        </div>
      }
    >
      <div className="p-8 flex flex-col gap-6 h-full" data-testid="anomalias-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('description')}</p>
        </div>

        <section
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
          aria-labelledby={`${baseId}-filters-heading`}
          data-testid="anomalias-filters"
        >
          <h2 id={`${baseId}-filters-heading`} className="sr-only">
            {t('filters.apply')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search-anomalias-tipo" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.tipo')}
              </label>
              <input
                id="search-anomalias-tipo"
                data-testid="search-anomalias-tipo"
                type="text"
                autoComplete="off"
                placeholder={t('filters.tipoPlaceholder')}
                value={tipoStr}
                onChange={(e) => setTipoStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor={idConfirmada} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.confirmada')}
              </label>
              <select
                id={idConfirmada}
                data-testid="anomalias-filter-confirmada"
                value={confirmadaStr}
                onChange={(e) => setConfirmadaStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">{t('filters.confirmadaAny')}</option>
                <option value="true">{t('filters.confirmadaYes')}</option>
                <option value="false">{t('filters.confirmadaNo')}</option>
              </select>
            </div>
            <div>
              <label htmlFor={idCliente} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.clienteId')}
              </label>
              <input
                id={idCliente}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={clienteIdStr}
                onChange={(e) => setClienteIdStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor={idFactura} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.facturaId')}
              </label>
              <input
                id={idFactura}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={facturaIdStr}
                onChange={(e) => setFacturaIdStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onApplyFilters}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
              data-testid="anomalias-apply-filters"
            >
              {t('filters.apply')}
            </button>
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
              data-testid="anomalias-clear-filters"
            >
              {t('filters.clear')}
            </button>
            <button
              type="button"
              onClick={() => void fetchPage(offset, filterSnapshot())}
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
              data-testid="anomalias-refresh"
            >
              {t('refresh')}
            </button>
          </div>
        </section>

        {loading && (
          <p role="status" aria-busy="true" data-testid="anomalias-loading">
            {t('loading')}
          </p>
        )}
        {error && (
          <p role="alert" data-testid="anomalias-error" className="text-red-600 dark:text-red-400">
            {t('error')}
          </p>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400" data-testid="anomalias-empty">
            {t('empty')}
          </p>
        )}
        {!loading && !error && rows.length > 0 && (
          <>
            <p data-testid="anomalias-page-summary">
              {t('pagination.summary', { from, to, total })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                data-testid="anomalias-prev-page"
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('pagination.prev')}
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                data-testid="anomalias-next-page"
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('pagination.next')}
              </button>
            </div>
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
              <table className="w-full border-collapse text-sm" data-testid="anomalias-table">
                <caption className="sr-only">{t('table.caption')}</caption>
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.createdAt')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.tipo')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.severidad')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.clienteId')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.facturaId')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.confirmada')}</th>
                    <th scope="col" className="px-3 py-2 text-left">{t('table.descripcion')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        idx === selectedRow
                          ? 'bg-blue-50 dark:bg-blue-950/40'
                          : 'border-t border-slate-100 dark:border-slate-800'
                      }
                      data-testid={`anomalias-row-${row.id}`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">{row.createdAt}</td>
                      <td className="px-3 py-2">{row.tipo}</td>
                      <td className="px-3 py-2">{row.severidad}</td>
                      <td className="px-3 py-2">{row.clienteId ?? '—'}</td>
                      <td className="px-3 py-2">{row.facturaId ?? '—'}</td>
                      <td className="px-3 py-2">{row.confirmada ? t('table.yes') : t('table.no')}</td>
                      <td className="px-3 py-2 max-w-md truncate" title={row.descripcion}>
                        {row.descripcion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <KeyboardHint shortcuts={listShortcuts} className="mt-4" />
      </div>
    </CanAccess>
  )
}
