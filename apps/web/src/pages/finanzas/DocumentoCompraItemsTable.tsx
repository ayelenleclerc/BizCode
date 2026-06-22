import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import {
  articulosAPI,
  proveedoresAPI,
  type DocumentoCompraItemPreviewDTO,
  type ProveedorCatalogoRow,
} from '@/lib/api'
import DocumentoCompraArticuloInlineDialog from './DocumentoCompraArticuloInlineDialog'

const CONFIDENCE_REVIEW_THRESHOLD = 0.7

type ItemRow = DocumentoCompraItemPreviewDTO

type ArticuloSearchHit = {
  id: number
  codigo: number
  descripcion: string
  source: 'catalog' | 'search'
}

type Props = {
  items: ItemRow[]
  onChange: (items: ItemRow[]) => void
  proveedorId: string
  disabled?: boolean
}

function itemStatus(confianza: number | undefined): 'ok' | 'review' {
  if (confianza === undefined) return 'review'
  return confianza >= CONFIDENCE_REVIEW_THRESHOLD ? 'ok' : 'review'
}

function cellClass(status: 'ok' | 'review'): string {
  return status === 'ok'
    ? 'border-green-500 dark:border-green-600'
    : 'border-amber-400 dark:border-amber-500'
}

/**
 * @en Editable purchase document line items with catalog mapping (#277 Fase F/G).
 * @es Líneas editables de documento de compra con mapeo a catálogo (#277 Fase F/G).
 * @pt-BR Itens editáveis de documento de compra com mapeamento ao catálogo (#277 Fase F/G).
 */
