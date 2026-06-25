import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  contabilidadAPI,
  proveedoresAPI,
  type ComprobanteCompraInputDTO,
} from '@/lib/api'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
import type { Proveedor } from '@bizcode/types'

type ComprobanteCompraRegisterFormProps = {
  onRegistered: () => void
}

const TIPOS = ['A', 'B', 'C'] as const

function parseAmount(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * @en Supplier fiscal voucher registration for Libro IVA Compras (#306 UX).
 * @es Alta de comprobante fiscal de proveedor para Libro IVA Compras (#306 UX).
 * @pt-BR Registro de comprovante fiscal de fornecedor para Livro IVA Compras (#306 UX).
 */
export default function ComprobanteCompraRegisterForm({ onRegistered }: ComprobanteCompraRegisterFormProps) {
  const { t } = useTranslation('finanzas')
  const formShortcuts = useFormShortcuts()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loadingProveedores, setLoadingProveedores] = useState(false)
  const [proveedorId, setProveedorId] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [vencimiento, setVencimiento] = useState('')
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>('B')
  const [prefijo, setPrefijo] = useState('0001')
  const [numero, setNumero] = useState('1')
  const [neto1, setNeto1] = useState('0')
  const [neto2, setNeto2] = useState('0')
  const [neto3, setNeto3] = useState('0')
  const [iva1, setIva1] = useState('0')
  const [iva2, setIva2] = useState('0')
  const [total, setTotal] = useState('0')
  const [cae, setCae] = useState('')
  const [caeVto, setCaeVto] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<number | null>(null)

  const loadProveedores = useCallback(async () => {
    setLoadingProveedores(true)
    try {
      const list = await proveedoresAPI.list()
      setProveedores(Array.isArray(list) ? list : [])
    } catch {
      setProveedores([])
    } finally {
      setLoadingProveedores(false)
    }
  }, [])

  useEffect(() => {
    void loadProveedores()
  }, [loadProveedores])

  const submitForm = useCallback(async () => {
    setFormError(null)
    setSuccessId(null)

    const provId = Number.parseInt(proveedorId, 10)
    const num = Number.parseInt(numero, 10)
    if (!Number.isInteger(provId) || provId < 1) {
      setFormError(t('comprobanteCompra.errors.proveedorRequired'))
      return
    }
    if (!Number.isInteger(num) || num < 1) {
      setFormError(t('comprobanteCompra.errors.numeroInvalid'))
      return
    }
    if (!prefijo.trim()) {
      setFormError(t('comprobanteCompra.errors.prefijoRequired'))
      return
    }

    const body: ComprobanteCompraInputDTO = {
      fecha: new Date(`${fecha}T12:00:00.000Z`).toISOString(),
      tipo,
      prefijo: prefijo.trim(),
      numero: num,
      proveedorId: provId,
      neto1: parseAmount(neto1),
      neto2: parseAmount(neto2),
      neto3: parseAmount(neto3),
      iva1: parseAmount(iva1),
      iva2: parseAmount(iva2),
      total: parseAmount(total),
      ...(cae.trim() ? { cae: cae.trim() } : {}),
      ...(caeVto ? { caeVto: new Date(`${caeVto}T12:00:00.000Z`).toISOString() } : {}),
      ...(vencimiento.trim()
        ? { vencimiento: new Date(`${vencimiento}T12:00:00.000Z`).toISOString() }
        : {}),
    }

    setSaving(true)
    try {
      const result = await contabilidadAPI.createComprobanteCompra(body)
      setSuccessId(result.id)
      onRegistered()
    } catch (error) {
      if (error instanceof ApiRequestFailedError) {
        setFormError(error.message)
      } else {
        setFormError(t('comprobanteCompra.errors.saveFailed'))
      }
    } finally {
      setSaving(false)
    }
  }, [
    cae,
    caeVto,
    fecha,
    neto1,
    neto2,
    neto3,
    iva1,
    iva2,
    numero,
    onRegistered,
    prefijo,
    proveedorId,
    t,
    tipo,
    total,
    vencimiento,
  ])

  useFormPageHotkeys({
    onSave: () => void submitForm(),
    onClose: () => {},
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await submitForm()
  }

  return (
    <form
      className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/40"
      onSubmit={(e) => void handleSubmit(e)}
      data-testid="finanzas-comprobante-compra-form"
      aria-labelledby="finanzas-comprobante-compra-form-heading"
    >
      <KeyboardHint shortcuts={formShortcuts} className="mb-4" />
      <h3
        id="finanzas-comprobante-compra-form-heading"
        className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200"
      >
        {t('comprobanteCompra.formTitle')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div>
          <label htmlFor="finanzas-cc-proveedor" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.proveedor')}
          </label>
          <select
            id="finanzas-cc-proveedor"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            disabled={loadingProveedores || saving}
            required
            data-testid="finanzas-comprobante-compra-proveedor"
          >
            <option value="">{t('comprobanteCompra.selectProveedor')}</option>
            {proveedores.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.codigo} — {p.rsocial}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="finanzas-cc-fecha" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.fecha')}
          </label>
          <input
            id="finanzas-cc-fecha"
            type="date"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={saving}
            required
            data-testid="finanzas-comprobante-compra-fecha"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-vencimiento" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.vencimiento')}
          </label>
          <input
            id="finanzas-cc-vencimiento"
            type="date"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-vencimiento"
            aria-describedby="finanzas-cc-vencimiento-hint"
          />
          <p id="finanzas-cc-vencimiento-hint" className="text-xs text-slate-500 mt-1">
            {t('comprobanteCompra.vencimientoHint')}
          </p>
        </div>
        <div>
          <label htmlFor="finanzas-cc-tipo" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.tipo')}
          </label>
          <select
            id="finanzas-cc-tipo"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-tipo"
          >
            {TIPOS.map((tv) => (
              <option key={tv} value={tv}>
                {tv}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="finanzas-cc-prefijo" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.prefijo')}
          </label>
          <input
            id="finanzas-cc-prefijo"
            type="text"
            maxLength={4}
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={prefijo}
            onChange={(e) => setPrefijo(e.target.value)}
            disabled={saving}
            required
            data-testid="finanzas-comprobante-compra-prefijo"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-numero" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.numero')}
          </label>
          <input
            id="finanzas-cc-numero"
            type="number"
            min={1}
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            disabled={saving}
            required
            data-testid="finanzas-comprobante-compra-numero"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-neto1" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.neto1')}
          </label>
          <input
            id="finanzas-cc-neto1"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={neto1}
            onChange={(e) => setNeto1(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-neto1"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-iva1" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.iva1')}
          </label>
          <input
            id="finanzas-cc-iva1"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={iva1}
            onChange={(e) => setIva1(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-iva1"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-neto2" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.neto2')}
          </label>
          <input
            id="finanzas-cc-neto2"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={neto2}
            onChange={(e) => setNeto2(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-neto2"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-iva2" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.iva2')}
          </label>
          <input
            id="finanzas-cc-iva2"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={iva2}
            onChange={(e) => setIva2(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-iva2"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-neto3" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.neto3')}
          </label>
          <input
            id="finanzas-cc-neto3"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={neto3}
            onChange={(e) => setNeto3(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-neto3"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-total" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.total')}
          </label>
          <input
            id="finanzas-cc-total"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            disabled={saving}
            required
            data-testid="finanzas-comprobante-compra-total"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-cae" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.cae')}
          </label>
          <input
            id="finanzas-cc-cae"
            type="text"
            maxLength={20}
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 font-mono"
            value={cae}
            onChange={(e) => setCae(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-cae"
          />
        </div>
        <div>
          <label htmlFor="finanzas-cc-caevto" className="block text-xs text-slate-500 mb-1">
            {t('comprobanteCompra.caeVto')}
          </label>
          <input
            id="finanzas-cc-caevto"
            type="date"
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={caeVto}
            onChange={(e) => setCaeVto(e.target.value)}
            disabled={saving}
            data-testid="finanzas-comprobante-compra-caevto"
          />
        </div>
      </div>

      {formError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert" data-testid="finanzas-comprobante-compra-error">
          {formError}
        </p>
      )}
      {successId != null && (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400" role="status" data-testid="finanzas-comprobante-compra-success">
          {t('comprobanteCompra.saved', { id: successId })}
        </p>
      )}

      <button
        type="submit"
        className="mt-3 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={saving || loadingProveedores}
        data-testid="finanzas-comprobante-compra-submit"
      >
        {saving ? t('comprobanteCompra.saving') : t('comprobanteCompra.submit')}
      </button>
    </form>
  )
}
