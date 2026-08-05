import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tiendanubeAPI, type TiendanubeOrdenRow } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

const FILTERS = ['pendiente', 'facturada', 'cancelada', 'all'] as const

function formatMoney(value: string | null): string {
  if (value == null) return '—'
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

/**
 * @en Tiendanube imported orders list with invoice action (#187).
 * @es Listado de órdenes Tiendanube importadas con facturación (#187).
 * @pt-BR Listagem de pedidos Tiendanube importados com faturamento (#187).
 */
export default function TiendanubeOrdenesPanel() {
  const { t } = useTranslation('pedidos')
  const [ordenes, setOrdenes] = useState<TiendanubeOrdenRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pendiente')
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await tiendanubeAPI.listOrdenes({ estado: filter })
      setOrdenes(res.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('tiendanube.loadError')))
    } finally {
      setLoading(false)
    }
  }, [filter, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleFacturar = async (row: TiendanubeOrdenRow) => {
    setActionError(null)
    setInvoiceLoadingId(row.tnOrderId)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await tiendanubeAPI.facturarOrden(row.tnOrderId, {
        fecha: today,
        tipo: 'B',
        numero: 1,
        prefijo: '0001',
      })
      await load()
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('tiendanube.invoiceError')
      setActionError(msg)
    } finally {
      setInvoiceLoadingId(null)
    }
  }

  return (
    <div data-testid="tiendanube-ordenes-panel">
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <label
          htmlFor="tiendanube-ordenes-filter"
          className="text-sm text-slate-600 dark:text-slate-300"
        >
          {t('tiendanube.filterEstado')}
        </label>
        <select
          id="tiendanube-ordenes-filter"
          className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
          data-testid="tiendanube-ordenes-filter"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {t(`tiendanube.filter.${f}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => void load()}
          data-testid="tiendanube-ordenes-refresh-btn"
          aria-label={t('tiendanube.refresh')}
        >
          ↻
        </button>
      </div>

      {actionError ? (
        <p
          className="mb-3 text-sm text-red-600 dark:text-red-400"
          data-testid="tiendanube-ordenes-action-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      <AsyncWrapper loading={loading} error={loadError}>
        {ordenes.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400" data-testid="tiendanube-ordenes-empty">
            {t('tiendanube.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" data-testid="tiendanube-ordenes-table">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-4">{t('tiendanube.columns.tnOrderId')}</th>
                  <th className="py-2 pr-4">{t('tiendanube.columns.buyer')}</th>
                  <th className="py-2 pr-4">{t('tiendanube.columns.status')}</th>
                  <th className="py-2 pr-4">{t('tiendanube.columns.pedido')}</th>
                  <th className="py-2 pr-4">{t('tiendanube.columns.total')}</th>
                  <th className="py-2">{t('tiendanube.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                    data-testid={`tiendanube-orden-row-${o.tnOrderId}`}
                  >
                    <td className="py-2 pr-4">{o.tnOrderId}</td>
                    <td className="py-2 pr-4">
                      {o.buyerNickname ?? o.clienteRsocial ?? '—'}
                      {o.cuitPending ? (
                        <span
                          className="ml-2 text-xs text-amber-700 dark:text-amber-400"
                          data-testid={`tiendanube-cuit-pending-${o.tnOrderId}`}
                        >
                          {t('tiendanube.cuitPending')}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4">{o.status}</td>
                    <td className="py-2 pr-4">
                      {o.pedidoId != null ? `#${o.pedidoId}` : '—'}
                      {o.pedidoEstado ? ` (${o.pedidoEstado})` : ''}
                    </td>
                    <td className="py-2 pr-4">{formatMoney(o.pedidoTotal)}</td>
                    <td className="py-2">
                      {o.pedidoEstado === 'confirmed' || o.pedidoEstado === 'draft' ? (
                        <CanAccess permission="sales.create">
                          <button
                            type="button"
                            className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
                            data-testid={`tiendanube-facturar-${o.tnOrderId}`}
                            disabled={invoiceLoadingId === o.tnOrderId}
                            onClick={() => void handleFacturar(o)}
                          >
                            {invoiceLoadingId === o.tnOrderId
                              ? t('tiendanube.invoicing')
                              : t('tiendanube.invoice')}
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
  )
}
