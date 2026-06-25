import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { ApiRequestFailedError, chequesAPI, fiscalRetencionesAPI, proveedoresAPI, type ChequeDTO } from '@/lib/api'
import type { RetencionPreviewLineDTO } from '@/lib/api'
import type { ComprobantePendiente, ReciboPago, ReciboPagoMetodo } from '@bizcode/types'

const METODOS: ReciboPagoMetodo[] = ['transferencia', 'cheque', 'efectivo', 'echeq']

type AllocationRow = {
  comprobanteCompraId: number
  facturaRef: string
  pendiente: string
  monto: string
  selected: boolean
}

type RetencionRow = RetencionPreviewLineDTO & { selected: boolean }

type Props = {
  proveedorId: number
  onPaymentRegistered?: () => void
}

function agentConfigured(config: {
  esAgenteRetencionGanancias: boolean
  esAgenteRetencionIVA: boolean
  esAgenteRetencionIIBB: boolean
}): boolean {
  return (
    config.esAgenteRetencionGanancias ||
    config.esAgenteRetencionIVA ||
    config.esAgenteRetencionIIBB
  )
}

/**
 * @en Supplier payment receipt UI (#271, #276 retenciones).
 * @es UI de recibo de pago a proveedor (#271, #276 retenciones).
 * @pt-BR UI de recibo de pagamento a fornecedor (#271, #276 retenções).
 */
