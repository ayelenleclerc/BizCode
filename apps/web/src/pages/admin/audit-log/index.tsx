import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { auditEventsAPI, type AuditEventDTO, type AuditEventListResult } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'

const PAGE_SIZE = 50

export default function AuditLogPage() {
  const { t } = useTranslation('audit')
  const { t: tc } = useTranslation('common')
  const baseId = useId()
  const idUser = `${baseId}-user`
  const idResource = `${baseId}-resource`
  const idStart = `${baseId}-start`
  const idEnd = `${baseId}-end`

  const [userIdStr, setUserIdStr] = useState('')
  const [actionStr, setActionStr] = useState('')
  const [resourceStr, setResourceStr] = useState('')
  const [startStr, setStartStr] = useState('')
  const [endStr, setEndStr] = useState('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [result, setResult] = useState<AuditEventListResult | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const listShortcuts = useGlobalListShortcuts()

  type FilterFields = {
    userIdStr: string
    actionStr: string
    resourceStr: string
    startStr: string
    endStr: string
  }

  const fetchPage = async (off: number, f: FilterFields) => {
    setLoading(true)
    setError(false)
    try {
      const uid = Number.parseInt(f.userIdStr.trim(), 10)
      const res = await auditEventsAPI.list({
        limit: PAGE_SIZE,
        offset: off,
        ...(Number.isFinite(uid) && uid > 0 ? { userId: uid } : {}),
        ...(f.actionStr.trim() ? { action: f.actionStr.trim() } : {}),
        ...(f.resourceStr.trim() ? { resource: f.resourceStr.trim() } : {}),
        ...(f.startStr.trim() ? { startDate: f.startStr.trim() } : {}),
        ...(f.endStr.trim() ? { endDate: f.endStr.trim() } : {}),
      })
      setResult(res)
      setSelectedRow(0)
    } catch {
      setResult(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filterSnapshot = (): FilterFields => ({
    userIdStr,
    actionStr,
    resourceStr,
    startStr,
    endStr,
  })

  useEffect(() => {
    void fetchPage(offset, filterSnapshot())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: reload on offset only with current filters
  }, [offset])

  const onApplyFilters = () => {
    if (offset === 0) void fetchPage(0, filterSnapshot())
    else setOffset(0)
  }

  const onClearFilters = () => {
    const empty: FilterFields = {
      userIdStr: '',
      actionStr: '',
      resourceStr: '',
      startStr: '',
      endStr: '',
    }
    setUserIdStr('')
    setActionStr('')
    setResourceStr('')
    setStartStr('')
    setEndStr('')
    if (offset === 0) void fetchPage(0, empty)
    else setOffset(0)
  }

  const onRefresh = () => void fetchPage(offset, filterSnapshot())

  const total = result?.total ?? 0
  const rows = result?.data ?? []

  const handleKeyDown = useListKeyboardNav({
    itemCount: rows.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  useListPageHotkeys({
    searchInputId: 'search-audit-log',
  })

  const from = total === 0 ? 0 : offset + 1
  const to = offset + rows.length
  const canPrev = offset > 0
  const canNext = offset + PAGE_SIZE < total

  const formatMetadata = (m: AuditEventDTO['metadata']) => {
    if (m == null) return '—'
    try {
      return JSON.stringify(m)
    } catch {
      return '—'
    }
  }

  return (
    <CanAccess
      permission="audit.read"
      fallback={
        <div
          className="p-8 max-w-3xl"
          role="alert"
          data-testid="audit-log-forbidden"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('forbidden')}</p>
        </div>
      }
    >
      <div className="p-8 flex flex-col gap-6 h-full" data-testid="audit-log-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('description')}</p>
        </div>

        <section
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
          aria-labelledby={`${baseId}-filters-heading`}
          data-testid="audit-log-filters"
        >
          <h2 id={`${baseId}-filters-heading`} className="sr-only">
            {t('filters.apply')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor={idUser} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.userId')}
              </label>
              <input
                id={idUser}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t('filters.userIdPlaceholder')}
                value={userIdStr}
                onChange={(e) => setUserIdStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="search-audit-log" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.action')}
              </label>
              <input
                id="search-audit-log"
                data-testid="search-audit-log"
                type="text"
                autoComplete="off"
                placeholder={t('filters.actionPlaceholder')}
                value={actionStr}
                onChange={(e) => setActionStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor={idResource} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.resource')}
              </label>
              <input
                id={idResource}
                type="text"
                autoComplete="off"
                placeholder={t('filters.resourcePlaceholder')}
                value={resourceStr}
                onChange={(e) => setResourceStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor={idStart} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.startDate')}
              </label>
              <input
                id={idStart}
                type="text"
                autoComplete="off"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor={idEnd} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('filters.endDate')}
              </label>
              <input
                id={idEnd}
                type="text"
                autoComplete="off"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="audit-log-apply-filters"
              onClick={onApplyFilters}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              {t('filters.apply')}
            </button>
            <button
              type="button"
              data-testid="audit-log-clear-filters"
              onClick={onClearFilters}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm"
            >
              {t('filters.clear')}
            </button>
            <button
              type="button"
              data-testid="audit-log-refresh"
              onClick={onRefresh}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm"
            >
              {t('refresh')}
            </button>
          </div>
        </section>

        {error ? (
          <div role="alert" data-testid="audit-log-error" className="text-red-600 dark:text-red-400">
            {t('error')}
          </div>
        ) : null}

        {loading ? (
          <div role="status" aria-busy="true" className="text-slate-600 dark:text-slate-400">
            {tc('status.loading')}
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400" data-testid="audit-log-empty">
            {t('empty')}
          </p>
        ) : null}

        {!loading && !error && rows.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
              <p data-testid="audit-log-page-summary">
                {t('pagination.summary', { from, to, total })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="audit-log-prev-page"
                  disabled={!canPrev}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('pagination.prev')}
                </button>
                <button
                  type="button"
                  data-testid="audit-log-next-page"
                  disabled={!canNext}
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('pagination.next')}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="w-full border-collapse text-sm" data-testid="audit-log-table">
                <caption className="sr-only">{t('table.caption')}</caption>
                <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.createdAt')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.username')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.userId')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.action')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.resource')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.resourceId')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.ipAddress')}
                    </th>
                    <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                      {t('table.metadata')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      role="row"
                      {...(selectedRow === idx
                        ? { 'aria-selected': 'true' as const }
                        : { 'aria-selected': 'false' as const })}
                      className={`border-t border-slate-200 dark:border-slate-600 cursor-pointer transition ${
                        selectedRow === idx
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                      }`}
                      tabIndex={0}
                      onClick={() => setSelectedRow(idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{row.username ?? '—'}</td>
                      <td className="px-3 py-2 font-mono">{row.userId ?? '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.action}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.resource}</td>
                      <td className="px-3 py-2 font-mono text-xs break-all">{row.resourceId ?? '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.ipAddress ?? '—'}</td>
                      <td className="px-3 py-2 max-w-xs truncate font-mono text-xs" title={formatMetadata(row.metadata)}>
                        {formatMetadata(row.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <KeyboardHint shortcuts={listShortcuts} className="mt-4" />
      </div>
    </CanAccess>
  )
}
