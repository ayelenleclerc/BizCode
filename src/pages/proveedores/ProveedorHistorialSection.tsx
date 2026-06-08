import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  proveedoresAPI,
  type ProveedorArticuloHistorialRow,
  type ProveedorHistorialPeriodoDias,
  type ProveedorHistorialResumen,
} from '@/lib/api'

const PERIODOS: ProveedorHistorialPeriodoDias[] = [30, 90, 180, 365]

type Props = {
  proveedorId: number
}

function formatMoney(value: string): string {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return value
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString()
}

/**
 * @en Supplier purchase history tab (#272).
 * @es Pestaña de historial de compras del proveedor (#272).
 * @pt-BR Aba de histórico de compras do fornecedor (#272).
 */
export default function ProveedorHistorialSection({ proveedorId }: Props) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const [periodo, setPeriodo] = useState<ProveedorHistorialPeriodoDias>(90)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historial, setHistorial] = useState<ProveedorHistorialResumen | null>(null)
  const [articulos, setArticulos] = useState<ProveedorArticuloHistorialRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [hist, arts] = await Promise.all([
        proveedoresAPI.historial(proveedorId, { dias: periodo }),
        proveedoresAPI.articulosHistorial(proveedorId, { dias: periodo }),
      ])
      setHistorial(hist)
      setArticulos(arts.articulos)
    } catch (err) {
      if (err instanceof ApiRequestFailedError) {
        setError(err.message)
      } else {
        setError(tc('errors.generic'))
      }
      setHistorial(null)
      setArticulos([])
    } finally {
      setLoading(false)
    }
  }, [periodo, proveedorId, tc])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <p className="text-sm text-slate-500" data-testid="proveedor-historial-loading">
        {tc('status.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600" data-testid="proveedor-historial-error">
        {error}
      </p>
    )
  }

  if (!historial) {
    return (
      <p className="text-sm text-slate-500" data-testid="proveedor-historial-empty">
        {t('historial.empty')}
      </p>
    )
  }

  const top = historial.topArticulos[0]

  return (
    <div className="space-y-6" data-testid="proveedor-historial-section">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="proveedor-historial-periodo" className="block text-xs text-slate-500 mb-1">
            {t('historial.periodo')}
          </label>
          <select
            id="proveedor-historial-periodo"
            data-testid="proveedor-historial-periodo"
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value) as ProveedorHistorialPeriodoDias)}
            className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
          >
            {PERIODOS.map((d) => (
              <option key={d} value={d}>
                {t('historial.periodoDias', { dias: d })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-900/40"
          data-testid="proveedor-historial-metric-total"
        >
          <p className="text-xs text-slate-500">{t('historial.totalComprado')}</p>
          <p className="text-lg font-semibold">{formatMoney(historial.totalComprado)}</p>
        </div>
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-900/40"
          data-testid="proveedor-historial-metric-frecuencia"
        >
          <p className="text-xs text-slate-500">{t('historial.frecuencia')}</p>
          <p className="text-lg font-semibold">
            {historial.frecuenciaCompraDias != null
              ? t('historial.frecuenciaValor', { dias: historial.frecuenciaCompraDias })
              : t('historial.frecuenciaNa')}
          </p>
        </div>
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-900/40"
          data-testid="proveedor-historial-metric-cantidad"
        >
          <p className="text-xs text-slate-500">{t('historial.cantidadCompras')}</p>
          <p className="text-lg font-semibold">{historial.cantidadCompras}</p>
        </div>
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-900/40"
          data-testid="proveedor-historial-metric-top"
        >
          <p className="text-xs text-slate-500">{t('historial.articuloTop')}</p>
          <p className="text-sm font-semibold truncate" title={top?.descripcion}>
            {top ? `${top.codigo} — ${top.descripcion}` : t('historial.sinDatos')}
          </p>
        </div>
      </div>

      <section aria-labelledby="proveedor-historial-compras-title">
        <h3 id="proveedor-historial-compras-title" className="text-sm font-semibold mb-2">
          {t('historial.comprasTitle')}
        </h3>
        {historial.compras.length === 0 ? (
          <p className="text-sm text-slate-500">{t('historial.comprasEmpty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm border border-slate-200 dark:border-slate-600"
              data-testid="proveedor-historial-compras-table"
            >
              <caption className="sr-only">{t('historial.comprasCaption')}</caption>
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colFecha')}
                  </th>
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colReferencia')}
                  </th>
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colTipo')}
                  </th>
                  <th scope="col" className="text-right px-2 py-1">
                    {t('historial.colTotal')}
                  </th>
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colEstadoPago')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {historial.compras.map((row) => (
                  <tr key={`${row.tipo}-${row.id}`} className="border-t border-slate-200 dark:border-slate-600">
                    <td className="px-2 py-1">{formatDate(row.fecha)}</td>
                    <td className="px-2 py-1 font-mono text-xs">{row.referencia}</td>
                    <td className="px-2 py-1">{t(`historial.tipo.${row.tipo}`)}</td>
                    <td className="px-2 py-1 text-right">{formatMoney(row.total)}</td>
                    <td className="px-2 py-1">{t(`historial.estadoPago.${row.estadoPago}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="proveedor-historial-articulos-title">
        <h3 id="proveedor-historial-articulos-title" className="text-sm font-semibold mb-2">
          {t('historial.articulosTitle')}
        </h3>
        {articulos.length === 0 ? (
          <p className="text-sm text-slate-500">{t('historial.articulosEmpty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm border border-slate-200 dark:border-slate-600"
              data-testid="proveedor-historial-articulos-table"
            >
              <caption className="sr-only">{t('historial.articulosCaption')}</caption>
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colCodigo')}
                  </th>
                  <th scope="col" className="text-left px-2 py-1">
                    {t('historial.colDescripcion')}
                  </th>
                  <th scope="col" className="text-right px-2 py-1">
                    {t('historial.colCantidad')}
                  </th>
                  <th scope="col" className="text-right px-2 py-1">
                    {t('historial.colPpp')}
                  </th>
                  <th scope="col" className="text-right px-2 py-1">
                    {t('historial.colMonto')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {articulos.map((row) => (
                  <tr key={row.articuloId} className="border-t border-slate-200 dark:border-slate-600">
                    <td className="px-2 py-1 font-mono text-xs">{row.codigo}</td>
                    <td className="px-2 py-1">{row.descripcion}</td>
                    <td className="px-2 py-1 text-right">{row.cantidadTotal}</td>
                    <td className="px-2 py-1 text-right">{formatMoney(row.precioPromedioPonderado)}</td>
                    <td className="px-2 py-1 text-right">{formatMoney(row.montoTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
