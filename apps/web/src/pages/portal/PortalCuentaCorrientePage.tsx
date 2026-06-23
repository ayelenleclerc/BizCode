import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ClienteCuentaCorriente } from '@/types'
import { portalAPI } from '@/lib/portalApi'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function PortalCuentaCorrientePage() {
  const { t } = useTranslation('portal')
  const { tenantSlug } = usePortalAuth()
  const [data, setData] = useState<ClienteCuentaCorriente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cc = await portalAPI.getCuentaCorriente(tenantSlug)
      setData(cc)
    } catch {
      setError(t('cc.errorLoad'))
    } finally {
      setLoading(false)
    }
  }, [tenantSlug, t])

  useEffect(() => {
    void load()
  }, [load])

  const handlePdf = async () => {
    try {
      const blob = await portalAPI.downloadEstadoCuentaPdf(tenantSlug)
      downloadBlob(blob, 'estado-de-cuenta.pdf')
    } catch {
      setError(t('cc.errorPdf'))
    }
  }

  return (
    <section aria-labelledby="portal-cc-title" data-testid="portal-cc-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="portal-cc-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t('cc.title')}
        </h1>
        <button
          type="button"
          onClick={() => void handlePdf()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          data-testid="portal-cc-download-pdf"
        >
          {t('cc.downloadPdf')}
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-slate-600" role="status" aria-busy="true">
          {t('cc.loading')}
        </p>
      ) : data ? (
        <>
          <p className="mt-4 text-lg font-medium" data-testid="portal-cc-saldo">
            {t('cc.saldo')}: ${data.saldo}
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm" data-testid="portal-cc-table">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th scope="col" className="px-2 py-2">
                    {t('cc.colFecha')}
                  </th>
                  <th scope="col" className="px-2 py-2">
                    {t('cc.colTipo')}
                  </th>
                  <th scope="col" className="px-2 py-2">
                    {t('cc.colReferencia')}
                  </th>
                  <th scope="col" className="px-2 py-2">
                    {t('cc.colMonto')}
                  </th>
                  <th scope="col" className="px-2 py-2">
                    {t('cc.colSaldo')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.movimientos.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2">{new Date(m.fecha).toLocaleDateString()}</td>
                    <td className="px-2 py-2">{m.tipo}</td>
                    <td className="px-2 py-2">{m.referencia ?? '—'}</td>
                    <td className="px-2 py-2">${m.monto}</td>
                    <td className="px-2 py-2">${m.saldoPost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  )
}
