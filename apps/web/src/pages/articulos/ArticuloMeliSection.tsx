import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  meliAPI,
  type MeliCategorySearchHit,
  type MeliPublicacionStatus,
} from '@/lib/api'
import IfIntegration from '@/components/IfIntegration'
import { CanAccess } from '@/components/CanAccess'

type ArticuloMeliSectionProps = {
  articuloId: number
}

/**
 * @en Mercado Libre listing opt-in panel on the article form (#184).
 * @es Panel opt-in de publicación Mercado Libre en el formulario de artículo (#184).
 * @pt-BR Painel opt-in de anúncio Mercado Livre no formulário do artigo (#184).
 */
export default function ArticuloMeliSection({ articuloId }: ArticuloMeliSectionProps) {
  const { t } = useTranslation('articulos')
  const [status, setStatus] = useState<MeliPublicacionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [hits, setHits] = useState<MeliCategorySearchHit[]>([])
  const [searching, setSearching] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await meliAPI.getArticuloListing(articuloId)
      setStatus(data)
      if (data.meliCategoryId) setCategoryId(data.meliCategoryId)
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestFailedError ? err.message : t('meli.errorLoad')
      setError(message)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [articuloId, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const q = categoryQuery.trim()
    if (q.length < 2) {
      setHits([])
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      setSearching(true)
      void meliAPI
        .searchCategories(q)
        .then((rows) => {
          if (!cancelled) setHits(rows)
        })
        .catch(() => {
          if (!cancelled) setHits([])
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [categoryQuery])

  const onPublish = async () => {
    if (!categoryId.trim()) {
      setError(t('meli.errorCategoryRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const data = await meliAPI.upsertArticuloListing(articuloId, {
        meliCategoryId: categoryId.trim(),
      })
      setStatus(data)
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('meli.errorSave'))
    } finally {
      setSaving(false)
    }
  }

  const onUnlink = async () => {
    setSaving(true)
    setError(null)
    try {
      await meliAPI.unlinkArticuloListing(articuloId)
      setStatus({
        linked: false,
        hasPhotos: status?.hasPhotos ?? false,
        photoWarning: status?.photoWarning ?? true,
      })
      setCategoryId('')
    } catch (err: unknown) {
      setError(err instanceof ApiRequestFailedError ? err.message : t('meli.errorUnlink'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfIntegration id="meli">
      <CanAccess permission="products.manage">
        <section
          className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3"
          aria-labelledby="articulo-meli-title"
          data-testid="articulo-meli-section"
        >
          <h3 id="articulo-meli-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('meli.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('meli.subtitle')}</p>

          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="articulo-meli-loading">
              {t('meli.loading')}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert" data-testid="articulo-meli-error">
              {error}
            </p>
          ) : null}

          {status?.photoWarning ? (
            <p
              className="text-sm text-amber-800 dark:text-amber-200"
              role="status"
              data-testid="articulo-meli-photo-warning"
            >
              {t('meli.photoWarning')}
            </p>
          ) : null}

          {status?.linked ? (
            <div className="space-y-2 text-sm" data-testid="articulo-meli-linked">
              <p>
                <span className="font-semibold">{t('meli.status')}: </span>
                {status.estado ?? '—'} / {status.syncStatus ?? '—'}
              </p>
              {status.syncError ? (
                <p className="text-red-700 dark:text-red-300" data-testid="articulo-meli-sync-error">
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
                    data-testid="articulo-meli-permalink"
                  >
                    {t('meli.openListing')}
                  </a>
                </p>
              ) : null}
              <button
                type="button"
                className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                onClick={() => void onUnlink()}
                disabled={saving}
                data-testid="articulo-meli-unlink"
              >
                {t('meli.unlink')}
              </button>
            </div>
          ) : (
            <div className="space-y-2" data-testid="articulo-meli-publish-form">
              <label htmlFor="articulo-meli-category-q" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('meli.categorySearch')}
              </label>
              <input
                id="articulo-meli-category-q"
                type="search"
                value={categoryQuery}
                onChange={(e) => setCategoryQuery(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800"
                data-testid="articulo-meli-category-search"
                autoComplete="off"
              />
              {searching ? (
                <p className="text-xs text-slate-500">{t('meli.searching')}</p>
              ) : null}
              {hits.length > 0 ? (
                <ul
                  className="border border-slate-200 dark:border-slate-600 rounded divide-y divide-slate-200 dark:divide-slate-600 max-h-40 overflow-y-auto"
                  data-testid="articulo-meli-category-hits"
                >
                  {hits.map((hit) => (
                    <li key={hit.category_id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => {
                          setCategoryId(hit.category_id)
                          setCategoryQuery(hit.category_name)
                          setHits([])
                        }}
                        data-testid={`articulo-meli-category-hit-${hit.category_id}`}
                      >
                        {hit.category_name} ({hit.category_id})
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {categoryId ? (
                <p className="text-xs text-slate-600 dark:text-slate-400" data-testid="articulo-meli-category-selected">
                  {t('meli.selectedCategory')}: {categoryId}
                </p>
              ) : null}
              <button
                type="button"
                className="px-3 py-2 rounded bg-yellow-400 text-slate-900 font-semibold disabled:opacity-50"
                onClick={() => void onPublish()}
                disabled={saving || Boolean(status?.photoWarning)}
                data-testid="articulo-meli-publish"
              >
                {t('meli.publish')}
              </button>
            </div>
          )}

          {status?.linked ? (
            <div className="pt-2">
              <button
                type="button"
                className="px-3 py-2 rounded bg-yellow-400 text-slate-900 font-semibold disabled:opacity-50"
                onClick={() => void onPublish()}
                disabled={saving || !categoryId.trim() || Boolean(status.photoWarning)}
                data-testid="articulo-meli-resync"
              >
                {t('meli.resync')}
              </button>
            </div>
          ) : null}
        </section>
      </CanAccess>
    </IfIntegration>
  )
}
