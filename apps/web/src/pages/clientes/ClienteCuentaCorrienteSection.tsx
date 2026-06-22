import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import IfModule from '@/components/IfModule'
import { ApiRequestFailedError, clientesAPI } from '@/lib/api'
import ClienteReciboCobroSection from './ClienteReciboCobroSection'
import type { ClienteCuentaCorrienteAntiguedad, MovimientoClienteCCTipo } from '@/types'
import ClienteDeudaChart from './ClienteDeudaChart'

const PAGE_SIZE = 25

const TIPOS: MovimientoClienteCCTipo[] = [
  'saldo_inicial',
  'factura',
  'nota_credito',
  'cobro',
  'retencion',
  'percepcion',
  'cheque_rechazado',
  'ajuste',
]

type Props = {
  clienteId: number
}

/**
 * @en Customer accounts-receivable tab (#232).
 * @es Pestaña de cuenta corriente de cliente (#232).
 * @pt-BR Aba de conta corrente de cliente (#232).
 */
export default function ClienteCuentaCorrienteSection({ clienteId }: Props) {
  const { t } = useTranslation('clientes')
  const { t: tc } = useTranslation('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof clientesAPI.cuentaCorriente>> | null>(
    null,
  )
  const [antiguedad, setAntiguedad] = useState<ClienteCuentaCorrienteAntiguedad | null>(null)
  const [filterTipo, setFilterTipo] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [offset, setOffset] = useState(0)
  const [ajusteOpen, setAjusteOpen] = useState(false)
  const [ajusteMonto, setAjusteMonto] = useState('')
  const [ajusteMotivo, setAjusteMotivo] = useState('')
  const [ajusteSaving, setAjusteSaving] = useState(false)
  const [ajusteError, setAjusteError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [envioMsg, setEnvioMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: {
        tipo?: string
        desde?: string
        hasta?: string
        limit?: number
        offset?: number
      } = { limit: PAGE_SIZE, offset }
      if (filterTipo) params.tipo = filterTipo
      if (filterFrom) params.desde = new Date(filterFrom).toISOString()
      if (filterTo) params.hasta = new Date(`${filterTo}T23:59:59`).toISOString()
      const [cc, ant] = await Promise.all([
        clientesAPI.cuentaCorriente(clienteId, params),
        clientesAPI.cuentaCorrienteAntiguedad(clienteId),
      ])
      setData(cc ?? null)
      setAntiguedad(ant ?? null)
    } catch (err) {
      if (err instanceof ApiRequestFailedError) {
        setError(err.message)
      } else {
        setError(tc('errors.generic'))
      }
      setData(null)
      setAntiguedad(null)
    } finally {
      setLoading(false)
    }
  }, [clienteId, filterFrom, filterTipo, filterTo, offset, tc])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setOffset(0)
  }, [filterTipo, filterFrom, filterTo])

  const totalMovimientos = data?.total ?? 0
  const canPrev = offset > 0
  const canNext = data != null && offset + PAGE_SIZE < totalMovimientos
  const pageFrom = totalMovimientos === 0 ? 0 : offset + 1
  const pageTo = Math.min(offset + PAGE_SIZE, totalMovimientos)

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
      await clientesAPI.cuentaCorrienteAjuste(clienteId, { monto, motivo: ajusteMotivo.trim() })
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

  const descargarPdf = () => {
    const params = new URLSearchParams()
    if (filterFrom) params.set('desde', new Date(filterFrom).toISOString())
    if (filterTo) params.set('hasta', new Date(`${filterTo}T23:59:59`).toISOString())
    const qs = params.toString()
    const url = `/api/clientes/${clienteId}/cuenta-corriente/estado-de-cuenta/pdf${qs ? `?${qs}` : ''}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const enviarPdf = async () => {
    setEnviando(true)
    setEnvioMsg(null)
    try {
      const body: { desde?: string; hasta?: string } = {}
      if (filterFrom) body.desde = new Date(filterFrom).toISOString()
      if (filterTo) body.hasta = new Date(`${filterTo}T23:59:59`).toISOString()
      await clientesAPI.cuentaCorrienteEnviar(clienteId, body)
      setEnvioMsg(t('cc.envioOk'))
    } catch (err) {
      setEnvioMsg(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setEnviando(false)
    }
  }

  const inputClass =
    'w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm'

  if (loading) {
    return (
      <p className="text-sm text-slate-500" data-testid="cliente-cc-loading">
        {tc('status.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" data-testid="cliente-cc-error" className="text-sm text-red-600">
        <p>{error}</p>
        <button type="button" className="mt-2 text-blue-600 underline" onClick={() => void load()}>
          {tc('actions.retry')}
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500" data-testid="cliente-cc-empty">
        {t('cc.empty')}
      </p>
    )
  }

  return (
    <div className="space-y-4" data-testid="cliente-cc-section">
      <div
        className={`rounded-lg border p-4 ${
          data.excedeLimite
            ? 'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-600'
            : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40'
        }`}
        data-testid="cliente-cc-saldo-panel"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('cc.saldoActual')}</p>
        <p className="text-2xl font-semibold tabular-nums" data-testid="cliente-cc-saldo">
          {data.saldo}
        </p>
        {data.creditLimit ? (
          <p className="text-xs text-slate-500 mt-1">
            {t('cc.limiteCredito', { limite: data.creditLimit })}
          </p>
        ) : null}
        {data.excedeLimite ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300 mt-2 font-medium">
            {t('cc.excedeLimite')}
          </p>
        ) : null}
      </div>

      {antiguedad ? (
        <div className="rounded border border-slate-200 dark:border-slate-600 p-3" data-testid="cliente-cc-antiguedad">
          <h3 className="text-sm font-semibold mb-2">{t('cc.antiguedadTitle')}</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {antiguedad.buckets.map((b) => (
              <li key={b.label} className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">
                <span className="block text-xs text-slate-500">{t(`cc.antiguedad.${b.label}`)}</span>
                <span className="font-mono">{b.total}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ClienteDeudaChart serie={data.serie} />

      <IfModule flag="finance.receipts">
        <ClienteReciboCobroSection clienteId={clienteId} onReciboRegistered={() => void load()} />
      </IfModule>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label htmlFor="cliente-cc-filter-tipo" className="block text-xs font-medium mb-1">
            {t('cc.filterTipo')}
          </label>
          <select
            id="cliente-cc-filter-tipo"
            data-testid="cliente-cc-filter-tipo"
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
          <label htmlFor="cliente-cc-filter-from" className="block text-xs font-medium mb-1">
            {t('cc.filterFrom')}
          </label>
          <input
            id="cliente-cc-filter-from"
            data-testid="cliente-cc-filter-from"
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cliente-cc-filter-to" className="block text-xs font-medium mb-1">
            {t('cc.filterTo')}
          </label>
          <input
            id="cliente-cc-filter-to"
            data-testid="cliente-cc-filter-to"
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
          data-testid="cliente-cc-filter-apply"
        >
          {t('cc.filterApply')}
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
          onClick={descargarPdf}
          data-testid="cliente-cc-pdf"
        >
          {t('cc.descargarPdf')}
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50"
          disabled={enviando}
          onClick={() => void enviarPdf()}
          data-testid="cliente-cc-enviar"
        >
          {enviando ? tc('actions.saving') : t('cc.enviarPdf')}
        </button>
        <CanAccess permission="sales.create">
          <button
            type="button"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            onClick={() => setAjusteOpen(true)}
            data-testid="cliente-cc-ajuste-open"
          >
            {t('cc.ajusteOpen')}
          </button>
        </CanAccess>
      </div>

      {envioMsg ? (
        <p className="text-sm text-slate-600 dark:text-slate-400" role="status">
          {envioMsg}
        </p>
      ) : null}

      {ajusteOpen ? (
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 space-y-2"
          data-testid="cliente-cc-ajuste-form"
        >
          <h3 className="text-sm font-semibold">{t('cc.ajusteTitle')}</h3>
          {ajusteError ? (
            <p role="alert" className="text-xs text-red-600">
              {ajusteError}
            </p>
          ) : null}
          <div>
            <label htmlFor="cliente-cc-ajuste-monto" className="block text-xs font-medium mb-1">
              {t('cc.ajusteMonto')}
            </label>
            <input
              id="cliente-cc-ajuste-monto"
              data-testid="cliente-cc-ajuste-monto"
              type="number"
              step="0.01"
              value={ajusteMonto}
              onChange={(e) => setAjusteMonto(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cliente-cc-ajuste-motivo" className="block text-xs font-medium mb-1">
              {t('cc.ajusteMotivo')}
            </label>
            <textarea
              id="cliente-cc-ajuste-motivo"
              data-testid="cliente-cc-ajuste-motivo"
              rows={2}
              value={ajusteMotivo}
              onChange={(e) => setAjusteMotivo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-1 rounded border text-sm" onClick={() => setAjusteOpen(false)}>
              {tc('actions.cancel')}
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
              disabled={ajusteSaving}
              data-testid="cliente-cc-ajuste-submit"
              onClick={() => void submitAjuste()}
            >
              {ajusteSaving ? tc('actions.saving') : t('cc.ajusteSubmit')}
            </button>
          </div>
        </div>
      ) : null}

      {data.movimientos.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="cliente-cc-movimientos-empty">
          {t('cc.movimientosEmpty')}
        </p>
      ) : (
        <div className="space-y-2">
          <div
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
            data-testid="cliente-cc-pagination"
          >
            <p className="text-slate-600 dark:text-slate-400">
              {t('cc.paginationSummary', { from: pageFrom, to: pageTo, total: totalMovimientos })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
                data-testid="cliente-cc-pagination-prev"
              >
                {t('cc.paginationPrev')}
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50"
                disabled={!canNext}
                onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
                data-testid="cliente-cc-pagination-next"
              >
                {t('cc.paginationNext')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="cliente-cc-table">
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
                  data-testid={`cliente-cc-row-${mov.id}`}
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
        </div>
      )}
    </div>
  )
}
