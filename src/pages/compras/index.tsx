import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import { comprasAPI, type OrdenCompra } from '@/lib/api'
import type { ComprasOcPrefillState } from '@/lib/comprasOcPrefill'

const ESTADOS = ['draft', 'sent', 'received', 'cancelled'] as const

function formatMoney(value: string): string {
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export default function ComprasPage() {
  const { t } = useTranslation('compras')

  return (
    <CanAccess
      permission="suppliers.read"
      fallback={
        <div data-testid="compras-forbidden">
          <p className="p-8 text-slate-600 dark:text-slate-300">{t('noAccess')}</p>
        </div>
      }
    >
      <ComprasPageContent />
    </CanAccess>
  )
}

function ComprasPageContent() {
  const { t } = useTranslation('compras')
  const location = useLocation()
  const navigate = useNavigate()
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [selected, setSelected] = useState<OrdenCompra | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [receiveQty, setReceiveQty] = useState<Record<number, string>>({})
  const [formProveedorId, setFormProveedorId] = useState('')
  const [formArticuloId, setFormArticuloId] = useState('')
  const [formCantidad, setFormCantidad] = useState('1')
  const [formCosto, setFormCosto] = useState('')
  const [formNota, setFormNota] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await comprasAPI.list(estadoFilter ? { estado: estadoFilter } : undefined)
      setOrdenes(res?.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [estadoFilter])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    const prefill = (location.state as ComprasOcPrefillState | null)?.ocPrefill
    if (!prefill) return
    setFormProveedorId(String(prefill.proveedorId))
    setFormArticuloId(String(prefill.articuloId))
    setFormCosto(prefill.costoUnitario ?? '')
    setFormCantidad('1')
    setFormNota('')
    setShowForm(true)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  const refreshSelected = async (id: number) => {
    const detail = await comprasAPI.get(id)
    if (detail) {
      setSelected(detail)
      const qty: Record<number, string> = {}
      for (const item of detail.items) {
        const pending = item.cantidad - item.cantidadRecibida
        qty[item.id] = pending > 0 ? String(pending) : ''
      }
      setReceiveQty(qty)
    }
  }

  const handleCreate = async () => {
    const proveedorId = Number.parseInt(formProveedorId, 10)
    const articuloId = Number.parseInt(formArticuloId, 10)
    const cantidad = Number.parseInt(formCantidad, 10)
    const costoUnitario = Number.parseFloat(formCosto)
    if (
      !Number.isFinite(proveedorId) ||
      !Number.isFinite(articuloId) ||
      !Number.isFinite(cantidad) ||
      !Number.isFinite(costoUnitario)
    ) {
      return
    }
    setActionLoading(true)
    try {
      await comprasAPI.create({
        proveedorId,
        nota: formNota.trim() || null,
        items: [{ articuloId, cantidad, costoUnitario }],
      })
      setShowForm(false)
      await loadList()
    } finally {
      setActionLoading(false)
    }
  }

  const runAction = async (fn: () => Promise<OrdenCompra | undefined>) => {
    if (!selected) return
    setActionLoading(true)
    try {
      const updated = await fn()
      if (updated) {
        setSelected(updated)
      } else {
        await refreshSelected(selected.id)
      }
      await loadList()
    } finally {
      setActionLoading(false)
    }
  }

  const handleReceive = async () => {
    if (!selected) return
    const lines = selected.items
      .map((item) => {
        const cantidad = Number.parseInt(receiveQty[item.id] ?? '', 10)
        if (!Number.isFinite(cantidad) || cantidad < 1) return null
        return { itemId: item.id, cantidad }
      })
      .filter((line): line is { itemId: number; cantidad: number } => line !== null)
    if (lines.length === 0) return
    setActionLoading(true)
    try {
      const updated = await comprasAPI.receive(selected.id, lines)
      if (updated) setSelected(updated)
      setShowReceive(false)
      await loadList()
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="compras-page">
        <header className="mb-6 flex flex-wrap gap-4 items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          <CanAccess permission="suppliers.manage">
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              data-testid="compras-btn-new"
              onClick={() => setShowForm(true)}
            >
              {t('actions.new')}
            </button>
          </CanAccess>
        </header>

        <div className="mb-4 flex gap-3 items-end" data-testid="compras-filter">
          <div>
            <label htmlFor="compras-estado-filter" className="block text-xs text-slate-500 mb-1">
              {t('filterEstado')}
            </label>
            <select
              id="compras-estado-filter"
              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <option value="">{t('filterAll')}</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {t(`estado.${e}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AsyncWrapper loading={loading} error={loadError}>
          {ordenes.length === 0 ? (
            <p data-testid="compras-empty">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="compras-table">
                <caption className="sr-only">{t('title')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th scope="col" className="py-2 pr-2">{t('columns.id')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.proveedor')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.total')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.estado')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => (
                    <tr
                      key={o.id}
                      className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer ${
                        selected?.id === o.id ? 'bg-blue-50 dark:bg-slate-800' : ''
                      }`}
                      data-testid={`compras-row-${o.id}`}
                      onClick={() => {
                        void refreshSelected(o.id)
                      }}
                    >
                      <td className="py-2 pr-2 font-mono">#{o.id}</td>
                      <td className="py-2 pr-2">{o.proveedor?.rsocial ?? o.proveedorId}</td>
                      <td className="py-2 pr-2 font-mono">{formatMoney(o.total)}</td>
                      <td className="py-2 pr-2">{t(`estado.${o.estado as (typeof ESTADOS)[number]}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>

        {selected && (
          <section
            className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
            data-testid="compras-detail"
          >
            <h2 className="font-semibold mb-2">
              #{selected.id} — {selected.proveedor?.rsocial}
            </h2>
            <p className="text-sm mb-3">
              {t('columns.estado')}: {t(`estado.${selected.estado as (typeof ESTADOS)[number]}`)}
            </p>
            <div className="flex flex-wrap gap-2">
              <CanAccess permission="suppliers.manage">
                {selected.estado === 'draft' && (
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-emerald-600 text-white"
                    data-testid="compras-btn-send"
                    disabled={actionLoading}
                    onClick={() => void runAction(() => comprasAPI.send(selected.id))}
                  >
                    {t('actions.send')}
                  </button>
                )}
                {(selected.estado === 'draft' || selected.estado === 'sent') && (
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-slate-600 text-white"
                    data-testid="compras-btn-cancel"
                    disabled={actionLoading}
                    onClick={() => void runAction(() => comprasAPI.cancel(selected.id))}
                  >
                    {t('actions.cancel')}
                  </button>
                )}
              </CanAccess>
              <CanAccess permission="inventory.adjust">
                {selected.estado === 'sent' && (
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-amber-600 text-white"
                    data-testid="compras-btn-receive"
                    disabled={actionLoading}
                    onClick={() => {
                      void refreshSelected(selected.id)
                      setShowReceive(true)
                    }}
                  >
                    {t('actions.receive')}
                  </button>
                )}
              </CanAccess>
            </div>
          </section>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="compras-form-dialog">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={t('actions.close')}
              onClick={() => setShowForm(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-semibold mb-4">{t('form.title')}</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="compras-proveedor-id" className="block text-xs mb-1">{t('form.proveedorId')}</label>
                  <input
                    id="compras-proveedor-id"
                    type="number"
                    min={1}
                    className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={formProveedorId}
                    onChange={(e) => setFormProveedorId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="compras-articulo-id" className="block text-xs mb-1">{t('form.articuloId')}</label>
                  <input
                    id="compras-articulo-id"
                    type="number"
                    min={1}
                    className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={formArticuloId}
                    onChange={(e) => setFormArticuloId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="compras-cantidad" className="block text-xs mb-1">{t('form.cantidad')}</label>
                  <input
                    id="compras-cantidad"
                    type="number"
                    min={1}
                    className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={formCantidad}
                    onChange={(e) => setFormCantidad(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="compras-costo" className="block text-xs mb-1">{t('form.costoUnitario')}</label>
                  <input
                    id="compras-costo"
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={formCosto}
                    onChange={(e) => setFormCosto(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="compras-nota" className="block text-xs mb-1">{t('form.nota')}</label>
                  <input
                    id="compras-nota"
                    type="text"
                    className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={formNota}
                    onChange={(e) => setFormNota(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" className="px-3 py-1 rounded border" onClick={() => setShowForm(false)}>
                  {t('actions.close')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  data-testid="compras-form-save"
                  disabled={actionLoading}
                  onClick={() => void handleCreate()}
                >
                  {t('actions.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReceive && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="compras-receive-dialog">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={t('actions.close')}
              onClick={() => setShowReceive(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-semibold mb-4">{t('receive.title')}</h2>
              <ul className="space-y-3">
                {selected.items.map((item) => {
                  const pending = item.cantidad - item.cantidadRecibida
                  if (pending <= 0) return null
                  return (
                    <li key={item.id} className="border-b pb-2">
                      <p className="text-sm font-medium">
                        {t('receive.item')}: {item.articulo?.descripcion ?? item.articuloId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('receive.pending')}: {pending}
                      </p>
                      <label htmlFor={`compras-receive-${item.id}`} className="sr-only">
                        {t('receive.cantidad')}
                      </label>
                      <input
                        id={`compras-receive-${item.id}`}
                        type="number"
                        min={1}
                        max={pending}
                        className="mt-1 w-24 border rounded px-2 py-1 dark:bg-slate-800"
                        value={receiveQty[item.id] ?? ''}
                        onChange={(e) =>
                          setReceiveQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" className="px-3 py-1 rounded border" onClick={() => setShowReceive(false)}>
                  {t('actions.close')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-amber-600 text-white"
                  data-testid="compras-receive-confirm"
                  disabled={actionLoading}
                  onClick={() => void handleReceive()}
                >
                  {t('actions.receive')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
