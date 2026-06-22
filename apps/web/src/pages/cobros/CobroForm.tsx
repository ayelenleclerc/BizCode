import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  clientesAPI,
  cobrosAPI,
  fiscalRetencionesAPI,
  formasPagoAPI,
  type ChequeModalidadDTO,
  type CobroCreateBody,
  type RetencionPreviewLineDTO,
} from '@/lib/api'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { Cliente } from '@/types'

type FormaPagoOption = { id: number; descripcion: string }

export type CobroFormProps = {
  initialClienteId?: number
  onSaved: () => void
  onCancel: () => void
}

const inputClass =
  'w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'

/**
 * @en Modal form to register a customer payment.
 * @es Formulario modal para registrar un cobro de cliente.
 * @pt-BR Formulário modal para registrar um recebimento de cliente.
 */
export default function CobroForm({ initialClienteId, onSaved, onCancel }: CobroFormProps) {
  const { t } = useTranslation('cobros')
  const formShortcuts = useFormShortcuts()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formasPago, setFormasPago] = useState<FormaPagoOption[]>([])
  const [clienteId, setClienteId] = useState(String(initialClienteId ?? ''))
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [monto, setMonto] = useState('')
  const [formaPagoId, setFormaPagoId] = useState('')
  const [referencia, setReferencia] = useState('')
  const [nota, setNota] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agenteRetencion, setAgenteRetencion] = useState(false)
  const [applyRetenciones, setApplyRetenciones] = useState(false)
  const [retencionRows, setRetencionRows] = useState<Array<RetencionPreviewLineDTO & { selected: boolean }>>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const { hasModule } = useFeatureFlags()
  const retencionesModule = hasModule('finance.retenciones')
  const chequesModule = hasModule('fiscal.cheques')
  const [registerCheque, setRegisterCheque] = useState(false)
  const [chequeNumero, setChequeNumero] = useState('')
  const [chequeBanco, setChequeBanco] = useState('')
  const [chequeVencimiento, setChequeVencimiento] = useState('')
  const [chequeModalidad, setChequeModalidad] = useState<ChequeModalidadDTO>('fisico')

  const montoNeto = Number.parseFloat(monto)
  const retencionesTotal = useMemo(
    () =>
      applyRetenciones
        ? retencionRows
            .filter((r) => r.selected)
            .reduce((sum, r) => sum + Number.parseFloat(r.importe), 0)
        : 0,
    [applyRetenciones, retencionRows],
  )
  const montoBruto = Number.isFinite(montoNeto) ? montoNeto + retencionesTotal : 0

  const isChequePayment = useMemo(() => {
    if (!chequesModule) return false
    if (registerCheque) return true
    if (!formaPagoId) return false
    const fp = formasPago.find((f) => f.id === Number.parseInt(formaPagoId, 10))
    return fp?.descripcion.toLowerCase().includes('cheque') ?? false
  }, [chequesModule, formaPagoId, formasPago, registerCheque])

  useEffect(() => {
    void (async () => {
      try {
        const [cList, fpList] = await Promise.all([clientesAPI.list(), formasPagoAPI.list()])
        setClientes(cList ?? [])
        setFormasPago(fpList ?? [])
      } catch {
        setClientes([])
        setFormasPago([])
      }
    })()
  }, [])

  useEffect(() => {
    if (initialClienteId != null) {
      setClienteId(String(initialClienteId))
    }
  }, [initialClienteId])

  useEffect(() => {
    if (!retencionesModule) return
    void fiscalRetencionesAPI
      .getConfig()
      .then((config) => {
        setAgenteRetencion(
          config.esAgenteRetencionGanancias ||
            config.esAgenteRetencionIVA ||
            config.esAgenteRetencionIIBB,
        )
      })
      .catch(() => setAgenteRetencion(false))
  }, [retencionesModule])

  const loadRetencionesPreview = useCallback(async () => {
    const cid = Number.parseInt(clienteId, 10)
    if (!applyRetenciones || !agenteRetencion || !Number.isFinite(cid) || cid < 1 || montoBruto <= 0) {
      setRetencionRows([])
      return
    }
    setPreviewLoading(true)
    try {
      const lines = await fiscalRetencionesAPI.previewRetenciones({
        entidadTipo: 'cliente',
        entidadId: cid,
        monto: montoBruto,
        contexto: 'cobro',
      })
      setRetencionRows(lines.map((line) => ({ ...line, selected: true })))
    } catch {
      setRetencionRows([])
    } finally {
      setPreviewLoading(false)
    }
  }, [agenteRetencion, applyRetenciones, clienteId, montoBruto])

  useEffect(() => {
    void loadRetencionesPreview()
  }, [loadRetencionesPreview])

  const mapError = useCallback((err: unknown): string => {
    if (err instanceof ApiRequestFailedError) {
      if (err.message === 'CLIENT_SUSPENDED') return t('form.errors.suspended')
      if (err.message === 'CLIENT_INACTIVE') return t('form.errors.inactive')
      return err.message.trim() || t('form.errors.generic')
    }
    return t('form.errors.generic')
  }, [t])

  const submitForm = useCallback(async () => {
    setError(null)
    const cid = Number.parseInt(clienteId, 10)
    const amount = Number.parseFloat(monto)
    if (!Number.isFinite(cid) || cid < 1) {
      setError(t('form.errors.clientRequired'))
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t('form.errors.amountRequired'))
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

    const clienteRsocial = clientes.find((c) => c.id === cid)?.rsocial ?? 'Cliente'
    if (isChequePayment) {
      if (!chequeNumero.trim() || !chequeBanco.trim() || !chequeVencimiento.trim()) {
        setError(t('form.cheque.errors.required'))
        return
      }
    }

    const body: CobroCreateBody = {
      clienteId: cid,
      fecha,
      monto: amount,
      formaPagoId: formaPagoId ? Number.parseInt(formaPagoId, 10) : null,
      referencia: referencia.trim() || null,
      nota: nota.trim() || null,
      ...(retencionesPayload != null && retencionesPayload.length > 0
        ? { retenciones: retencionesPayload }
        : {}),
      ...(isChequePayment
        ? {
            chequeNuevo: {
              tipo: 'recibido',
              modalidad: chequeModalidad,
              numero: chequeNumero.trim(),
              banco: chequeBanco.trim(),
              libradorNombre: clienteRsocial,
              monto: montoBruto > 0 ? montoBruto : amount,
              fechaEmision: fecha,
              fechaVencimiento: chequeVencimiento,
              clienteId: cid,
            },
          }
        : {}),
    }
    setSaving(true)
    try {
      await cobrosAPI.create(body)
      onSaved()
    } catch (err: unknown) {
      setError(mapError(err))
    } finally {
      setSaving(false)
    }
  }, [
    applyRetenciones,
    clienteId,
    fecha,
    formaPagoId,
    mapError,
    monto,
    nota,
    onSaved,
    chequeBanco,
    chequeModalidad,
    chequeNumero,
    chequeVencimiento,
    clientes,
    isChequePayment,
    referencia,
    retencionRows,
    montoBruto,
    t,
  ])

  useFormPageHotkeys({
    onSave: () => void submitForm(),
    onClose: onCancel,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm()
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} data-testid="cobro-form" aria-labelledby="cobro-form-title">
      <KeyboardHint shortcuts={formShortcuts} className="mb-4" />
      <h2 id="cobro-form-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
        {t('form.titleNew')}
      </h2>
      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert" data-testid="cobro-form-error">
          {error}
        </p>
      )}
      <CobroFormFields
        t={t}
        clientes={clientes}
        formasPago={formasPago}
        clienteId={clienteId}
        setClienteId={setClienteId}
        lockCliente={initialClienteId != null}
        fecha={fecha}
        setFecha={setFecha}
        monto={monto}
        setMonto={setMonto}
        formaPagoId={formaPagoId}
        setFormaPagoId={setFormaPagoId}
        referencia={referencia}
        setReferencia={setReferencia}
        nota={nota}
        setNota={setNota}
      />
      {chequesModule ? (
        <div className="mt-4 space-y-3 rounded border border-slate-200 dark:border-slate-600 p-3" data-testid="cobro-cheque-section">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={registerCheque}
              onChange={(e) => setRegisterCheque(e.target.checked)}
              data-testid="cobro-register-cheque"
            />
            {t('form.cheque.register')}
          </label>
          {isChequePayment ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cobro-cheque-numero" className="block text-sm mb-1">
                  {t('form.cheque.numero')}
                </label>
                <input
                  id="cobro-cheque-numero"
                  className={inputClass}
                  value={chequeNumero}
                  onChange={(e) => setChequeNumero(e.target.value)}
                  data-testid="cobro-cheque-numero"
                />
              </div>
              <div>
                <label htmlFor="cobro-cheque-banco" className="block text-sm mb-1">
                  {t('form.cheque.banco')}
                </label>
                <input
                  id="cobro-cheque-banco"
                  className={inputClass}
                  value={chequeBanco}
                  onChange={(e) => setChequeBanco(e.target.value)}
                  data-testid="cobro-cheque-banco"
                />
              </div>
              <div>
                <label htmlFor="cobro-cheque-vencimiento" className="block text-sm mb-1">
                  {t('form.cheque.vencimiento')}
                </label>
                <input
                  id="cobro-cheque-vencimiento"
                  type="date"
                  className={inputClass}
                  value={chequeVencimiento}
                  onChange={(e) => setChequeVencimiento(e.target.value)}
                  data-testid="cobro-cheque-vencimiento"
                />
              </div>
              <div>
                <label htmlFor="cobro-cheque-modalidad" className="block text-sm mb-1">
                  {t('form.cheque.modalidad')}
                </label>
                <select
                  id="cobro-cheque-modalidad"
                  className={inputClass}
                  value={chequeModalidad}
                  onChange={(e) => setChequeModalidad(e.target.value as ChequeModalidadDTO)}
                  data-testid="cobro-cheque-modalidad"
                >
                  <option value="fisico">{t('form.cheque.modalidadFisico')}</option>
                  <option value="echeq">{t('form.cheque.modalidadEcheq')}</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {retencionesModule && agenteRetencion && Number.isFinite(montoNeto) && montoNeto > 0 ? (
        <div className="mt-4 rounded border border-slate-200 dark:border-slate-600 p-3 space-y-3" data-testid="cobro-retenciones-section">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={applyRetenciones}
              onChange={(e) => setApplyRetenciones(e.target.checked)}
              data-testid="cobro-apply-retenciones"
            />
            {t('form.retenciones.apply')}
          </label>
          {applyRetenciones ? (
            previewLoading ? (
              <p className="text-sm text-slate-500">{t('form.retenciones.loading')}</p>
            ) : retencionRows.length === 0 ? (
              <p className="text-sm text-slate-500">{t('form.retenciones.empty')}</p>
            ) : (
              <table className="w-full text-sm" data-testid="cobro-retenciones-table">
                <caption className="sr-only">{t('form.retenciones.caption')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                    <th scope="col" className="py-1 pr-2">{t('form.retenciones.colSelect')}</th>
                    <th scope="col" className="py-1 pr-2">{t('form.retenciones.colRegimen')}</th>
                    <th scope="col" className="py-1 text-right">{t('form.retenciones.colImporte')}</th>
                  </tr>
                </thead>
                <tbody>
                  {retencionRows.map((row, idx) => (
                    <tr key={row.regimenId} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-1 pr-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          aria-label={row.nombre}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setRetencionRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, selected: checked } : r)),
                            )
                          }}
                        />
                      </td>
                      <td className="py-1 pr-2">{row.nombre}</td>
                      <td className="py-1 text-right tabular-nums">{row.importe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
          {retencionesTotal > 0 ? (
            <p className="text-sm text-slate-700 dark:text-slate-300" data-testid="cobro-monto-bruto">
              {t('form.retenciones.bruto')}: ${montoBruto.toFixed(2)} · {t('form.retenciones.neto')}: $
              {montoNeto.toFixed(2)}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex gap-2 mt-6 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
          onClick={onCancel}
          disabled={saving}
        >
          {t('form.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={saving}
          data-testid="cobro-submit"
        >
          {t('form.save')}
        </button>
      </div>
    </form>
  )
}

type FieldsProps = {
  t: (key: string) => string
  clientes: Cliente[]
  formasPago: FormaPagoOption[]
  clienteId: string
  setClienteId: (v: string) => void
  lockCliente: boolean
  fecha: string
  setFecha: (v: string) => void
  monto: string
  setMonto: (v: string) => void
  formaPagoId: string
  setFormaPagoId: (v: string) => void
  referencia: string
  setReferencia: (v: string) => void
  nota: string
  setNota: (v: string) => void
}

function CobroFormFields(p: FieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="cobro-cliente" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.client')}
        </label>
        <select
          id="cobro-cliente"
          className={inputClass}
          value={p.clienteId}
          onChange={(e) => p.setClienteId(e.target.value)}
          required
          disabled={p.lockCliente}
        >
          <option value="">{p.t('form.clientPlaceholder')}</option>
          {p.clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo} — {c.rsocial}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cobro-fecha" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.date')}
        </label>
        <input
          id="cobro-fecha"
          type="date"
          className={inputClass}
          value={p.fecha}
          onChange={(e) => p.setFecha(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="cobro-monto" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.amount')}
        </label>
        <input
          id="cobro-monto"
          type="number"
          min="0.01"
          step="0.01"
          className={inputClass}
          value={p.monto}
          onChange={(e) => p.setMonto(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="cobro-forma-pago" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.paymentMethod')}
        </label>
        <select
          id="cobro-forma-pago"
          className={inputClass}
          value={p.formaPagoId}
          onChange={(e) => p.setFormaPagoId(e.target.value)}
        >
          <option value="">{p.t('form.paymentMethodNone')}</option>
          {p.formasPago.map((fp) => (
            <option key={fp.id} value={fp.id}>
              {fp.descripcion}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cobro-referencia" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.reference')}
        </label>
        <input
          id="cobro-referencia"
          type="text"
          maxLength={60}
          className={inputClass}
          value={p.referencia}
          onChange={(e) => p.setReferencia(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cobro-nota" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {p.t('form.note')}
        </label>
        <textarea
          id="cobro-nota"
          maxLength={200}
          rows={2}
          className={inputClass}
          value={p.nota}
          onChange={(e) => p.setNota(e.target.value)}
        />
      </div>
    </div>
  )
}
