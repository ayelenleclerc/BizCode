import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { woocommerceAPI, type WooCommerceOrdenRow } from '@/lib/api'
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
 * @en WooCommerce imported orders list with invoice action (#188).
 * @es Listado de órdenes WooCommerce importadas con facturación (#188).
 * @pt-BR Listagem de pedidos WooCommerce importados com faturamento (#188).
 */
export default function WooCommerceOrdenesPanel() {
  const { t } = useTranslation('pedidos')
  const [ordenes, setOrdenes] = useState<WooCommerceOrdenRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pendiente')
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await woocommerceAPI.listOrdenes({ estado: filter })
      setOrdenes(res.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('woocommerce.loadError')))
    } finally {
      setLoading(false)
    }
  }, [filter, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleFacturar = async (row: WooCommerceOrdenRow) => {
    setActionError(null)
    setInvoiceLoadingId(row.wcOrderId)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await woocommerceAPI.facturarOrden(row.wcOrderId, {
        fecha: today,
        tipo: 'B',
        numero: 1,
        prefijo: '0001',
      })
      await load()
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('woocommerce.invoiceError')
      setActionError(msg)
    } finally {
      setInvoiceLoadingId(null)
    }
  }

  return (
    <div data-testid="woocommerce-ordenes-panel">
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <label
          htmlFor="woocommerce-ordenes-filter"
          className="text-sm text-slate-600 dark:text-slate-300"
        >
          {t('woocommerce.filterEstado')}
        </label>
        <select
          id="woocommerce-ordenes-filter"
          className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
          data-testid="woocommerce-ordenes-filter"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {t(`woocommerce.filter.${f}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => void load()}
          data-testid="woocommerce-ordenes-refresh-btn"
          aria-label={t('woocommerce.refresh')}
        >
          ↻
        </button>
      </div>

      {actionError ? (
        <p
          className="mb-3 text-sm text-red-600 dark:text-red-400"
          data-testid="woocommerce-ordenes-action-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      <AsyncWrapper loading={loading} error={loadError}>
        {ordenes.length === 0 ? (
          <p
            className="text-slate-500 dark:text-slate-400"
            data-testid="woocommerce-ordenes-empty"
          >
            {t('woocommerce.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" data-testid="woocommerce-ordenes-table">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-4">{t('woocommerce.columns.wcOrderId')}</th>
                  <th className="py-2 pr-4">{t('woocommerce.columns.buyer')}</th>
                  <th className="py-2 pr-4">{t('woocommerce.columns.status')}</th>
                  <th className="py-2 pr-4">{t('woocommerce.columns.pedido')}</th>
                  <th className="py-2 pr-4">{t('woocommerce.columns.total')}</th>
                  <th className="py-2">{t('woocommerce.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                    data-testid={`woocommerce-orden-row-${o.wcOrderId}`}
                  >
                    <td className="py-2 pr-4">{o.wcOrderId}</td>
                    <td className="py-2 pr-4">
                      {o.buyerNickname ?? o.clienteRsocial ?? '—'}
                      {o.cuitPending ? (
                        <span
                          className="ml-2 text-xs text-amber-700 dark:text-amber-400"
                          data-testid={`woocommerce-cuit-pending-${o.wcOrderId}`}
                        >
                          {t('woocommerce.cuitPending')}
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
                            data-testid={`woocommerce-facturar-${o.wcOrderId}`}
                            disabled={invoiceLoadingId === o.wcOrderId}
                            onClick={() => void handleFacturar(o)}
                          >
                            {invoiceLoadingId === o.wcOrderId
                              ? t('woocommerce.invoicing')
                              : t('woocommerce.invoice')}
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
