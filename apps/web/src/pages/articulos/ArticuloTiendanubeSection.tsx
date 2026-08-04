import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  tiendanubeAPI,
  type TiendanubePublicacionStatus,
} from '@/lib/api'
import IfIntegration from '@/components/IfIntegration'
import { CanAccess } from '@/components/CanAccess'

type ArticuloTiendanubeSectionProps = {
  articuloId: number
}

/**
 * @en Tiendanube listing opt-in panel on the article form (#187).
 * @es Panel opt-in de publicación Tiendanube en el formulario de artículo (#187).
 * @pt-BR Painel opt-in de anúncio Tiendanube no formulário do artigo (#187).
 */
export default function ArticuloTiendanubeSection({
  articuloId,
}: ArticuloTiendanubeSectionProps) {
  const { t } = useTranslation('articulos')
  const [status, setStatus] = useState<TiendanubePublicacionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tiendanubeAPI.getArticuloListing(articuloId)
      setStatus(data)
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestFailedError ? err.message : t('tiendanube.errorLoad')
      setError(message)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [articuloId, t])

  useEffect(() => {
    void load()
  }, [load])

  const onPublish = async () => {
    setSaving(true)
    setError(null)
    try {
      const data = await tiendanubeAPI.upsertArticuloListing(articuloId)
      setStatus(data)
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('tiendanube.errorSave'))
    } finally {
      setSaving(false)
    }
  }

  const onUnlink = async () => {
    setSaving(true)
    setError(null)
    try {
      await tiendanubeAPI.unlinkArticuloListing(articuloId)
      setStatus({
        linked: false,
        hasPhotos: status?.hasPhotos ?? false,
        photoWarning: status?.photoWarning ?? true,
      })
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('tiendanube.errorUnlink'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfIntegration id="tiendanube">
      <CanAccess permission="products.manage">
        <section
          className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3"
          aria-labelledby="articulo-tiendanube-title"
          data-testid="articulo-tiendanube-section"
        >
          <h3
            id="articulo-tiendanube-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {t('tiendanube.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('tiendanube.subtitle')}</p>

          {loading ? (
            <p
              className="text-sm text-slate-600 dark:text-slate-400"
              data-testid="articulo-tiendanube-loading"
            >
              {t('tiendanube.loading')}
            </p>
          ) : null}

          {error ? (
            <p
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
              data-testid="articulo-tiendanube-error"
            >
              {error}
            </p>
          ) : null}

          {status?.photoWarning ? (
            <p
              className="text-sm text-amber-800 dark:text-amber-200"
              role="status"
              data-testid="articulo-tiendanube-photo-warning"
            >
              {t('tiendanube.photoWarning')}
            </p>
          ) : null}

          {status?.linked ? (
            <div className="space-y-2 text-sm" data-testid="articulo-tiendanube-linked">
              <p>
                <span className="font-semibold">{t('tiendanube.status')}: </span>
                {status.estado ?? '—'} / {status.syncStatus ?? '—'}
              </p>
              {status.tnProductId ? (
                <p data-testid="articulo-tiendanube-product-id">
                  <span className="font-semibold">{t('tiendanube.productId')}: </span>
                  {status.tnProductId}
                </p>
              ) : null}
              {status.syncError ? (
                <p
                  className="text-red-700 dark:text-red-300"
                  data-testid="articulo-tiendanube-sync-error"
                >
                  {status.syncError}
                </p>
              ) : null}
              {status.permalink ? (
                <p>
                  <a
                    href={status.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 dark:text-blue-300 underline"
                    data-testid="articulo-tiendanube-permalink"
                  >
                    {t('tiendanube.openListing')}
                  </a>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-sky-600 text-white font-semibold disabled:opacity-50"
                  onClick={() => void onPublish()}
                  disabled={saving || Boolean(status.photoWarning)}
                  data-testid="articulo-tiendanube-resync"
                >
                  {t('tiendanube.resync')}
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                  onClick={() => void onUnlink()}
                  disabled={saving}
                  data-testid="articulo-tiendanube-unlink"
                >
                  {t('tiendanube.unlink')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2" data-testid="articulo-tiendanube-publish-form">
              <button
                type="button"
                className="px-3 py-2 rounded bg-sky-600 text-white font-semibold disabled:opacity-50"
                onClick={() => void onPublish()}
                disabled={saving || loading || Boolean(status?.photoWarning)}
                data-testid="articulo-tiendanube-publish"
              >
                {saving ? t('tiendanube.publishing') : t('tiendanube.publish')}
              </button>
            </div>
          )}
        </section>
      </CanAccess>
    </IfIntegration>
  )
}
