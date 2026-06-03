import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { ApiRequestFailedError, proveedoresAPI } from '@/lib/api'
import type { MovimientoProveedorCCTipo, ProveedorCuentaCorriente } from '@/types'
import ProveedorDeudaChart from './ProveedorDeudaChart'

const TIPOS: MovimientoProveedorCCTipo[] = ['factura_compra', 'pago', 'nc_proveedor', 'ajuste']

type Props = {
  proveedorId: number
}

/**
 * @en Supplier accounts-payable tab (#270).
 * @es Pestaña de cuenta corriente de proveedor (#270).
 * @pt-BR Aba de conta corrente de fornecedor (#270).
 */
export default function ProveedorCuentaCorrienteSection({ proveedorId }: Props) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProveedorCuentaCorriente | null>(null)
  const [filterTipo, setFilterTipo] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [ajusteOpen, setAjusteOpen] = useState(false)
  const [ajusteMonto, setAjusteMonto] = useState('')
  const [ajusteMotivo, setAjusteMotivo] = useState('')
  const [ajusteSaving, setAjusteSaving] = useState(false)
  const [ajusteError, setAjusteError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: { tipo?: string; from?: string; to?: string } = {}
      if (filterTipo) params.tipo = filterTipo
      if (filterFrom) params.from = new Date(filterFrom).toISOString()
      if (filterTo) params.to = new Date(`${filterTo}T23:59:59`).toISOString()
      const result = await proveedoresAPI.cuentaCorriente(proveedorId, params)
      setData(result ?? null)
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
  }, [filterFrom, filterTipo, filterTo, proveedorId, tc])

  useEffect(() => {
    void load()
  }, [load])

  const submitAjuste = async () => {
    const monto = Number.parseFloat(ajusteMonto)
    if (!Number.isFinite(monto) || monto === 0) {
      setAjusteError(t('cc.ajusteMontoInvalid'))
      return
    }
    if (!ajusteMotivo.trim()) {
      setAjusteError(t('cc.ajusteMotivoRequired'))
      return
    }
    setAjusteSaving(true)
    setAjusteError(null)
    try {
      await proveedoresAPI.cuentaCorrienteAjuste(proveedorId, { monto, motivo: ajusteMotivo.trim() })
      setAjusteOpen(false)
      setAjusteMonto('')
      setAjusteMotivo('')
      await load()
    } catch (err) {
      setAjusteError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setAjusteSaving(false)
    }
  }

  const inputClass =
    'w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm'

  if (loading) {
    return (
      <p className="text-sm text-slate-500" data-testid="proveedor-cc-loading">
        {tc('status.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" data-testid="proveedor-cc-error" className="text-sm text-red-600">
        <p>{error}</p>
        <button type="button" className="mt-2 text-blue-600 underline" onClick={() => void load()}>
          {tc('actions.retry')}
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500" data-testid="proveedor-cc-empty">
        {t('cc.empty')}
      </p>
    )
  }

  return (
    <div className="space-y-4" data-testid="proveedor-cc-section">
      <div
        className={`rounded-lg border p-4 ${
          data.excedeLimite
            ? 'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-600'
            : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40'
        }`}
        data-testid="proveedor-cc-saldo-panel"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('cc.saldoActual')}</p>
        <p className="text-2xl font-semibold tabular-nums" data-testid="proveedor-cc-saldo">
          {data.saldo}
        </p>
        {data.limiteCredito ? (
          <p className="text-xs text-slate-500 mt-1">
            {t('cc.limiteCredito', { limite: data.limiteCredito })}
          </p>
        ) : null}
        {data.excedeLimite ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300 mt-2 font-medium">
            {t('cc.excedeLimite')}
          </p>
        ) : null}
      </div>

      <ProveedorDeudaChart serie={data.serie} />

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label htmlFor="proveedor-cc-filter-tipo" className="block text-xs font-medium mb-1">
            {t('cc.filterTipo')}
          </label>
          <select
            id="proveedor-cc-filter-tipo"
            data-testid="proveedor-cc-filter-tipo"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('cc.filterTipoAll')}</option>
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {t(`cc.tipo.${tipo}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="proveedor-cc-filter-from" className="block text-xs font-medium mb-1">
            {t('cc.filterFrom')}
          </label>
          <input
            id="proveedor-cc-filter-from"
            data-testid="proveedor-cc-filter-from"
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="proveedor-cc-filter-to" className="block text-xs font-medium mb-1">
            {t('cc.filterTo')}
          </label>
          <input
            id="proveedor-cc-filter-to"
            data-testid="proveedor-cc-filter-to"
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
          onClick={() => void load()}
          data-testid="proveedor-cc-filter-apply"
        >
          {t('cc.filterApply')}
        </button>
        <CanAccess permission="suppliers.manage">
          <button
            type="button"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            onClick={() => setAjusteOpen(true)}
            data-testid="proveedor-cc-ajuste-open"
          >
            {t('cc.ajusteOpen')}
          </button>
        </CanAccess>
      </div>

      {ajusteOpen ? (
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 space-y-2"
          data-testid="proveedor-cc-ajuste-form"
        >
          <h3 className="text-sm font-semibold">{t('cc.ajusteTitle')}</h3>
          {ajusteError ? (
            <p role="alert" className="text-xs text-red-600">
              {ajusteError}
            </p>
          ) : null}
          <div>
            <label htmlFor="proveedor-cc-ajuste-monto" className="block text-xs font-medium mb-1">
              {t('cc.ajusteMonto')}
            </label>
            <input
              id="proveedor-cc-ajuste-monto"
              data-testid="proveedor-cc-ajuste-monto"
              type="number"
              step="0.01"
              value={ajusteMonto}
              onChange={(e) => setAjusteMonto(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="proveedor-cc-ajuste-motivo" className="block text-xs font-medium mb-1">
              {t('cc.ajusteMotivo')}
            </label>
            <textarea
              id="proveedor-cc-ajuste-motivo"
              data-testid="proveedor-cc-ajuste-motivo"
              rows={2}
              value={ajusteMotivo}
              onChange={(e) => setAjusteMotivo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-3 py-1 rounded border text-sm"
              onClick={() => setAjusteOpen(false)}
            >
              {tc('actions.cancel')}
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
              disabled={ajusteSaving}
              data-testid="proveedor-cc-ajuste-submit"
              onClick={() => void submitAjuste()}
            >
              {ajusteSaving ? tc('actions.saving') : t('cc.ajusteSubmit')}
            </button>
          </div>
        </div>
      ) : null}

      {data.movimientos.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="proveedor-cc-movimientos-empty">
          {t('cc.movimientosEmpty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="proveedor-cc-table">
            <caption className="sr-only">{t('cc.tableCaption')}</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                <th scope="col" className="py-2 pr-2">
                  {t('cc.colFecha')}
                </th>
                <th scope="col" className="py-2 pr-2">
                  {t('cc.colTipo')}
                </th>
                <th scope="col" className="py-2 pr-2">
                  {t('cc.colReferencia')}
                </th>
                <th scope="col" className="py-2 pr-2 text-right">
                  {t('cc.colMonto')}
                </th>
                <th scope="col" className="py-2 text-right">
                  {t('cc.colSaldo')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.movimientos.map((mov) => (
                <tr
                  key={mov.id}
                  className="border-b border-slate-100 dark:border-slate-700"
                  data-testid={`proveedor-cc-row-${mov.id}`}
                >
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {mov.fecha ? new Date(mov.fecha).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-2 pr-2">{t(`cc.tipo.${mov.tipo}`)}</td>
                  <td className="py-2 pr-2">{mov.referencia ?? '—'}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{mov.monto}</td>
                  <td className="py-2 text-right tabular-nums">{mov.saldoPost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
