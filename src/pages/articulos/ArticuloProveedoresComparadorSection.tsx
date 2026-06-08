import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  ApiRequestFailedError,
  articulosAPI,
  type ArticuloProveedorComparadorRow,
  type ArticuloProveedoresComparadorData,
} from '@/lib/api'
import type { ComprasOcPrefillState } from '@/lib/comprasOcPrefill'

type SortField = 'precio' | 'precioListaFecha' | 'ultimaCompra'
type SortDir = 'asc' | 'desc'

type Props = {
  articuloId: number
}

function formatMoney(value: string | null): string {
  if (value == null) return '—'
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return value
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString()
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000))
}

/**
 * @en Supplier price comparator for one article (#274).
 * @es Comparador de precios de proveedores para un artículo (#274).
 * @pt-BR Comparador de preços de fornecedores para um artigo (#274).
 */
export default function ArticuloProveedoresComparadorSection({ articuloId }: Props) {
  const { t } = useTranslation('articulos')
  const { t: tc } = useTranslation('common')
  const { claims } = useAuth()
  const navigate = useNavigate()
  const canStartOc = Boolean(claims?.permissions.includes('suppliers.manage'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ArticuloProveedoresComparadorData | null>(null)
  const [sortBy, setSortBy] = useState<SortField>('precio')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await articulosAPI.listProveedoresComparador(articuloId, { sortBy, sortDir })
      setData(result)
    } catch (err) {
      if (err instanceof ApiRequestFailedError) {
        setError(err.message)
      } else {
        setError(tc('errors.generic'))
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [articuloId, sortBy, sortDir, tc])

  useEffect(() => {
    void load()
  }, [load])

  const startOc = (row: ArticuloProveedorComparadorRow) => {
    const state: ComprasOcPrefillState = {
      ocPrefill: {
        proveedorId: row.proveedorId,
        articuloId,
        costoUnitario: row.precioLista,
      },
    }
    navigate('/compras', { state })
  }

  const renderPrecioFecha = (row: ArticuloProveedorComparadorRow) => {
    if (row.precioLista == null) {
      return <span>{t('comparador.sinPrecio')}</span>
    }
    const dias = daysSince(row.precioListaFecha)
    const staleLabel =
      row.precioDesactualizado && dias != null
        ? t('comparador.precioDesactualizado', { dias })
        : null
    return (
      <span
        className={
          row.precioDesactualizado
            ? 'inline-block px-1 rounded text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30'
            : undefined
        }
        title={staleLabel ?? undefined}
        data-testid={`comparador-precio-fecha-${row.proveedorId}`}
      >
        {formatDate(row.precioListaFecha)}
        {staleLabel ? (
          <span className="block text-xs" aria-hidden="true">
            ⚠
          </span>
        ) : null}
        <span className="sr-only">{staleLabel}</span>
      </span>
    )
  }

  const renderUltimaCompra = (row: ArticuloProveedorComparadorRow) => {
    const dias = daysSince(row.ultimaCompraFecha)
    if (row.ultimaCompraFecha == null) return '—'
    if (dias == null) return formatDate(row.ultimaCompraFecha)
    return t('comparador.diasAtras', { dias })
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500" data-testid="articulo-comparador-loading">
        {tc('status.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600" data-testid="articulo-comparador-error">
        {error}
      </p>
    )
  }

  if (!data) {
    return null
  }

  return (
    <section
      className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-4"
      aria-labelledby="articulo-comparador-title"
      data-testid="articulo-comparador-section"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="articulo-comparador-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('comparador.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('comparador.subtitle', {
              codigo: data.articuloCodigo,
              descripcion: data.articuloDescripcion,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div>
            <label htmlFor="articulo-comparador-sort-by" className="block text-xs text-slate-500 mb-1">
              {t('comparador.sortBy')}
            </label>
            <select
              id="articulo-comparador-sort-by"
              data-testid="articulo-comparador-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="precio">{t('comparador.sortPrecio')}</option>
              <option value="precioListaFecha">{t('comparador.sortPrecioFecha')}</option>
              <option value="ultimaCompra">{t('comparador.sortUltimaCompra')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="articulo-comparador-sort-dir" className="block text-xs text-slate-500 mb-1">
              {t('comparador.sortDir')}
            </label>
            <select
              id="articulo-comparador-sort-dir"
              data-testid="articulo-comparador-sort-dir"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDir)}
              className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="asc">{t('comparador.sortAsc')}</option>
              <option value="desc">{t('comparador.sortDesc')}</option>
            </select>
          </div>
        </div>
      </div>

      {data.proveedores.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="articulo-comparador-empty">
          {t('comparador.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border border-slate-200 dark:border-slate-600"
            data-testid="articulo-comparador-table"
          >
            <caption className="sr-only">{t('comparador.tableCaption')}</caption>
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th scope="col" className="text-left px-2 py-1">
                  {t('comparador.colProveedor')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('comparador.colCodigoProveedor')}
                </th>
                <th scope="col" className="text-right px-2 py-1">
                  {t('comparador.colPrecioLista')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('comparador.colUltActualiz')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('comparador.colUltCompra')}
                </th>
                {canStartOc ? (
                  <th scope="col" className="text-center px-2 py-1">
                    {t('comparador.colAcciones')}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {data.proveedores.map((row) => (
                <tr
                  key={row.proveedorId}
                  className={`border-t border-slate-200 dark:border-slate-600 ${
                    row.esMasBarato ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                  data-testid={`comparador-row-${row.proveedorId}`}
                  data-cheapest={row.esMasBarato ? 'true' : 'false'}
                >
                  <td className="px-2 py-1">
                    {row.esMasBarato ? (
                      <span className="mr-1" aria-hidden="true">
                        ✓
                      </span>
                    ) : null}
                    <span className={row.esMasBarato ? 'font-semibold' : undefined}>
                      {row.proveedorRsocial}
                    </span>
                    {row.esMasBarato ? (
                      <span className="sr-only">{t('comparador.masBarato')}</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-1 font-mono text-xs">{row.codigoProveedor}</td>
                  <td className="px-2 py-1 text-right">{formatMoney(row.precioLista)}</td>
                  <td className="px-2 py-1">{renderPrecioFecha(row)}</td>
                  <td className="px-2 py-1">{renderUltimaCompra(row)}</td>
                  {canStartOc ? (
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        data-testid={`comparador-oc-btn-${row.proveedorId}`}
                        className="text-xs text-blue-600 dark:text-blue-400 underline"
                        onClick={() => startOc(row)}
                      >
                        {t('comparador.accionOc')}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