export default function ProveedorReciboPagoSection({ proveedorId, onPaymentRegistered }: Props) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const { hasModule } = useFeatureFlags()
  const retencionesModule = hasModule('finance.retenciones')
  const chequesModule = hasModule('fiscal.cheques')

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
  const [agenteRetencion, setAgenteRetencion] = useState(false)
  const [applyRetenciones, setApplyRetenciones] = useState(false)
  const [retencionRows, setRetencionRows] = useState<RetencionRow[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [chequeId, setChequeId] = useState('')
  const [portfolioCheques, setPortfolioCheques] = useState<ChequeDTO[]>([])

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

  useEffect(() => {
    if (!chequesModule || !formOpen || (metodoPago !== 'cheque' && metodoPago !== 'echeq')) {
      setPortfolioCheques([])
      setChequeId('')
      return
    }
    void chequesAPI
      .list({ estado: 'en_cartera', tipo: 'recibido', limit: 100 })
      .then((res) => setPortfolioCheques(res?.data ?? []))
      .catch(() => setPortfolioCheques([]))
  }, [chequesModule, formOpen, metodoPago])

  const totalBruto = useMemo(() => {
    return allocations
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + (Number.parseFloat(a.monto) || 0), 0)
  }, [allocations])

  const retencionesTotal = useMemo(() => {
    if (!applyRetenciones) return 0
    return retencionRows
      .filter((r) => r.selected)
      .reduce((sum, r) => sum + (Number.parseFloat(r.importe) || 0), 0)
  }, [applyRetenciones, retencionRows])

  const totalNeto = useMemo(() => totalBruto - retencionesTotal, [totalBruto, retencionesTotal])

  const loadPreview = useCallback(async () => {
    if (!applyRetenciones || !agenteRetencion || totalBruto <= 0) {
      setRetencionRows([])
      return
    }
    setPreviewLoading(true)
    try {
      const lines = await fiscalRetencionesAPI.previewRetenciones({
        entidadTipo: 'proveedor',
        entidadId: proveedorId,
        monto: totalBruto,
      })
      setRetencionRows(lines.map((line) => ({ ...line, selected: true })))
    } catch {
      setRetencionRows([])
    } finally {
      setPreviewLoading(false)
    }
  }, [applyRetenciones, agenteRetencion, proveedorId, totalBruto])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  const resetFormExtras = () => {
    setApplyRetenciones(false)
    setRetencionRows([])
    setCbu('')
    setReferencia('')
    setNotas('')
    setChequeId('')
  }

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
      if (retencionesModule) {
        try {
          const config = await fiscalRetencionesAPI.getConfig()
          setAgenteRetencion(agentConfigured(config))
        } catch {
          setAgenteRetencion(false)
        }
      } else {
        setAgenteRetencion(false)
      }
      resetFormExtras()
      setFormOpen(true)
    } catch (err) {
      setFormError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    }
  }

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
    if (totalBruto <= 0) {
      setFormError(t('pagos.errorTotal'))
      return
    }
    if (totalNeto <= 0) {
      setFormError(t('pagos.errorNeto'))
      return
    }
    if (chequesModule && (metodoPago === 'cheque' || metodoPago === 'echeq') && !chequeId) {
      setFormError(t('pagos.errorChequeRequired'))
      return
    }

    const retencionesPayload = applyRetenciones
      ? retencionRows
          .filter((r) => r.selected)
          .map((r) => ({
            regimenId: r.regimenId,
            baseImponible: Number.parseFloat(r.baseImponible),
            alicuota: Number.parseFloat(r.alicuota),
            importe: Number.parseFloat(r.importe),
          }))
      : undefined

    setSaving(true)
    setFormError(null)
    try {
      await proveedoresAPI.createPago(proveedorId, {
        fecha,
        total: totalNeto,
        metodoPago,
        cbu: cbu.trim() || null,
        referencia: referencia.trim() || null,
        notas: notas.trim() || null,
        chequeId: chequeId ? Number.parseInt(chequeId, 10) : null,
        facturas: selected.map((a) => ({
          comprobanteCompraId: a.comprobanteCompraId,
          facturaRef: a.facturaRef,
          monto: Number.parseFloat(a.monto),
        })),
        retenciones: retencionesPayload,
      })
      setFormOpen(false)
      resetFormExtras()
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

  const downloadConstancia = async (retencionId: number, constanciaNum: string | null) => {
    try {
      const blob = await fiscalRetencionesAPI.downloadConstanciaPdf(retencionId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = constanciaNum ? `constancia-${constanciaNum}.pdf` : `constancia-retencion-${retencionId}.pdf`
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

          {retencionesModule && agenteRetencion ? (
            <div className="space-y-2" data-testid="proveedor-pago-retenciones-block">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={applyRetenciones}
                  data-testid="proveedor-pago-apply-retenciones"
                  onChange={(e) => setApplyRetenciones(e.target.checked)}
                />
                {t('pagos.applyRetenciones')}
              </label>
              {applyRetenciones ? (
                previewLoading ? (
                  <p className="text-xs text-slate-500" data-testid="proveedor-pago-retenciones-loading">
                    {t('pagos.retencionesLoading')}
                  </p>
                ) : retencionRows.length === 0 ? (
                  <p className="text-xs text-slate-500" data-testid="proveedor-pago-retenciones-empty">
                    {t('pagos.retencionesEmpty')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse" data-testid="proveedor-pago-retenciones-table">
                      <caption className="sr-only">{t('pagos.retencionesCaption')}</caption>
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                          <th scope="col" className="py-1 pr-2">
                            {t('pagos.colSelect')}
                          </th>
                          <th scope="col" className="py-1 pr-2">
                            {t('pagos.colRegimen')}
                          </th>
                          <th scope="col" className="py-1 pr-2 text-right">
                            {t('pagos.colBase')}
                          </th>
                          <th scope="col" className="py-1 pr-2 text-right">
                            {t('pagos.colAlicuota')}
                          </th>
                          <th scope="col" className="py-1 text-right">
                            {t('pagos.colImporteRetencion')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {retencionRows.map((row, idx) => (
                          <tr key={row.regimenId} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-1 pr-2">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                aria-label={t('pagos.selectRetencion', { nombre: row.nombre })}
                                data-testid={`proveedor-pago-retencion-select-${row.regimenId}`}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  setRetencionRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, selected: checked } : r)),
                                  )
                                }}
                              />
                            </td>
                            <td className="py-1 pr-2">{row.nombre}</td>
                            <td className="py-1 pr-2 text-right tabular-nums">{row.baseImponible}</td>
                            <td className="py-1 pr-2 text-right tabular-nums">{row.alicuota}%</td>
                            <td className="py-1 text-right">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={`${inputClass} max-w-[8rem] ml-auto`}
                                value={row.importe}
                                disabled={!row.selected}
                                aria-label={t('pagos.importeRetencionRow', { nombre: row.nombre })}
                                data-testid={`proveedor-pago-retencion-importe-${row.regimenId}`}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setRetencionRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, importe: value } : r)),
                                  )
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : null}
            </div>
          ) : null}

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
            {chequesModule && (metodoPago === 'cheque' || metodoPago === 'echeq') ? (
              <div>
                <label htmlFor="proveedor-pago-cheque" className="block text-xs font-medium mb-1">
                  {t('pagos.chequeCartera')}
                </label>
                <select
                  id="proveedor-pago-cheque"
                  className={inputClass}
                  value={chequeId}
                  data-testid="proveedor-pago-cheque"
                  onChange={(e) => setChequeId(e.target.value)}
                >
                  <option value="">{t('pagos.chequePlaceholder')}</option>
                  {portfolioCheques.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.banco} — {ch.numero} ({ch.monto})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
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
          <div className="space-y-1 text-sm tabular-nums" data-testid="proveedor-pago-totals">
            <p data-testid="proveedor-pago-bruto">
              {t('pagos.totalBruto', { total: totalBruto.toFixed(2) })}
            </p>
            {applyRetenciones && retencionesTotal > 0 ? (
              <p data-testid="proveedor-pago-retenciones-total">
                {t('pagos.totalRetenciones', { total: retencionesTotal.toFixed(2) })}
              </p>
            ) : null}
            <p className="font-medium" data-testid="proveedor-pago-neto">
              {t('pagos.totalNeto', { total: totalNeto.toFixed(2) })}
            </p>
          </div>
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
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-blue-600 underline text-xs"
                        data-testid={`proveedor-pago-pdf-${recibo.id}`}
                        onClick={() => void downloadPdf(recibo)}
                      >
                        {t('pagos.downloadPdf')}
                      </button>
                      {(recibo.retenciones ?? []).map((ret) => (
                        <button
                          key={ret.id}
                          type="button"
                          className="text-blue-600 underline text-xs"
                          data-testid={`proveedor-pago-constancia-${ret.id}`}
                          onClick={() => void downloadConstancia(ret.id, ret.constanciaNum)}
                        >
                          {t('pagos.downloadConstancia', {
                            num: ret.constanciaNum ?? ret.id,
                          })}
                        </button>
                      ))}
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
                    </div>
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
