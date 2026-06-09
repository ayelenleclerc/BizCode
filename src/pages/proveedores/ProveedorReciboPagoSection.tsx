import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { ApiRequestFailedError, proveedoresAPI } from '@/lib/api'
import type { ComprobantePendiente, ReciboPago, ReciboPagoMetodo } from '@/types'

const METODOS: ReciboPagoMetodo[] = ['transferencia', 'cheque', 'efectivo', 'echeq']

type AllocationRow = {
  comprobanteCompraId: number
  facturaRef: string
  pendiente: string
  monto: string
  selected: boolean
}

type Props = {
  proveedorId: number
  onPaymentRegistered?: () => void
}

/**
 * @en Supplier payment receipt UI (#271).
 * @es UI de recibo de pago a proveedor (#271).
 * @pt-BR UI de recibo de pagamento a fornecedor (#271).
 */
export default function ProveedorReciboPagoSection({ proveedorId, onPaymentRegistered }: Props) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recibos, setRecibos] = useState<ReciboPago[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [pendientes, setPendientes] = useState<ComprobantePendiente[]>([])
  const [allocations, setAllocations] = useState<AllocationRow[]>([])
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [metodoPago, setMetodoPago] = useState<ReciboPagoMetodo>('transferencia')
  const [cbu, setCbu] = useState('')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [voidingId, setVoidingId] = useState<number | null>(null)

  const loadRecibos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await proveedoresAPI.listPagos(proveedorId, { limit: 50, offset: 0 })
      setRecibos((result?.data as ReciboPago[]) ?? [])
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
      setRecibos([])
    } finally {
      setLoading(false)
    }
  }, [proveedorId, tc])

  useEffect(() => {
    void loadRecibos()
  }, [loadRecibos])

  const openForm = async () => {
    setFormError(null)
    try {
      const pending = (await proveedoresAPI.pagosComprobantesPendientes(proveedorId)) as ComprobantePendiente[]
      setPendientes(pending ?? [])
      setAllocations(
        (pending ?? []).map((p) => ({
          comprobanteCompraId: p.comprobanteCompraId,
          facturaRef: p.facturaRef,
          pendiente: p.pendiente,
          monto: p.pendiente,
          selected: false,
        })),
      )
      setFormOpen(true)
    } catch (err) {
      setFormError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    }
  }

  const totalSeleccionado = useMemo(() => {
    return allocations
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + (Number.parseFloat(a.monto) || 0), 0)
  }, [allocations])

  const submitPago = async () => {
    const selected = allocations.filter((a) => a.selected)
    if (selected.length === 0) {
      setFormError(t('pagos.errorNoAllocation'))
      return
    }
    for (const row of selected) {
      const m = Number.parseFloat(row.monto)
      const pend = Number.parseFloat(row.pendiente)
      if (!Number.isFinite(m) || m <= 0 || m > pend + 0.009) {
        setFormError(t('pagos.errorAllocationAmount', { ref: row.facturaRef }))
        return
      }
    }
    if (totalSeleccionado <= 0) {
      setFormError(t('pagos.errorTotal'))
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      await proveedoresAPI.createPago(proveedorId, {
        fecha,
        total: totalSeleccionado,
        metodoPago,
        cbu: cbu.trim() || null,
        referencia: referencia.trim() || null,
        notas: notas.trim() || null,
        facturas: selected.map((a) => ({
          comprobanteCompraId: a.comprobanteCompraId,
          facturaRef: a.facturaRef,
          monto: Number.parseFloat(a.monto),
        })),
      })
      setFormOpen(false)
      setCbu('')
      setReferencia('')
      setNotas('')
      await loadRecibos()
      onPaymentRegistered?.()
    } catch (err) {
      setFormError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async (recibo: ReciboPago) => {
    try {
      const blob = await proveedoresAPI.downloadPagoPdf(proveedorId, recibo.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-pago-${recibo.numero}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    }
  }

  const voidRecibo = async (recibo: ReciboPago) => {
    if (!window.confirm(t('pagos.voidConfirm', { numero: recibo.numero }))) return
    setVoidingId(recibo.id)
    try {
      await proveedoresAPI.anularPago(proveedorId, recibo.id)
      await loadRecibos()
      onPaymentRegistered?.()
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setVoidingId(null)
    }
  }

  const inputClass =
    'w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm'

  return (
    <div className="space-y-3" data-testid="proveedor-pagos-section">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t('pagos.title')}</h3>
        <CanAccess permission="suppliers.manage">
          <button
            type="button"
            className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            data-testid="proveedor-pago-open"
            onClick={() => void openForm()}
          >
            {t('pagos.register')}
          </button>
        </CanAccess>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600" data-testid="proveedor-pagos-error">
          {error}
        </p>
      ) : null}

      {formOpen ? (
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 space-y-3"
          data-testid="proveedor-pago-form"
        >
          <h4 className="text-sm font-medium">{t('pagos.formTitle')}</h4>
          {formError ? (
            <p role="alert" className="text-xs text-red-600">
              {formError}
            </p>
          ) : null}
          {pendientes.length === 0 ? (
            <p className="text-sm text-slate-500">{t('pagos.noPending')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" data-testid="proveedor-pago-alloc-table">
                <caption className="sr-only">{t('pagos.allocCaption')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                    <th scope="col" className="py-1 pr-2">
                      {t('pagos.colSelect')}
                    </th>
                    <th scope="col" className="py-1 pr-2">
                      {t('pagos.colFactura')}
                    </th>
                    <th scope="col" className="py-1 pr-2 text-right">
                      {t('pagos.colPendiente')}
                    </th>
                    <th scope="col" className="py-1 text-right">
                      {t('pagos.colMonto')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((row, idx) => (
                    <tr key={row.comprobanteCompraId} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-1 pr-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          aria-label={t('pagos.selectRow', { ref: row.facturaRef })}
                          data-testid={`proveedor-pago-select-${row.comprobanteCompraId}`}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, selected: checked } : r)),
                            )
                          }}
                        />
                      </td>
                      <td className="py-1 pr-2">{row.facturaRef}</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{row.pendiente}</td>
                      <td className="py-1 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`${inputClass} max-w-[8rem] ml-auto`}
                          value={row.monto}
                          disabled={!row.selected}
                          aria-label={t('pagos.montoRow', { ref: row.facturaRef })}
                          data-testid={`proveedor-pago-monto-${row.comprobanteCompraId}`}
                          onChange={(e) => {
                            const value = e.target.value
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, monto: value } : r)),
                            )
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label htmlFor="proveedor-pago-fecha" className="block text-xs font-medium mb-1">
                {t('pagos.fecha')}
              </label>
              <input
                id="proveedor-pago-fecha"
                type="date"
                className={inputClass}
                value={fecha}
                data-testid="proveedor-pago-fecha"
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="proveedor-pago-metodo" className="block text-xs font-medium mb-1">
                {t('pagos.metodo')}
              </label>
              <select
                id="proveedor-pago-metodo"
                className={inputClass}
                value={metodoPago}
                data-testid="proveedor-pago-metodo"
                onChange={(e) => setMetodoPago(e.target.value as ReciboPagoMetodo)}
              >
                {METODOS.map((m) => (
                  <option key={m} value={m}>
                    {t(`pagos.metodoOptions.${m}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="proveedor-pago-cbu" className="block text-xs font-medium mb-1">
                {t('pagos.cbu')}
              </label>
              <input
                id="proveedor-pago-cbu"
                type="text"
                className={inputClass}
                value={cbu}
                data-testid="proveedor-pago-cbu"
                onChange={(e) => setCbu(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="proveedor-pago-referencia" className="block text-xs font-medium mb-1">
                {t('pagos.referencia')}
              </label>
              <input
                id="proveedor-pago-referencia"
                type="text"
                className={inputClass}
                value={referencia}
                data-testid="proveedor-pago-referencia"
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="proveedor-pago-notas" className="block text-xs font-medium mb-1">
              {t('pagos.notas')}
            </label>
            <textarea
              id="proveedor-pago-notas"
              rows={2}
              className={inputClass}
              value={notas}
              data-testid="proveedor-pago-notas"
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <p className="text-sm font-medium tabular-nums" data-testid="proveedor-pago-total">
            {t('pagos.totalSeleccionado', { total: totalSeleccionado.toFixed(2) })}
          </p>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-1 rounded border text-sm" onClick={() => setFormOpen(false)}>
              {tc('actions.cancel')}
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
              disabled={saving || pendientes.length === 0}
              data-testid="proveedor-pago-submit"
              onClick={() => void submitPago()}
            >
              {saving ? tc('actions.saving') : t('pagos.submit')}
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500" data-testid="proveedor-pagos-loading">
          {tc('status.loading')}
        </p>
      ) : recibos.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="proveedor-pagos-empty">
          {t('pagos.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="proveedor-pagos-table">
            <caption className="sr-only">{t('pagos.tableCaption')}</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                <th scope="col" className="py-2 pr-2">
                  {t('pagos.colNumero')}
                </th>
                <th scope="col" className="py-2 pr-2">
                  {t('pagos.colFecha')}
                </th>
                <th scope="col" className="py-2 pr-2 text-right">
                  {t('pagos.colTotal')}
                </th>
                <th scope="col" className="py-2 pr-2">
                  {t('pagos.colEstado')}
                </th>
                <th scope="col" className="py-2">
                  {t('pagos.colAcciones')}
                </th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <tr
                  key={recibo.id}
                  className="border-b border-slate-100 dark:border-slate-700"
                  data-testid={`proveedor-pago-row-${recibo.id}`}
                >
                  <td className="py-2 pr-2">{recibo.numero}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {new Date(recibo.fecha).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">{recibo.total}</td>
                  <td className="py-2 pr-2">{t(`pagos.estado.${recibo.estado}`)}</td>
                  <td className="py-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-blue-600 underline text-xs"
                      data-testid={`proveedor-pago-pdf-${recibo.id}`}
                      onClick={() => void downloadPdf(recibo)}
                    >
                      {t('pagos.downloadPdf')}
                    </button>
                    {recibo.estado === 'emitido' ? (
                      <CanAccess permission="suppliers.manage">
                        <button
                          type="button"
                          className="text-red-600 underline text-xs disabled:opacity-50"
                          disabled={voidingId === recibo.id}
                          data-testid={`proveedor-pago-void-${recibo.id}`}
                          onClick={() => void voidRecibo(recibo)}
                        >
                          {voidingId === recibo.id ? tc('actions.saving') : t('pagos.void')}
                        </button>
                      </CanAccess>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
