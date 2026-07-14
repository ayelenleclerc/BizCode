import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { contratosAPI, type ContratoRow } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

const FRECUENCIAS = ['mensual', 'bimestral', 'trimestral', 'semestral', 'anual'] as const

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toISOString().slice(0, 10)
}

type InvoiceRow = {
  id: number
  fecha: string
  tipo: string
  prefijo: string
  numero: number
  total: number | string
  estadoCae?: string
}

export default function ContratosPage() {
  const { t } = useTranslation('contratos')
  const [contratos, setContratos] = useState<ContratoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null)
  const [form, setForm] = useState({
    clienteId: '',
    nombre: '',
    frecuencia: 'mensual',
    diaDelMes: '1',
    fechaInicio: new Date().toISOString().slice(0, 10),
    modoEmision: 'revision',
    itemDesc: '',
    precioUnit: '',
  })

  const loadContratos = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await contratosAPI.list()
      setContratos(res?.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadContratos()
  }, [loadContratos])

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)
    try {
      await contratosAPI.create({
        clienteId: Number.parseInt(form.clienteId, 10),
        nombre: form.nombre.trim(),
        frecuencia: form.frecuencia,
        diaDelMes: Number.parseInt(form.diaDelMes, 10),
        fechaInicio: form.fechaInicio,
        modoEmision: form.modoEmision,
        items: [
          {
            descripcion: form.itemDesc.trim(),
            condIva: '1',
            cantidad: 1,
            precioUnit: Number.parseFloat(form.precioUnit),
            dscto: 0,
          },
        ],
      })
      setShowForm(false)
      setForm({
        clienteId: '',
        nombre: '',
        frecuencia: 'mensual',
        diaDelMes: '1',
        fechaInicio: new Date().toISOString().slice(0, 10),
        modoEmision: 'revision',
        itemDesc: '',
        precioUnit: '',
      })
      await loadContratos()
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('createError')))
    } finally {
      setSaving(false)
    }
  }

  async function handlePauseResume(row: ContratoRow): Promise<void> {
    setActionId(row.id)
    try {
      if (row.estado === 'activo') {
        await contratosAPI.pause(row.id)
      } else if (row.estado === 'pausado') {
        await contratosAPI.resume(row.id)
      }
      await loadContratos()
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('actionError')))
    } finally {
      setActionId(null)
    }
  }

  async function handleViewInvoices(id: number): Promise<void> {
    setActionId(id)
    try {
      const rows = (await contratosAPI.listFacturas(id)) as InvoiceRow[]
      setInvoices(rows)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('actionError')))
    } finally {
      setActionId(null)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="contratos-page">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          <CanAccess permission="sales.create">
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              data-testid="contratos-new-btn"
              onClick={() => setShowForm((v) => !v)}
            >
              {t('newContract')}
            </button>
          </CanAccess>
        </header>

        {showForm ? (
          <form
            className="mb-6 grid max-w-xl gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
            onSubmit={(e) => void handleCreate(e)}
            data-testid="contratos-create-form"
          >
            <h2 className="text-lg font-semibold">{t('form.title')}</h2>
            <label className="grid gap-1 text-sm">
              <span>{t('form.clienteId')}</span>
              <input
                required
                type="number"
                min={1}
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.clienteId}
                onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
                data-testid="contratos-cliente-id"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.nombre')}</span>
              <input
                required
                maxLength={120}
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                data-testid="contratos-nombre"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.frecuencia')}</span>
              <select
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.frecuencia}
                onChange={(e) => setForm((f) => ({ ...f, frecuencia: e.target.value }))}
                data-testid="contratos-frecuencia"
              >
                {FRECUENCIAS.map((freq) => (
                  <option key={freq} value={freq}>
                    {t(`frecuencia.${freq}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.diaDelMes')}</span>
              <input
                required
                type="number"
                min={1}
                max={31}
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.diaDelMes}
                onChange={(e) => setForm((f) => ({ ...f, diaDelMes: e.target.value }))}
                data-testid="contratos-dia"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.fechaInicio')}</span>
              <input
                required
                type="date"
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.fechaInicio}
                onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
                data-testid="contratos-fecha-inicio"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.modoEmision')}</span>
              <select
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.modoEmision}
                onChange={(e) => setForm((f) => ({ ...f, modoEmision: e.target.value }))}
                data-testid="contratos-modo"
              >
                <option value="revision">{t('modo.revision')}</option>
                <option value="auto">{t('modo.auto')}</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.itemDesc')}</span>
              <input
                required
                maxLength={120}
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.itemDesc}
                onChange={(e) => setForm((f) => ({ ...f, itemDesc: e.target.value }))}
                data-testid="contratos-item-desc"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>{t('form.precioUnit')}</span>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                className="rounded border px-2 py-1 dark:bg-slate-800"
                value={form.precioUnit}
                onChange={(e) => setForm((f) => ({ ...f, precioUnit: e.target.value }))}
                data-testid="contratos-precio"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                data-testid="contratos-submit"
              >
                {t('form.submit')}
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1.5"
                onClick={() => setShowForm(false)}
                data-testid="contratos-cancel"
              >
                {t('form.cancel')}
              </button>
            </div>
          </form>
        ) : null}

        {invoices ? (
          <div
            className="mb-6 rounded border border-slate-200 p-4 dark:border-slate-700"
            data-testid="contratos-invoices-panel"
            role="region"
            aria-label={t('invoicesTitle')}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('invoicesTitle')}</h2>
              <button type="button" className="text-sm underline" onClick={() => setInvoices(null)}>
                {t('close')}
              </button>
            </div>
            {invoices.length === 0 ? (
              <p className="text-slate-500">{t('invoicesEmpty')}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    {inv.tipo}-{inv.prefijo}-{inv.numero} · {formatDate(String(inv.fecha))} ·{' '}
                    {formatMoney(inv.total)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <AsyncWrapper loading={loading} error={loadError}>
          {contratos.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400" data-testid="contratos-empty">
              {t('empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" data-testid="contratos-table">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                    <th className="py-2 pr-4">{t('columns.numero')}</th>
                    <th className="py-2 pr-4">{t('columns.nombre')}</th>
                    <th className="py-2 pr-4">{t('columns.cliente')}</th>
                    <th className="py-2 pr-4">{t('columns.estado')}</th>
                    <th className="py-2 pr-4">{t('columns.proximaFact')}</th>
                    <th className="py-2 pr-4">{t('columns.monto')}</th>
                    <th className="py-2 pr-4">{t('columns.modo')}</th>
                    <th className="py-2 pr-4">{t('columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                      data-testid={`contratos-row-${row.id}`}
                    >
                      <td className="py-2 pr-4">{row.numero}</td>
                      <td className="py-2 pr-4">{row.nombre}</td>
                      <td className="py-2 pr-4">{row.cliente?.rsocial ?? row.clienteId}</td>
                      <td className="py-2 pr-4">{t(`estado.${row.estado}`)}</td>
                      <td className="py-2 pr-4">{formatDate(row.proximaFact)}</td>
                      <td className="py-2 pr-4">{formatMoney(row.montoBase)}</td>
                      <td className="py-2 pr-4">{t(`modo.${row.modoEmision}`)}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <CanAccess permission="sales.create">
                            {(row.estado === 'activo' || row.estado === 'pausado') && (
                              <button
                                type="button"
                                className="rounded border px-2 py-1"
                                disabled={actionId === row.id}
                                onClick={() => void handlePauseResume(row)}
                                data-testid={`contratos-pause-resume-${row.id}`}
                              >
                                {row.estado === 'activo' ? t('pause') : t('resume')}
                              </button>
                            )}
                          </CanAccess>
                          <button
                            type="button"
                            className="rounded border px-2 py-1"
                            disabled={actionId === row.id}
                            onClick={() => void handleViewInvoices(row.id)}
                            data-testid={`contratos-facturas-${row.id}`}
                          >
                            {t('viewInvoices')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
