import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { portalAPI } from '@/lib/portalApi'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

type PortalPedidoRow = {
  id: number
  estado: string
  total: string
  createdAt: string
  validUntil: string | null
  facturaRef: string | null
  remitoEstado: string | null
}

export default function PortalPedidosPage() {
  const { t } = useTranslation('portal')
  const { tenantSlug } = usePortalAuth()
  const [pedidos, setPedidos] = useState<PortalPedidoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await portalAPI.listPedidos(tenantSlug)
      setPedidos(data.pedidos)
    } catch {
      setError(t('pedidos.errorLoad'))
    } finally {
      setLoading(false)
    }
  }, [tenantSlug, t])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section aria-labelledby="portal-pedidos-title" data-testid="portal-pedidos-page">
      <h1 id="portal-pedidos-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t('pedidos.title')}
      </h1>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-slate-600" role="status" aria-busy="true">
          {t('pedidos.loading')}
        </p>
      ) : pedidos.length === 0 ? (
        <p className="mt-6 text-slate-600" data-testid="portal-pedidos-empty">
          {t('pedidos.empty')}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm" data-testid="portal-pedidos-table">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colId')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colFecha')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colEstado')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colTotal')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colFactura')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('pedidos.colRemito')}
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2">#{p.id}</td>
                  <td className="px-2 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 py-2">{p.estado}</td>
                  <td className="px-2 py-2">${p.total}</td>
                  <td className="px-2 py-2">{p.facturaRef ?? '—'}</td>
                  <td className="px-2 py-2">{p.remitoEstado ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
