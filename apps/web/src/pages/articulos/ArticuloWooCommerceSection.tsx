import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  woocommerceAPI,
  type WooCommercePublicacionStatus,
} from '@/lib/api'
import IfIntegration from '@/components/IfIntegration'
import { CanAccess } from '@/components/CanAccess'

type ArticuloWooCommerceSectionProps = {
  articuloId: number
}

/**
 * @en WooCommerce listing opt-in panel on the article form (#188).
 * @es Panel opt-in de publicación WooCommerce en el formulario de artículo (#188).
 * @pt-BR Painel opt-in de anúncio WooCommerce no formulário do artigo (#188).
 */
export default function ArticuloWooCommerceSection({
  articuloId,
}: ArticuloWooCommerceSectionProps) {
  const { t } = useTranslation('articulos')
  const [status, setStatus] = useState<WooCommercePublicacionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await woocommerceAPI.getArticuloListing(articuloId)
      setStatus(data)
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestFailedError ? err.message : t('woocommerce.errorLoad')
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
      const data = await woocommerceAPI.upsertArticuloListing(articuloId)
      setStatus(data)
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('woocommerce.errorSave'))
    } finally {
      setSaving(false)
    }
  }

  const onUnlink = async () => {
    setSaving(true)
    setError(null)
    try {
      await woocommerceAPI.unlinkArticuloListing(articuloId)
      setStatus({
        linked: false,
        hasPhotos: status?.hasPhotos ?? false,
        photoWarning: status?.photoWarning ?? true,
      })
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('woocommerce.errorUnlink'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfIntegration id="woocommerce">
      <CanAccess permission="products.manage">
        <section
          className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3"
          aria-labelledby="articulo-woocommerce-title"
          data-testid="articulo-woocommerce-section"
        >
          <h3
            id="articulo-woocommerce-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {t('woocommerce.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('woocommerce.subtitle')}
          </p>

          {loading ? (
            <p
              className="text-sm text-slate-600 dark:text-slate-400"
              data-testid="articulo-woocommerce-loading"
            >
              {t('woocommerce.loading')}
            </p>
          ) : null}

          {error ? (
            <p
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
              data-testid="articulo-woocommerce-error"
            >
              {error}
            </p>
          ) : null}

          {status?.photoWarning ? (
            <p
              className="text-sm text-amber-800 dark:text-amber-200"
              role="status"
              data-testid="articulo-woocommerce-photo-warning"
            >
              {t('woocommerce.photoWarning')}
            </p>
          ) : null}

          {status?.linked ? (
            <div className="space-y-2 text-sm" data-testid="articulo-woocommerce-linked">
              <p>
                <span className="font-semibold">{t('woocommerce.status')}: </span>
                {status.estado ?? '—'} / {status.syncStatus ?? '—'}
              </p>
              {status.wcProductId ? (
                <p data-testid="articulo-woocommerce-product-id">
                  <span className="font-semibold">{t('woocommerce.productId')}: </span>
                  {status.wcProductId}
                </p>
              ) : null}
              {status.syncError ? (
                <p
                  className="text-red-700 dark:text-red-300"
                  data-testid="articulo-woocommerce-sync-error"
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
                    data-testid="articulo-woocommerce-permalink"
                  >
                    {t('woocommerce.openListing')}
                  </a>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-sky-600 text-white font-semibold disabled:opacity-50"
                  onClick={() => void onPublish()}
                  disabled={saving || Boolean(status.photoWarning)}
                  data-testid="articulo-woocommerce-resync"
                >
                  {t('woocommerce.resync')}
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                  onClick={() => void onUnlink()}
                  disabled={saving}
                  data-testid="articulo-woocommerce-unlink"
                >
                  {t('woocommerce.unlink')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2" data-testid="articulo-woocommerce-publish-form">
              <button
                type="button"
                className="px-3 py-2 rounded bg-sky-600 text-white font-semibold disabled:opacity-50"
                onClick={() => void onPublish()}
                disabled={saving || loading || Boolean(status?.photoWarning)}
                data-testid="articulo-woocommerce-publish"
              >
                {saving ? t('woocommerce.publishing') : t('woocommerce.publish')}
              </button>
            </div>
          )}
        </section>
      </CanAccess>
    </IfIntegration>
  )
}
