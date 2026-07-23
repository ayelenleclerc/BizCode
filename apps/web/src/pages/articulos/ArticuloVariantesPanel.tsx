import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogVariantsAPI } from '@/lib/api'
import type {
  ArticuloImagenRow,
  ArticuloOfertaRow,
  ArticuloVarianteRow,
  CategoriaArticuloRow,
} from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import IfModule from '@/components/IfModule'

type Props = {
  articuloId: number | null
  categoriaId: number | null | undefined
  esPadre?: boolean
  padreId?: number | null
}

/**
 * @en Variant generation, offers and images panel for an article form (#235).
 * @es Panel de generación de variantes, ofertas e imágenes en ficha de artículo (#235).
 * @pt-BR Painel de geração de variantes, ofertas e imagens na ficha de artigo (#235).
 */
export default function ArticuloVariantesPanel({
  articuloId,
  categoriaId,
  esPadre,
  padreId,
}: Props) {
  const { t } = useTranslation('variantes')
  const [variantes, setVariantes] = useState<ArticuloVarianteRow[]>([])
  const [stockFamilia, setStockFamilia] = useState<number | null>(null)
  const [categoria, setCategoria] = useState<CategoriaArticuloRow | null>(null)
  const [selectedByAttr, setSelectedByAttr] = useState<Record<number, number[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [imagenes, setImagenes] = useState<ArticuloImagenRow[]>([])
  const [ofertas, setOfertas] = useState<ArticuloOfertaRow[]>([])
  const [offerPrecio, setOfferPrecio] = useState('')
  const [offerDesde, setOfferDesde] = useState('')
  const [offerHasta, setOfferHasta] = useState('')

  const load = useCallback(async () => {
    if (articuloId == null) return
    setError(null)
    try {
      const [vars, stock] = await Promise.all([
        catalogVariantsAPI.listVariantes(articuloId),
        catalogVariantsAPI.stockFamilia(articuloId),
      ])
      setVariantes(vars)
      setStockFamilia(stock.stockFamilia)
      const imgs = await catalogVariantsAPI.listImagenes(articuloId)
      setImagenes(imgs)
      if (!esPadre && !padreId) {
        // plain article: still allow images
      }
      if (padreId == null && !esPadre) {
        setOfertas(await catalogVariantsAPI.listOfertas(articuloId))
      } else if (padreId != null) {
        setOfertas(await catalogVariantsAPI.listOfertas(articuloId))
      } else {
        setOfertas([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.load'))
    }
  }, [articuloId, esPadre, padreId, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (categoriaId == null) {
      setCategoria(null)
      return
    }
    catalogVariantsAPI
      .getCategoria(categoriaId)
      .then(setCategoria)
      .catch(() => setCategoria(null))
  }, [categoriaId])

  const atributos = useMemo(() => categoria?.atributos ?? [], [categoria])

  const toggleValor = (atributoId: number, valorId: number) => {
    setSelectedByAttr((prev) => {
      const current = prev[atributoId] ?? []
      const next = current.includes(valorId)
        ? current.filter((id) => id !== valorId)
        : [...current, valorId]
      return { ...prev, [atributoId]: next }
    })
  }

  const onGenerate = async () => {
    if (articuloId == null) return
    setError(null)
    const groups = atributos
      .map((a) => selectedByAttr[a.id] ?? [])
      .filter((g) => g.length > 0)
    if (groups.length === 0) {
      setError(t('errors.needCategory'))
      return
    }
    try {
      await catalogVariantsAPI.generarVariantes(articuloId, {
        atributoValorIdsPorAtributo: groups,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generate'))
    }
  }

  const onUpload = async (file: File | null) => {
    if (!file || articuloId == null) return
    setError(null)
    try {
      await catalogVariantsAPI.uploadImagen(articuloId, file)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.load'))
    }
  }

  const onAddOffer = async (e: FormEvent) => {
    e.preventDefault()
    if (articuloId == null) return
    setError(null)
    try {
      await catalogVariantsAPI.createOferta(articuloId, {
        precioOferta: Number(offerPrecio),
        vigenciaDesde: new Date(offerDesde).toISOString(),
        vigenciaHasta: new Date(offerHasta).toISOString(),
        activa: true,
      })
      setOfferPrecio('')
      setOfferDesde('')
      setOfferHasta('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.load'))
    }
  }

  if (articuloId == null) {
    return (
      <p className="text-sm text-slate-600" data-testid="variantes-need-saved">
        {t('errors.needSaved')}
      </p>
    )
  }

  return (
    <IfModule flag="catalog.variants">
      <section className="mt-4 space-y-4 rounded border border-slate-200 p-3" data-testid="articulo-variantes-panel">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-medium">{t('title')}</h3>
          {esPadre ? (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs" data-testid="badge-padre">
              {t('parentBadge')}
            </span>
          ) : null}
          {padreId != null ? (
            <span className="rounded bg-sky-100 px-2 py-0.5 text-xs" data-testid="badge-variante">
              {t('variantBadge')}
            </span>
          ) : null}
          {stockFamilia != null ? (
            <span className="text-sm" data-testid="stock-familia">
              {t('stockFamilia', { stock: stockFamilia })}
            </span>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-700" data-testid="variantes-error">
            {error}
          </p>
        ) : null}

        {padreId == null ? (
          <>
            <p className="text-sm">{t('selectValues')}</p>
            {atributos.length === 0 ? (
              <p className="text-sm text-slate-600">{t('errors.needCategory')}</p>
            ) : (
              <div className="space-y-3" data-testid="variantes-atributos">
                {atributos.map((attr) => (
                  <fieldset key={attr.id} className="rounded border p-2">
                    <legend className="px-1 text-sm font-medium">{attr.nombre}</legend>
                    <div className="flex flex-wrap gap-2">
                      {attr.valores.map((v) => {
                        const checked = (selectedByAttr[attr.id] ?? []).includes(v.id)
                        return (
                          <label key={v.id} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleValor(attr.id, v.id)}
                              data-testid={`valor-${v.id}`}
                            />
                            {v.valor}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
            <CanAccess permission="products.manage">
              <button
                type="button"
                className="rounded bg-slate-800 px-3 py-2 text-white"
                onClick={() => void onGenerate()}
                data-testid="generar-variantes"
              >
                {t('generate')}
              </button>
            </CanAccess>

            {variantes.length === 0 ? (
              <p data-testid="variantes-empty">{t('empty')}</p>
            ) : (
              <table className="min-w-full text-left text-sm" data-testid="variantes-table">
                <thead>
                  <tr>
                    <th>{t('columns.codigo')}</th>
                    <th>{t('columns.descripcion')}</th>
                    <th>{t('columns.stock')}</th>
                    <th>{t('columns.precio')}</th>
                    <th>{t('columns.activo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v) => (
                    <tr key={v.id} data-testid={`variante-row-${v.id}`}>
                      <td>{v.codigo}</td>
                      <td>{v.descripcion}</td>
                      <td>{v.stock}</td>
                      <td>{v.precioLista1}</td>
                      <td>{v.activo ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}

        <div data-testid="imagenes-section">
          <h4 className="font-medium">{t('images.title')}</h4>
          <CanAccess permission="products.manage">
            <label className="mt-2 inline-block text-sm">
              <span className="sr-only">{t('images.upload')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
                data-testid="imagen-upload"
              />
            </label>
          </CanAccess>
          {imagenes.length === 0 ? (
            <p className="text-sm">{t('images.empty')}</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {imagenes.map((img) => (
                <li key={img.id} className="relative" data-testid={`imagen-${img.id}`}>
                  <img src={img.urlThumb} alt="" className="h-16 w-16 object-cover" />
                  <CanAccess permission="products.manage">
                    <button
                      type="button"
                      className="absolute right-0 top-0 bg-white/90 px-1 text-xs text-red-700"
                      onClick={() =>
                        void catalogVariantsAPI.removeImagen(articuloId, img.id).then(load)
                      }
                      data-testid={`imagen-remove-${img.id}`}
                    >
                      {t('images.remove')}
                    </button>
                  </CanAccess>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!esPadre ? (
          <div data-testid="ofertas-section">
            <h4 className="font-medium">{t('offers.title')}</h4>
            {ofertas.length === 0 ? (
              <p className="text-sm">{t('offers.empty')}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {ofertas.map((o) => (
                  <li key={o.id} className="flex items-center gap-2" data-testid={`oferta-${o.id}`}>
                    <span>
                      {o.precioOferta} ({o.vigenciaDesde.slice(0, 10)} → {o.vigenciaHasta.slice(0, 10)})
                    </span>
                    <CanAccess permission="products.manage">
                      <button
                        type="button"
                        className="text-red-700 underline"
                        onClick={() =>
                          void catalogVariantsAPI.removeOferta(articuloId, o.id).then(load)
                        }
                      >
                        {t('offers.remove')}
                      </button>
                    </CanAccess>
                  </li>
                ))}
              </ul>
            )}
            <CanAccess permission="products.manage">
              <form onSubmit={onAddOffer} className="mt-2 grid max-w-lg gap-2 md:grid-cols-3" data-testid="oferta-form">
                <label className="text-sm">
                  {t('offers.precio')}
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={offerPrecio}
                    onChange={(e) => setOfferPrecio(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    data-testid="oferta-precio"
                  />
                </label>
                <label className="text-sm">
                  {t('offers.desde')}
                  <input
                    required
                    type="date"
                    value={offerDesde}
                    onChange={(e) => setOfferDesde(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    data-testid="oferta-desde"
                  />
                </label>
                <label className="text-sm">
                  {t('offers.hasta')}
                  <input
                    required
                    type="date"
                    value={offerHasta}
                    onChange={(e) => setOfferHasta(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    data-testid="oferta-hasta"
                  />
                </label>
                <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-white md:col-span-3" data-testid="oferta-add">
                  {t('offers.add')}
                </button>
              </form>
            </CanAccess>
          </div>
        ) : null}
      </section>
    </IfModule>
  )
}
