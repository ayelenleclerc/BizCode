import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import {
  ApiRequestFailedError,
  chequesAPI,
  clientesAPI,
  fiscalRetencionesAPI,
  type ChequeDTO,
} from '@/lib/api'
import type { RetencionPreviewLineDTO } from '@/lib/api'
import type { ReciboCobro, ReciboCobroFormaTipo } from '@/types'

const FORMA_TIPOS: ReciboCobroFormaTipo[] = [
  'efectivo',
  'transferencia',
  'cheque',
  'mercadopago',
  'tarjeta',
  'otro',
]

type FormaRow = {
  tipo: ReciboCobroFormaTipo
  importe: string
  referencia: string
  banco: string
  chequeId: string
}

type AllocationRow = {
  facturaId: number
  facturaRef: string
  pendiente: string
  monto: string
  selected: boolean
}

type RetencionRow = RetencionPreviewLineDTO & { selected: boolean }

type Props = {
  clienteId: number
  onReciboRegistered?: () => void
}

/**
 * @en Customer payment receipt UI (#233).
 * @es UI de recibo de cobro a cliente (#233).
 * @pt-BR UI de recibo de cobrança de cliente (#233).
 */
export default function ClienteReciboCobroSection({ clienteId, onReciboRegistered }: Props) {
  const { t } = useTranslation('clientes')
  const { t: tc } = useTranslation('common')
  const { hasModule } = useFeatureFlags()
  const retencionesModule = hasModule('finance.retenciones')
  const chequesModule = hasModule('fiscal.cheques')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recibos, setRecibos] = useState<ReciboCobro[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [useFifo, setUseFifo] = useState(true)
  const [allocations, setAllocations] = useState<AllocationRow[]>([])
  const [formas, setFormas] = useState<FormaRow[]>([
    { tipo: 'efectivo', importe: '', referencia: '', banco: '', chequeId: '' },
  ])
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [concepto, setConcepto] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [voidingId, setVoidingId] = useState<number | null>(null)
  const [agenteRetencion, setAgenteRetencion] = useState(false)
  const [applyRetenciones, setApplyRetenciones] = useState(false)
  const [retencionRows, setRetencionRows] = useState<RetencionRow[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [portfolioCheques, setPortfolioCheques] = useState<ChequeDTO[]>([])

  const loadRecibos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientesAPI.listRecibos(clienteId, { limit: 50, offset: 0 })
      setRecibos((result?.data as ReciboCobro[]) ?? [])
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
      setRecibos([])
    } finally {
      setLoading(false)
    }
  }, [clienteId, tc])

  useEffect(() => {
    void loadRecibos()
  }, [loadRecibos])

  const formasTotal = useMemo(
    () => formas.reduce((sum, f) => sum + (Number.parseFloat(f.importe) || 0), 0),
    [formas],
  )

  const totalBruto = useMemo(() => {
    if (useFifo) return formasTotal
    return allocations
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + (Number.parseFloat(a.monto) || 0), 0)
  }, [useFifo, formasTotal, allocations])

  const retencionesTotal = useMemo(() => {
    if (!applyRetenciones) return 0
    return retencionRows
      .filter((r) => r.selected)
      .reduce((sum, r) => sum + (Number.parseFloat(r.importe) || 0), 0)
  }, [applyRetenciones, retencionRows])

  const totalNeto = useMemo(() => formasTotal - retencionesTotal, [formasTotal, retencionesTotal])

  const loadPreview = useCallback(async () => {
    if (!applyRetenciones || !agenteRetencion || totalBruto <= 0) {
      setRetencionRows([])
      return
    }
    setPreviewLoading(true)
    try {
      const lines = await fiscalRetencionesAPI.previewRetenciones({
        entidadTipo: 'cliente',
        entidadId: clienteId,
        monto: totalBruto,
      })
      setRetencionRows(lines.map((line) => ({ ...line, selected: true })))
    } catch {
      setRetencionRows([])
    } finally {
      setPreviewLoading(false)
    }
  }, [applyRetenciones, agenteRetencion, clienteId, totalBruto])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  useEffect(() => {
    if (!chequesModule || !formOpen) {
      setPortfolioCheques([])
      return
    }
    const needsCheque = formas.some((f) => f.tipo === 'cheque')
    if (!needsCheque) return
    void chequesAPI
      .list({ estado: 'en_cartera', tipo: 'recibido', limit: 100 })
      .then((res) => setPortfolioCheques(res?.data ?? []))
      .catch(() => setPortfolioCheques([]))
  }, [chequesModule, formOpen, formas])

  const openForm = async () => {
    setFormError(null)
    try {
      const pending = (await clientesAPI.facturasPendientes(clienteId)) ?? []
      setAllocations(
        pending.map((p) => ({
          facturaId: p.facturaId,
          facturaRef: p.facturaRef,
          pendiente: p.pendiente,
          monto: p.pendiente,
          selected: false,
        })),
      )
      if (retencionesModule) {
        try {
          const config = await fiscalRetencionesAPI.getConfig()
          setAgenteRetencion(
            config.esAgenteRetencionGanancias ||
              config.esAgenteRetencionIVA ||
              config.esAgenteRetencionIIBB,
          )
        } catch {
          setAgenteRetencion(false)
        }
      }
      setFormas([{ tipo: 'efectivo', importe: '', referencia: '', banco: '', chequeId: '' }])
      setUseFifo(true)
      setApplyRetenciones(false)
      setRetencionRows([])
      setConcepto('')
      setFormOpen(true)
    } catch (err) {
      setFormError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    }
  }

  const submitRecibo = async () => {
    if (formasTotal <= 0) {
      setFormError(t('recibos.errorTotal'))
      return
    }
    if (Math.abs(formasTotal - totalNeto - retencionesTotal) > 0.02) {
      setFormError(t('recibos.errorFormas'))
      return
    }
    for (const f of formas) {
      const imp = Number.parseFloat(f.importe)
      if (!Number.isFinite(imp) || imp <= 0) {
        setFormError(t('recibos.errorFormaImporte'))
        return
      }
      if (f.tipo === 'cheque' && chequesModule && !f.chequeId) {
        setFormError(t('recibos.errorChequeRequired'))
        return
      }
    }
    if (!useFifo) {
      const selected = allocations.filter((a) => a.selected)
      if (selected.length === 0) {
        setFormError(t('recibos.errorNoAllocation'))
        return
      }
      for (const row of selected) {
        const m = Number.parseFloat(row.monto)
        const pend = Number.parseFloat(row.pendiente)
        if (!Number.isFinite(m) || m <= 0 || m > pend + 0.009) {
          setFormError(t('recibos.errorAllocationAmount', { ref: row.facturaRef }))
          return
        }
      }
    }

    setSaving(true)
    setFormError(null)
    try {
      await clientesAPI.createRecibo(clienteId, {
        fecha,
        totalCobrado: formasTotal,
        concepto: concepto.trim() || null,
        fifo: useFifo,
        formas: formas.map((f) => ({
          tipo: f.tipo,
          importe: Number.parseFloat(f.importe),
          chequeId: f.chequeId ? Number.parseInt(f.chequeId, 10) : null,
          referencia: f.referencia.trim() || null,
          banco: f.banco.trim() || null,
        })),
        imputaciones: useFifo
          ? undefined
          : allocations
              .filter((a) => a.selected)
              .map((a) => ({
                facturaId: a.facturaId,
                importe: Number.parseFloat(a.monto),
              })),
        retenciones: applyRetenciones
          ? retencionRows
              .filter((r) => r.selected)
              .map((r) => ({
                regimenId: r.regimenId,
                baseImponible: Number.parseFloat(r.baseImponible),
                alicuota: Number.parseFloat(r.alicuota),
                importe: Number.parseFloat(r.importe),
              }))
          : undefined,
      })
      setFormOpen(false)
      await loadRecibos()
      onReciboRegistered?.()
    } catch (err) {
      setFormError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async (recibo: ReciboCobro) => {
    try {
      const blob = await clientesAPI.downloadReciboPdf(clienteId, recibo.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-cobro-${recibo.numero}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    }
  }

  const voidRecibo = async (recibo: ReciboCobro) => {
    const motivo = window.prompt(t('recibos.voidMotivoPrompt'))
    if (!motivo || motivo.trim().length < 3) return
    setVoidingId(recibo.id)
    try {
      await clientesAPI.anularRecibo(clienteId, recibo.id, motivo.trim())
      await loadRecibos()
      onReciboRegistered?.()
    } catch (err) {
      setError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setVoidingId(null)
    }
  }

  const inputClass =
    'w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm'

  return (
    <div className="space-y-3" data-testid="cliente-recibos-section">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t('recibos.title')}</h3>
        <CanAccess permission="sales.create">
          <button
            type="button"
            className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            data-testid="cliente-recibos-open"
            onClick={() => void openForm()}
          >
            {t('recibos.emitir')}
          </button>
        </CanAccess>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600" data-testid="cliente-recibos-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">{tc('status.loading')}</p>
      ) : recibos.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="cliente-recibos-empty">
          {t('recibos.empty')}
        </p>
      ) : (
        <ul className="space-y-2" data-testid="cliente-recibos-list">
          {recibos.map((recibo) => (
            <li
              key={recibo.id}
              className="rounded border border-slate-200 dark:border-slate-600 p-2 text-sm flex flex-wrap justify-between gap-2"
              data-testid={`cliente-recibo-row-${recibo.id}`}
            >
              <span>
                {t('recibos.rowLabel', { numero: recibo.numero, total: recibo.totalBruto })}
                {' — '}
                {recibo.estado}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  className="text-blue-600 underline text-xs"
                  data-testid={`cliente-recibo-pdf-${recibo.id}`}
                  onClick={() => void downloadPdf(recibo)}
                >
                  {t('recibos.pdf')}
                </button>
                {recibo.estado === 'emitido' ? (
                  <CanAccess permission="sales.create">
                    <button
                      type="button"
                      className="text-red-600 underline text-xs disabled:opacity-50"
                      disabled={voidingId === recibo.id}
                      data-testid={`cliente-recibo-void-${recibo.id}`}
                      onClick={() => void voidRecibo(recibo)}
                    >
                      {t('recibos.anular')}
                    </button>
                  </CanAccess>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {formOpen ? (
        <div
          className="rounded border border-slate-200 dark:border-slate-600 p-3 space-y-3"
          data-testid="cliente-recibos-form"
        >
          <h4 className="text-sm font-semibold">{t('recibos.formTitle')}</h4>
          {formError ? (
            <p role="alert" className="text-xs text-red-600">
              {formError}
            </p>
          ) : null}
          <div>
            <label htmlFor="cliente-recibo-fecha" className="block text-xs font-medium mb-1">
              {t('recibos.fecha')}
            </label>
            <input
              id="cliente-recibo-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClass}
              data-testid="cliente-recibo-fecha"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={useFifo}
                onChange={() => setUseFifo(true)}
                data-testid="cliente-recibo-fifo"
              />
              {t('recibos.fifo')}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={!useFifo}
                onChange={() => setUseFifo(false)}
                data-testid="cliente-recibo-manual"
              />
              {t('recibos.manual')}
            </label>
          </div>
          {!useFifo ? (
            <div className="space-y-1 max-h-40 overflow-y-auto" data-testid="cliente-recibo-allocations">
              {allocations.map((row, idx) => (
                <label key={row.facturaId} className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={(e) => {
                      const next = [...allocations]
                      next[idx] = { ...row, selected: e.target.checked }
                      setAllocations(next)
                    }}
                  />
                  <span>{row.facturaRef}</span>
                  <span className="text-slate-500">({row.pendiente})</span>
                  <input
                    type="number"
                    step="0.01"
                    value={row.monto}
                    disabled={!row.selected}
                    onChange={(e) => {
                      const next = [...allocations]
                      next[idx] = { ...row, monto: e.target.value }
                      setAllocations(next)
                    }}
                    className={`${inputClass} max-w-[120px]`}
                    aria-label={t('recibos.montoImputacion', { ref: row.facturaRef })}
                  />
                </label>
              ))}
            </div>
          ) : null}
          <div className="space-y-2">
            {formas.map((forma, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select
                  value={forma.tipo}
                  onChange={(e) => {
                    const next = [...formas]
                    next[idx] = { ...forma, tipo: e.target.value as ReciboCobroFormaTipo }
                    setFormas(next)
                  }}
                  className={inputClass}
                  aria-label={t('recibos.formaTipo')}
                >
                  {FORMA_TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {t(`recibos.forma.${tipo}`)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder={t('recibos.importe')}
                  value={forma.importe}
                  onChange={(e) => {
                    const next = [...formas]
                    next[idx] = { ...forma, importe: e.target.value }
                    setFormas(next)
                  }}
                  className={inputClass}
                  data-testid={idx === 0 ? 'cliente-recibo-importe' : undefined}
                />
                {forma.tipo === 'cheque' && chequesModule ? (
                  <select
                    value={forma.chequeId}
                    onChange={(e) => {
                      const next = [...formas]
                      next[idx] = { ...forma, chequeId: e.target.value }
                      setFormas(next)
                    }}
                    className={inputClass}
                    data-testid="cliente-recibo-cheque"
                  >
                    <option value="">{t('recibos.selectCheque')}</option>
                    {portfolioCheques.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.numero} — {c.banco} ({c.monto})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={t('recibos.referencia')}
                    value={forma.referencia}
                    onChange={(e) => {
                      const next = [...formas]
                      next[idx] = { ...forma, referencia: e.target.value }
                      setFormas(next)
                    }}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() =>
                setFormas([
                  ...formas,
                  { tipo: 'efectivo', importe: '', referencia: '', banco: '', chequeId: '' },
                ])
              }
            >
              {t('recibos.addForma')}
            </button>
          </div>
          {retencionesModule && agenteRetencion ? (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyRetenciones}
                onChange={(e) => setApplyRetenciones(e.target.checked)}
                data-testid="cliente-recibo-retenciones"
              />
              {t('recibos.applyRetenciones')}
            </label>
          ) : null}
          {applyRetenciones && retencionRows.length > 0 ? (
            <ul className="text-xs space-y-1" data-testid="cliente-recibo-retenciones-list">
              {retencionRows.map((r) => (
                <li key={r.regimenId}>
                  {r.nombre}: {r.importe}
                  {previewLoading ? ` (${tc('status.loading')})` : null}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-1 rounded border text-sm" onClick={() => setFormOpen(false)}>
              {tc('actions.cancel')}
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
              disabled={saving}
              data-testid="cliente-recibo-submit"
              onClick={() => void submitRecibo()}
            >
              {saving ? tc('actions.saving') : t('recibos.confirmar')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
