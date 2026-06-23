import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { remitosAPI, type RemitoDTO } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function RemitosSection() {
  const { t } = useTranslation('facturacion')
  const [remitos, setRemitos] = useState<RemitoDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await remitosAPI.list()
      setRemitos(res?.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (id: number, fn: () => Promise<RemitoDTO>) => {
    setActionId(id)
    setActionError(null)
    try {
      await fn()
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div data-testid="remitos-section">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('remitos.title')}</h2>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => void load()}
          data-testid="remitos-refresh"
        >
          ↻
        </button>
      </div>

      <AsyncWrapper loading={loading} error={error}>
        {actionError && (
          <p className="text-sm text-red-600 mb-2" role="alert">
            {actionError}
          </p>
        )}
        {remitos.length === 0 ? (
          <p className="text-slate-500" data-testid="remitos-empty">
            {t('remitos.empty')}
          </p>
        ) : (
          <table className="min-w-full text-sm" data-testid="remitos-table">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-4">{t('remitos.columns.referencia')}</th>
                <th className="py-2 pr-4">{t('remitos.columns.cliente')}</th>
                <th className="py-2 pr-4">{t('remitos.columns.estado')}</th>
                <th className="py-2 pr-4">{t('remitos.columns.fecha')}</th>
                <th className="py-2">{t('remitos.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {remitos.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800" data-testid={`remito-row-${r.id}`}>
                  <td className="py-2 pr-4">{r.referencia}</td>
                  <td className="py-2 pr-4">{r.cliente?.rsocial ?? '—'}</td>
                  <td className="py-2 pr-4">{t(`remitos.estado.${r.estado}`)}</td>
                  <td className="py-2 pr-4">{new Date(r.fecha).toLocaleDateString()}</td>
                  <td className="py-2 flex flex-wrap gap-2">
                    {r.estado === 'borrador' && (
                      <CanAccess permission="sales.create">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                          disabled={actionId === r.id}
                          data-testid={`remito-emitir-${r.id}`}
                          onClick={() => void runAction(r.id, () => remitosAPI.emitir(r.id))}
                        >
                          {t('remitos.emitir')}
                        </button>
                      </CanAccess>
                    )}
                    {(r.estado === 'emitido' || r.estado === 'entregado') && (
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                        disabled={actionId === r.id}
                        data-testid={`remito-pdf-${r.id}`}
                        onClick={async () => {
                          setActionId(r.id)
                          try {
                            const blob = await remitosAPI.downloadPdf(r.id)
                            triggerBlobDownload(blob, `${r.referencia}.pdf`)
                          } catch (err) {
                            setActionError(err instanceof Error ? err.message : String(err))
                          } finally {
                            setActionId(null)
                          }
                        }}
                      >
                        {t('remitos.pdf')}
                      </button>
                    )}
                    {r.estado === 'emitido' && (
                      <CanAccess permission="sales.cancel">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                          disabled={actionId === r.id}
                          data-testid={`remito-anular-${r.id}`}
                          onClick={() => void runAction(r.id, () => remitosAPI.anular(r.id))}
                        >
                          {t('remitos.anular')}
                        </button>
                      </CanAccess>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AsyncWrapper>
    </div>
  )
}
