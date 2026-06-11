import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { portalAPI, type PortalFactura } from '@/lib/portalApi'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function PortalFacturasPage() {
  const { t } = useTranslation('portal')
  const { tenantSlug } = usePortalAuth()
  const [facturas, setFacturas] = useState<PortalFactura[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await portalAPI.listFacturas(tenantSlug, {
        ...(estado ? { estado } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      })
      setFacturas(data.facturas)
      setTotal(data.total)
    } catch {
      setError(t('facturas.errorLoad'))
    } finally {
      setLoading(false)
    }
  }, [tenantSlug, estado, from, to, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleDownload = async (facturaId: number, ref: string) => {
    setDownloadingId(facturaId)
    try {
      const blob = await portalAPI.downloadFacturaPdf(tenantSlug, facturaId)
      downloadBlob(blob, `factura-${ref.replace(/\//g, '-')}.pdf`)
    } catch {
      setError(t('facturas.errorPdf'))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <section aria-labelledby="portal-facturas-title" data-testid="portal-facturas-page">
      <h1 id="portal-facturas-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t('facturas.title')}
      </h1>

      <form
        className="mt-4 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void load()
        }}
      >
        <div>
          <label htmlFor="portal-facturas-estado" className="mb-1 block text-sm font-medium">
            {t('facturas.filterEstado')}
          </label>
          <select
            id="portal-facturas-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            data-testid="portal-facturas-estado-filter"
          >
            <option value="">{t('facturas.estadoAll')}</option>
            <option value="pendiente">{t('facturas.estadoPendiente')}</option>
            <option value="vencida">{t('facturas.estadoVencida')}</option>
            <option value="pagada">{t('facturas.estadoPagada')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="portal-facturas-from" className="mb-1 block text-sm font-medium">
            {t('facturas.filterFrom')}
          </label>
          <input
            id="portal-facturas-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <div>
          <label htmlFor="portal-facturas-to" className="mb-1 block text-sm font-medium">
            {t('facturas.filterTo')}
          </label>
          <input
            id="portal-facturas-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          data-testid="portal-facturas-apply-filters"
        >
          {t('facturas.applyFilters')}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-slate-600" role="status" aria-busy="true">
          {t('facturas.loading')}
        </p>
      ) : facturas.length === 0 ? (
        <p className="mt-6 text-slate-600" data-testid="portal-facturas-empty">
          {t('facturas.empty')}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm" data-testid="portal-facturas-table">
            <caption className="sr-only">{t('facturas.tableCaption')}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colRef')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colFecha')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colTotal')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colPendiente')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colEstado')}
                </th>
                <th scope="col" className="px-2 py-2">
                  {t('facturas.colActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2">{f.ref}</td>
                  <td className="px-2 py-2">{new Date(f.fecha).toLocaleDateString()}</td>
                  <td className="px-2 py-2">${f.total}</td>
                  <td className="px-2 py-2">${f.pendiente}</td>
                  <td className="px-2 py-2">{t(`facturas.estado.${f.estado}`)}</td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50 dark:border-slate-600"
                      disabled={downloadingId === f.id}
                      onClick={() => void handleDownload(f.id, f.ref)}
                      data-testid={`portal-factura-pdf-${f.id}`}
                    >
                      {t('facturas.downloadPdf')}
                    </button>
                    <button
                      type="button"
                      disabled
                      title={t('facturas.payOnlineDisabled')}
                      className="ml-2 rounded border border-slate-200 px-2 py-1 text-slate-400"
                      data-testid={`portal-factura-pay-${f.id}`}
                    >
                      {t('facturas.payOnline')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500">{t('facturas.totalCount', { count: total })}</p>
        </div>
      )}
    </section>
  )
}
