import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import {
  reportesAPI,
  type AgingArData,
  type AgingBucket,
  type CuentaCorrienteData,
} from '@/lib/api'

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

type SortKey = 'label' | 'count' | 'total'
type SortDir = 'asc' | 'desc'

export default function FinanzasPage() {
  const { t } = useTranslation('finanzas')

  return (
    <CanAccess
      permission="reports.financial.read"
      fallback={
        <div className="p-8" data-testid="finanzas-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <FinanzasPageContent />
    </CanAccess>
  )
}

function FinanzasPageContent() {
  const { t } = useTranslation('finanzas')
  const [aging, setAging] = useState<AgingArData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('label')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [clienteIdInput, setClienteIdInput] = useState('')
  const [statement, setStatement] = useState<CuentaCorrienteData | null>(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [statementError, setStatementError] = useState<Error | null>(null)

  const loadAging = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await reportesAPI.aging()
      setAging(data ?? null)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAging()
  }, [loadAging])

  const sortedBuckets = useMemo(() => {
    if (!aging) return []
    const rows = [...aging.buckets]
    rows.sort((a, b) => {
      const cmp =
        sortKey === 'label'
          ? a.label.localeCompare(b.label)
          : sortKey === 'count'
            ? a.count - b.count
            : Number.parseFloat(a.total) - Number.parseFloat(b.total)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [aging, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const openStatement = async () => {
    const id = Number.parseInt(clienteIdInput.trim(), 10)
    if (!Number.isFinite(id) || id < 1) return
    setStatementLoading(true)
    setStatementError(null)
    try {
      const data = await reportesAPI.cuentaCorriente(id)
      setStatement(data ?? null)
    } catch (error) {
      setStatement(null)
      setStatementError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setStatementLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="finanzas-page">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
        </header>

        <AsyncWrapper loading={loading} error={loadError}>
          {aging && <FinanzasResumenCards aging={aging} t={t} />}
        </AsyncWrapper>

        <section className="mt-8" aria-labelledby="finanzas-aging-heading">
          <h2 id="finanzas-aging-heading" className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
            {t('aging.title')}
          </h2>
          <AsyncWrapper loading={loading} error={loadError}>
            {sortedBuckets.length === 0 ? (
              <p className="text-slate-500" data-testid="finanzas-aging-empty">
                {t('aging.empty')}
              </p>
            ) : (
              <FinanzasAgingTable
                buckets={sortedBuckets}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                t={t}
              />
            )}
          </AsyncWrapper>
        </section>

        <section className="mt-8" aria-labelledby="finanzas-clients-heading">
          <h2 id="finanzas-clients-heading" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
            {t('clients.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('clients.hint')}</p>
          <div className="flex flex-wrap gap-3 items-end" data-testid="finanzas-client-lookup">
            <div>
              <label htmlFor="finanzas-cliente-id" className="block text-xs text-slate-500 mb-1">
                {t('clients.clientId')}
              </label>
              <input
                id="finanzas-cliente-id"
                type="number"
                min={1}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-32"
                placeholder={t('clients.clientIdPlaceholder')}
                value={clienteIdInput}
                onChange={(e) => setClienteIdInput(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              data-testid="finanzas-view-statement-btn"
              onClick={() => void openStatement()}
            >
              {t('clients.viewStatement')}
            </button>
          </div>
        </section>

        {(statement || statementLoading || statementError) && (
          <FinanzasStatementPanel
            statement={statement}
            loading={statementLoading}
            error={statementError}
            onClose={() => {
              setStatement(null)
              setStatementError(null)
            }}
            t={t}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

function FinanzasResumenCards({
  aging,
  t,
}: {
  aging: AgingArData
  t: (key: string) => string
}) {
  const cards = [
    { key: 'totalDebt', value: formatMoney(aging.totalDeuda) },
    { key: 'overdue', value: formatMoney(aging.resumen.deudaVencida) },
    { key: 'notDue', value: formatMoney(aging.resumen.deudaPorVencer) },
    { key: 'delinquencyPct', value: `${aging.resumen.porcentajeMora}%` },
    { key: 'suspendedClients', value: String(aging.resumen.clientesSuspendidos) },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="finanzas-summary">
      {cards.map((c) => (
        <div
          key={c.key}
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {t(`summary.${c.key}`)}
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{c.value}</p>
        </div>
      ))}
    </div>
  )
}

function FinanzasAgingTable({
  buckets,
  sortKey,
  sortDir,
  onSort,
  t,
}: {
  buckets: AgingBucket[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  t: (key: string) => string
}) {
  const sortLabel = sortDir === 'asc' ? t('sort.asc') : t('sort.desc')
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="finanzas-aging-table">
        <caption className="sr-only">{t('aging.title')}</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('label')}>
                {t('aging.bucket')} {sortKey === 'label' ? `(${sortLabel})` : ''}
              </button>
            </th>
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('count')}>
                {t('aging.count')} {sortKey === 'count' ? `(${sortLabel})` : ''}
              </button>
            </th>
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('total')}>
                {t('aging.total')} {sortKey === 'total' ? `(${sortLabel})` : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2 pr-4">{row.label}</td>
              <td className="py-2 pr-4">{row.count}</td>
              <td className="py-2 pr-4 font-mono">{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinanzasStatementPanel({
  statement,
  loading,
  error,
  onClose,
  t,
}: {
  statement: CuentaCorrienteData | null
  loading: boolean
  error: Error | null
  onClose: () => void
  t: (key: string) => string
}) {
  const { t: tc } = useTranslation('common')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-0">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/50"
        aria-label={tc('actions.cancel')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finanzas-statement-title"
        data-testid="finanzas-cc-panel"
        className="relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h2 id="finanzas-statement-title" className="text-lg font-semibold">
              {t('statement.title')}
            </h2>
            {statement && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {statement.codigo} — {statement.rsocial}
              </p>
            )}
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
            onClick={onClose}
          >
            {t('statement.close')}
          </button>
        </div>
        <AsyncWrapper loading={loading} error={error}>
          {statement && (
            <>
              <p className="mb-4 text-sm" data-testid="finanzas-cc-balance">
                {t('statement.balance')}:{' '}
                <span className="font-mono font-semibold">{formatMoney(statement.balanceActual)}</span>
              </p>
              {statement.lineas.length === 0 ? (
                <p>{t('statement.empty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{t('statement.title')}</caption>
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                        <th scope="col" className="py-2 pr-2">{t('statement.date')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.reference')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.debit')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.credit')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.balanceCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.lineas.map((line, idx) => (
                        <tr key={`${line.tipo}-${line.fecha}-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 pr-2">{formatDate(line.fecha)}</td>
                          <td className="py-2 pr-2">
                            {line.tipo === 'factura'
                              ? t('statement.typeFactura')
                              : line.tipo === 'cobro'
                                ? t('statement.typeCobro')
                                : t('statement.typeSaldoInicial')}{' '}
                            {line.referencia}
                          </td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.debito)}</td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.credito)}</td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </AsyncWrapper>
      </div>
    </div>
  )
}
