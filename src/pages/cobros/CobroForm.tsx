import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, clientesAPI, cobrosAPI, formasPagoAPI, type CobroCreateBody } from '@/lib/api'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
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
    const body: CobroCreateBody = {
      clienteId: cid,
      fecha,
      monto: amount,
      formaPagoId: formaPagoId ? Number.parseInt(formaPagoId, 10) : null,
      referencia: referencia.trim() || null,
      nota: nota.trim() || null,
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
  }, [clienteId, fecha, formaPagoId, mapError, monto, nota, onSaved, referencia, t])

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
