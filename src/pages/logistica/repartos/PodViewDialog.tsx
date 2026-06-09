import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { repartosAPI, type RepartoItemPodDetail } from '@/lib/api'

type Props = {
  repartoId: number
  itemId: number
  open: boolean
  onClose: () => void
}

export default function PodViewDialog({ repartoId, itemId, open, onClose }: Props) {
  const { t } = useTranslation('pod')
  const [detail, setDetail] = useState<RepartoItemPodDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const row = await repartosAPI.getItemPod(repartoId, itemId)
        if (!cancelled) setDetail(row ?? null)
      } catch {
        if (!cancelled) setError(t('errors.save'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, repartoId, itemId, t])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pod-view-title"
      data-testid="pod-view-dialog"
    >
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 id="pod-view-title" className="text-lg font-bold mb-4">
          {t('title')}
        </h2>
        {loading && <p role="status">{t('downloadHint')}</p>}
        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}
        {detail && (
          <dl className="text-sm space-y-2">
            <div>
              <dt className="font-medium">{t('receptorNombre')}</dt>
              <dd>{detail.receptorNombre ?? '—'}</dd>
            </div>
            {detail.receptorDni && (
              <div>
                <dt className="font-medium">{t('receptorDni')}</dt>
                <dd>{detail.receptorDni}</dd>
              </div>
            )}
            {detail.notasEntrega && (
              <div>
                <dt className="font-medium">{t('notas')}</dt>
                <dd>{detail.notasEntrega}</dd>
              </div>
            )}
            {detail.motivoNoEntrega && (
              <div>
                <dt className="font-medium">{t('motivoLabel')}</dt>
                <dd>{t(`motivo.${detail.motivoNoEntrega}`)}</dd>
              </div>
            )}
            {detail.podMedia?.firmaBase64 && (
              <div>
                <dt className="font-medium mb-1">{t('signatureLabel')}</dt>
                <dd>
                  <img
                    src={detail.podMedia.firmaBase64}
                    alt={t('signatureLabel')}
                    className="max-w-full border rounded dark:border-slate-600"
                    data-testid="pod-view-firma"
                  />
                </dd>
              </div>
            )}
            {detail.podMedia?.fotoBase64 && (
              <div>
                <dt className="font-medium mb-1">{t('photoLabel')}</dt>
                <dd>
                  <img
                    src={detail.podMedia.fotoBase64}
                    alt={t('photoLabel')}
                    className="max-w-full border rounded dark:border-slate-600"
                    data-testid="pod-view-foto"
                  />
                </dd>
              </div>
            )}
            {!detail.hasPod && <p>{t('noPod')}</p>}
          </dl>
        )}
        <button type="button" onClick={onClose} className="mt-6 px-4 py-2 border rounded">
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
