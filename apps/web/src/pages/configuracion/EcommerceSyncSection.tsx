/**
 * @en Ecommerce connectors status + SyncLog table for company settings (#189).
 * @es Estado de conectores eCommerce + tabla SyncLog en configuración (#189).
 * @pt-BR Status dos conectores eCommerce + tabela SyncLog nas configurações (#189).
 */
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ecommerceAPI, type EcommerceConnectorStatus, type SyncLogRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'

export default function EcommerceSyncSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canView =
    claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectors, setConnectors] = useState<EcommerceConnectorStatus[]>([])
  const [logs, setLogs] = useState<SyncLogRow[]>([])
  const [connectorFilter, setConnectorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [connectorRows, logPage] = await Promise.all([
        ecommerceAPI.listConnectors(),
        ecommerceAPI.listSyncLogs({
          connectorType: connectorFilter || undefined,
          status: statusFilter || undefined,
          limit: 50,
          offset: 0,
        }),
      ])
      setConnectors(connectorRows)
      setLogs(logPage.data)
    } catch {
      setError(t('ecommerce.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [canView, connectorFilter, statusFilter, t])

  useEffect(() => {
    void load()
  }, [load])

  if (!canView) return null

  return (
    <section
      className="mt-8 space-y-4 border-t border-gray-200 pt-6"
      data-testid="ecommerce-sync-section"
      aria-labelledby="ecommerce-sync-heading"
    >
      <div>
        <h2 id="ecommerce-sync-heading" className="text-lg font-semibold text-gray-900">
          {t('ecommerce.title')}
        </h2>
        <p className="text-sm text-gray-600">{t('ecommerce.subtitle')}</p>
      </div>

      {loading && (
        <p data-testid="ecommerce-sync-loading" className="text-sm text-gray-600">
          {t('ecommerce.loading')}
        </p>
      )}
      {error && (
        <p role="alert" data-testid="ecommerce-sync-error" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <ul
            className="space-y-2"
            data-testid="ecommerce-connectors-list"
            aria-label={t('ecommerce.connectorsLabel')}
          >
            {connectors.map((row) => (
              <li
                key={row.connectorType}
                className="flex flex-wrap items-center gap-2 text-sm"
                data-testid={`ecommerce-connector-${row.connectorType}`}
              >
                <span className="font-medium">{t(`ecommerce.connectors.${row.connectorType}`)}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                  {t(`ecommerce.status.${row.status}`)}
                </span>
                {row.registered && (
                  <span className="text-xs text-green-800">{t('ecommerce.registered')}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <label className="text-sm text-gray-700">
              <span className="mr-2">{t('ecommerce.filterConnector')}</span>
              <select
                data-testid="ecommerce-filter-connector"
                className="rounded border border-gray-300 px-2 py-1"
                value={connectorFilter}
                onChange={(e) => setConnectorFilter(e.target.value)}
              >
                <option value="">{t('ecommerce.filterAll')}</option>
                <option value="meli">meli</option>
                <option value="tiendanube">tiendanube</option>
                <option value="woocommerce">woocommerce</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              <span className="mr-2">{t('ecommerce.filterStatus')}</span>
              <select
                data-testid="ecommerce-filter-status"
                className="rounded border border-gray-300 px-2 py-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{t('ecommerce.filterAll')}</option>
                <option value="success">{t('ecommerce.logStatus.success')}</option>
                <option value="error">{t('ecommerce.logStatus.error')}</option>
              </select>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table
              className="min-w-full text-left text-sm"
              data-testid="ecommerce-sync-log-table"
            >
              <caption className="sr-only">{t('ecommerce.logCaption')}</caption>
              <thead>
                <tr className="border-b border-gray-200 text-gray-700">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    {t('ecommerce.columns.createdAt')}
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    {t('ecommerce.columns.connector')}
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    {t('ecommerce.columns.operation')}
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    {t('ecommerce.columns.status')}
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    {t('ecommerce.columns.error')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-gray-600" data-testid="ecommerce-sync-log-empty">
                      {t('ecommerce.emptyLogs')}
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100" data-testid={`ecommerce-sync-log-${row.id}`}>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">{row.connectorType}</td>
                      <td className="py-2 pr-3">{row.operation}</td>
                      <td className="py-2 pr-3">
                        {t(`ecommerce.logStatus.${row.status === 'error' ? 'error' : 'success'}`)}
                      </td>
                      <td className="py-2 text-red-700">{row.errorMsg ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