export default function DocumentoCompraItemsTable({
  items,
  onChange,
  proveedorId,
  disabled = false,
}: Props) {
  const { t } = useTranslation('finanzas')
  const [catalogForProvId, setCatalogForProvId] = useState<{
    provId: number
    entries: ProveedorCatalogoRow[]
  } | null>(null)
  const [searchRowIndex, setSearchRowIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [apiSearchHits, setApiSearchHits] = useState<{
    fetchKey: string
    hits: ArticuloSearchHit[]
  } | null>(null)
  const [createRowIndex, setCreateRowIndex] = useState<number | null>(null)
  const provId = Number.parseInt(proveedorId, 10)
  const validProvId = Number.isInteger(provId) && provId >= 1 ? provId : null

  const catalogEntries = useMemo(
    () =>
      validProvId != null && catalogForProvId?.provId === validProvId
        ? catalogForProvId.entries
        : [],
    [validProvId, catalogForProvId],
  )

  const catalogLabels = useMemo(() => {
    const labels: Record<number, string> = {}
    for (const entry of catalogEntries) {
      labels[entry.articuloId] =
        `${entry.codigoProveedor} — ${entry.descripcion ?? entry.articulo.descripcion}`
    }
    return labels
  }, [catalogEntries])

  useEffect(() => {
    if (validProvId == null) return
    let cancelled = false
    void proveedoresAPI
      .listCatalogo(validProvId)
      .then((entries) => {
        if (cancelled) return
        setCatalogForProvId({ provId: validProvId, entries })
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogForProvId({ provId: validProvId, entries: [] })
        }
      })
    return () => {
      cancelled = true
    }
  }, [validProvId])

  const catalogSuggestions = useMemo(() => {
    if (searchRowIndex == null) return []
    const needle = (searchQuery || items[searchRowIndex]?.descripcion || '').toLowerCase()
    if (needle.length < 2) return []
    return catalogEntries
      .filter((entry) => {
        const text = `${entry.codigoProveedor} ${entry.descripcion ?? ''} ${entry.articulo.descripcion}`.toLowerCase()
        return text.includes(needle)
      })
      .slice(0, 8)
      .map((entry) => ({
        id: entry.articuloId,
        codigo: entry.articulo.codigo,
        descripcion: entry.descripcion ?? entry.articulo.descripcion,
        source: 'catalog' as const,
      }))
  }, [catalogEntries, items, searchQuery, searchRowIndex])

  const trimmedSearchQuery = searchQuery.trim()
  const searchFetchKey =
    searchRowIndex != null && trimmedSearchQuery.length >= 2
      ? `${searchRowIndex}:${trimmedSearchQuery}`
      : null

  const searchResults = useMemo((): ArticuloSearchHit[] => {
    if (searchRowIndex == null) return []
    if (trimmedSearchQuery.length < 2) return catalogSuggestions
    if (apiSearchHits?.fetchKey === searchFetchKey) return apiSearchHits.hits
    return catalogSuggestions
  }, [searchRowIndex, trimmedSearchQuery, catalogSuggestions, apiSearchHits, searchFetchKey])

  const searchLoading =
    searchFetchKey != null && apiSearchHits?.fetchKey !== searchFetchKey

  useEffect(() => {
    if (searchFetchKey == null) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void articulosAPI
        .list(trimmedSearchQuery)
        .then((list) => {
          if (cancelled) return
          const hits: ArticuloSearchHit[] = Array.isArray(list)
            ? list
                .filter(
                  (a): a is { id: number; codigo: number; descripcion: string } =>
                    typeof a?.id === 'number' && typeof a?.codigo === 'number',
                )
                .slice(0, 10)
                .map((a) => ({
                  id: a.id,
                  codigo: a.codigo,
                  descripcion: typeof a.descripcion === 'string' ? a.descripcion : '',
                  source: 'search' as const,
                }))
            : []
          const merged: ArticuloSearchHit[] = [...catalogSuggestions]
          for (const hit of hits) {
            if (!merged.some((m) => m.id === hit.id)) merged.push(hit)
          }
          setApiSearchHits({ fetchKey: searchFetchKey, hits: merged.slice(0, 12) })
        })
        .catch(() => {
          if (!cancelled) {
            setApiSearchHits({ fetchKey: searchFetchKey, hits: catalogSuggestions })
          }
        })
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [searchFetchKey, trimmedSearchQuery, catalogSuggestions])

  const updateRow = (index: number, patch: Partial<ItemRow>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const closeSearch = () => {
    setSearchRowIndex(null)
    setSearchQuery('')
    setApiSearchHits(null)
  }

  const mapArticulo = async (index: number, articuloId: number | null) => {
    if (articuloId == null) {
      updateRow(index, { articuloId: null })
      return
    }
    updateRow(index, { articuloId, confianza: 1 })
    closeSearch()
    if (catalogLabels[articuloId]) return
    try {
      const articulo = await articulosAPI.get(articuloId)
      if (articulo?.descripcion) {
        updateRow(index, {
          articuloId,
          descripcion: articulo.descripcion,
          confianza: 1,
        })
      }
    } catch {
      updateRow(index, { articuloId, confianza: 1 })
    }
  }

  const openSearch = (index: number) => {
    setSearchRowIndex(index)
    setSearchQuery(items[index]?.descripcion ?? '')
    setApiSearchHits(null)
  }

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
    if (searchRowIndex === index) setSearchRowIndex(null)
    if (createRowIndex === index) setCreateRowIndex(null)
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-slate-500 mb-4" data-testid="documento-compra-items-empty">
        {t('documentoCompra.itemsEmpty')}
      </p>
    )
  }

  const createRow = createRowIndex != null ? items[createRowIndex] : null

  return (
    <div className="mb-4 overflow-x-auto" data-testid="documento-compra-items-section">
      <h5 className="text-sm font-medium mb-2">{t('documentoCompra.itemsTitle')}</h5>
      <table
        className="w-full text-xs border border-slate-200 dark:border-slate-600"
        data-testid="documento-compra-items-table"
      >
        <caption className="sr-only">{t('documentoCompra.itemsCaption')}</caption>
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th scope="col" className="text-left px-2 py-1">
              {t('documentoCompra.colDescripcion')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colCantidad')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colPrecio')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colSubtotal')}
            </th>
            <th scope="col" className="text-left px-2 py-1">
              {t('documentoCompra.colArticulo')}
            </th>
            <th scope="col" className="text-left px-2 py-1">
              {t('documentoCompra.colAcciones')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => {
            const status = itemStatus(row.confianza)
            const catalogHint = row.articuloId != null ? catalogLabels[row.articuloId] : undefined
            return (
              <tr
                key={`item-${index}-${row.descripcion.slice(0, 12)}`}
                className="border-t border-slate-200 dark:border-slate-600 align-top"
                data-testid={`documento-compra-item-row-${index}`}
              >
                <td className="px-2 py-1">
                  <input
                    type="text"
                    className={`w-full min-w-[8rem] rounded px-1 py-0.5 border bg-white dark:bg-slate-700 ${cellClass(status)}`}
                    value={row.descripcion}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colDescripcion')}
                    data-testid={`documento-compra-item-desc-${index}`}
                    onChange={(e) => updateRow(index, { descripcion: e.target.value, confianza: 1 })}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className={`w-16 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 text-right ${cellClass(status)}`}
                    value={row.cantidad}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colCantidad')}
                    data-testid={`documento-compra-item-qty-${index}`}
                    onChange={(e) => {
                      const cantidad = Number.parseFloat(e.target.value)
                      updateRow(index, {
                        cantidad: Number.isFinite(cantidad) ? cantidad : 0,
                        confianza: 1,
                      })
                    }}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className={`w-20 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 text-right ${cellClass(status)}`}
                    value={row.precioUnitario}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colPrecio')}
                    data-testid={`documento-compra-item-price-${index}`}
                    onChange={(e) => {
                      const precioUnitario = Number.parseFloat(e.target.value)
                      updateRow(index, {
                        precioUnitario: Number.isFinite(precioUnitario) ? precioUnitario : 0,
                        confianza: 1,
                      })
                    }}
                  />
                </td>
                <td className="px-2 py-1 text-right font-mono">{row.subtotal.toLocaleString('es-AR')}</td>
                <td className="px-2 py-1">
                  <label className="sr-only" htmlFor={`doc-item-articulo-${index}`}>
                    {t('documentoCompra.colArticulo')}
                  </label>
                  <input
                    id={`doc-item-articulo-${index}`}
                    type="number"
                    min={1}
                    className={`w-20 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 ${row.articuloId ? 'border-green-500' : 'border-amber-400'}`}
                    placeholder={t('documentoCompra.articuloIdPlaceholder')}
                    value={row.articuloId ?? ''}
                    disabled={disabled}
                    data-testid={`documento-compra-item-articulo-${index}`}
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      if (!raw) {
                        void mapArticulo(index, null)
                        return
                      }
                      const id = Number.parseInt(raw, 10)
                      if (Number.isInteger(id) && id > 0) void mapArticulo(index, id)
                    }}
                  />
                  {catalogHint ? (
                    <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[10rem]">
                      {catalogHint}
                    </span>
                  ) : null}
                  {searchRowIndex === index ? (
                    <div
                      className="mt-2 p-2 border rounded bg-slate-50 dark:bg-slate-900"
                      data-testid={`documento-compra-item-search-${index}`}
                    >
                      <label className="sr-only" htmlFor={`doc-item-search-${index}`}>
                        {t('documentoCompra.searchArticulo')}
                      </label>
                      <input
                        id={`doc-item-search-${index}`}
                        type="search"
                        className="w-full rounded px-1 py-0.5 border text-xs mb-1 bg-white dark:bg-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('documentoCompra.searchArticuloPlaceholder')}
                        disabled={disabled}
                      />
                      {searchLoading ? (
                        <p className="text-[10px] text-slate-500">{t('documentoCompra.searchLoading')}</p>
                      ) : null}
                      <ul className="max-h-24 overflow-y-auto" aria-label={t('documentoCompra.searchResults')}>
                        {searchResults.map((hit) => (
                          <li key={`hit-${hit.id}`}>
                            <button
                              type="button"
                              className="w-full text-left text-[10px] px-1 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              onClick={() => void mapArticulo(index, hit.id)}
                              disabled={disabled}
                              data-testid={`documento-compra-item-search-hit-${index}-${hit.id}`}
                            >
                              {hit.codigo} — {hit.descripcion}
                              {hit.source === 'catalog' ? ` (${t('documentoCompra.catalogMatch')})` : ''}
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className="mt-1 text-[10px] underline text-slate-600"
                        onClick={closeSearch}
                      >
                        {t('documentoCompra.closeSearch')}
                      </button>
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-1">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className="text-[10px] text-blue-600 dark:text-blue-400 underline text-left"
                      onClick={() => openSearch(index)}
                      disabled={disabled}
                      data-testid={`documento-compra-item-search-btn-${index}`}
                    >
                      {t('documentoCompra.searchArticulo')}
                    </button>
                    <CanAccess permission="products.manage">
                      <button
                        type="button"
                        className="text-[10px] text-blue-600 dark:text-blue-400 underline text-left"
                        onClick={() => setCreateRowIndex(index)}
                        disabled={disabled}
                        data-testid={`documento-compra-item-create-btn-${index}`}
                      >
                        {t('documentoCompra.createArticulo')}
                      </button>
                    </CanAccess>
                    <button
                      type="button"
                      className="text-[10px] text-slate-600 dark:text-slate-400 underline text-left"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                      data-testid={`documento-compra-item-ignore-btn-${index}`}
                    >
                      {t('documentoCompra.ignoreLine')}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <DocumentoCompraArticuloInlineDialog
        open={createRowIndex != null && createRow != null}
        initialDescripcion={createRow?.descripcion ?? ''}
        initialPrecio={createRow?.precioUnitario ?? 0}
        onClose={() => setCreateRowIndex(null)}
        onCreated={(articulo) => {
          if (createRowIndex != null) {
            updateRow(createRowIndex, {
              articuloId: articulo.id,
              descripcion: articulo.descripcion,
              confianza: 1,
            })
          }
          setCreateRowIndex(null)
        }}
      />
    </div>
  )
}
