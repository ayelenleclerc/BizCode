import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { exportacionAPI, pedidosAPI, remitosAPI, type PedidoRow } from '@/lib/api'
import { INCOTERMS_2020 } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import IfIntegration from '@/components/IfIntegration'
import IfModule from '@/components/IfModule'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import MeliOrdenesPanel from './MeliOrdenesPanel'
import TiendanubeOrdenesPanel from './TiendanubeOrdenesPanel'
import WooCommerceOrdenesPanel from './WooCommerceOrdenesPanel'

const ESTADOS = [
  'draft',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'invoiced',
  'collected',
  'cancelled',
] as const

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function PedidosPage() {
  const { t } = useTranslation('pedidos')
  const [tab, setTab] = useState<'pedidos' | 'meli' | 'tiendanube' | 'woocommerce'>('pedidos')
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [filterEstado, setFilterEstado] = useState('')
  const [selectedRow, setSelectedRow] = useState(0)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createClienteId, setCreateClienteId] = useState('')
  const [createDescripcion, setCreateDescripcion] = useState('')
  const [createCantidad, setCreateCantidad] = useState('1')
  const [createPrecio, setCreatePrecio] = useState('0')
  const [createIncoterm, setCreateIncoterm] = useState('')
  const [createPaisDestino, setCreatePaisDestino] = useState('')
  const [createDespachanteNombre, setCreateDespachanteNombre] = useState('')
  const [createDespachanteEmail, setCreateDespachanteEmail] = useState('')
  const [notifyingId, setNotifyingId] = useState<number | null>(null)
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSaving, setCreateSaving] = useState(false)
  const listShortcuts = useGlobalListShortcuts()

  const loadPedidos = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await pedidosAPI.list({
        estado: filterEstado || undefined,
      })
      setPedidos(res?.data ?? [])
      setSelectedRow(0)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [filterEstado, t])

  useEffect(() => {
    if (tab === 'pedidos') {
      void loadPedidos()
    }
  }, [loadPedidos, tab])

  const handleKeyDown = useListKeyboardNav({
    itemCount: pedidos.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  useListPageHotkeys({
    searchInputId: 'search-pedidos-estado',
  })

  const runAction = async (id: number, action: () => Promise<unknown>, e?: MouseEvent) => {
    e?.stopPropagation()
    setActionLoadingId(id)
    try {
      await action()
      await loadPedidos()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCreate = async () => {
    setCreateError(null)
    const clienteId = Number.parseInt(createClienteId, 10)
    const cantidad = Number.parseInt(createCantidad, 10)
    const precio = Number.parseFloat(createPrecio)
    if (!Number.isInteger(clienteId) || clienteId < 1) {
      setCreateError(t('create.errors.clienteId'))
      return
    }
    if (!createDescripcion.trim()) {
      setCreateError(t('create.errors.descripcion'))
      return
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setCreateError(t('create.errors.cantidad'))
      return
    }
    if (Number.isNaN(precio) || precio < 0) {
      setCreateError(t('create.errors.precio'))
      return
    }
    setCreateSaving(true)
    try {
      await pedidosAPI.create({
        clienteId,
        items: [
          {
            descripcion: createDescripcion.trim(),
            condIva: '1',
            cantidad,
            precio,
            dscto: 0,
          },
        ],
        // Export vertical (#206): informational fields, ignored when the module is off.
        ...(createIncoterm ? { incoterm: createIncoterm } : {}),
        ...(createPaisDestino.trim() ? { paisDestino: createPaisDestino.trim() } : {}),
        ...(createDespachanteNombre.trim()
          ? { despachanteNombre: createDespachanteNombre.trim() }
          : {}),
        ...(createDespachanteEmail.trim()
          ? { despachanteEmail: createDespachanteEmail.trim() }
          : {}),
      })
      setShowCreate(false)
      setCreateClienteId('')
      setCreateDescripcion('')
      setCreateCantidad('1')
      setCreatePrecio('0')
      setCreateIncoterm('')
      setCreatePaisDestino('')
      setCreateDespachanteNombre('')
      setCreateDespachanteEmail('')
      await loadPedidos()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : t('create.errors.generic'))
    } finally {
      setCreateSaving(false)
    }
  }

  /**
   * @en Emails the customs broker stored on the order (#206); reports when SMTP is unavailable.
   * @es Avisa por email al despachante guardado en el pedido (#206); informa si SMTP no está disponible.
   * @pt-BR Notifica por email o despachante salvo no pedido (#206); informa se o SMTP não está disponível.
   */
  const handleNotifyDespachante = async (id: number, e?: MouseEvent) => {
    e?.stopPropagation()
    setNotifyingId(id)
    setNotifyMsg(null)
    try {
      const res = await exportacionAPI.notificarDespachante(id, {})
      setNotifyMsg(res.enviado ? t('export.notifyOk') : t('export.notifySmtpMissing'))
    } catch (error) {
      setNotifyMsg(error instanceof Error ? error.message : t('create.errors.generic'))
    } finally {
      setNotifyingId(null)
    }
  }

  const remitoAllowed = (estado: string) =>
    estado === 'confirmed' || estado === 'packed' || estado === 'invoiced'

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="pedidos-page">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
          </div>
          {tab === 'pedidos' ? (
            <CanAccess permission="orders.create">
              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                data-testid="pedidos-new-btn"
                onClick={() => setShowCreate(true)}
              >
                {t('newOrder')}
              </button>
            </CanAccess>
          ) : null}
        </header>

        {notifyMsg ? (
          <p
            role="status"
            aria-live="polite"
            className="mb-4 rounded border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            data-testid="pedidos-notify-despachante-msg"
          >
            {notifyMsg}
          </p>
        ) : null}

        {showCreate ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pedidos-create-title"
            data-testid="pedidos-create-dialog"
          >
            <div className="w-full max-w-md rounded bg-white dark:bg-slate-900 p-4 shadow-lg space-y-3">
              <h2 id="pedidos-create-title" className="text-lg font-semibold">
                {t('create.title')}
              </h2>
              <label className="block text-sm" htmlFor="pedidos-create-cliente">
                {t('create.clienteId')}
                <input
                  id="pedidos-create-cliente"
                  className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                  value={createClienteId}
                  onChange={(e) => setCreateClienteId(e.target.value)}
                  data-testid="pedidos-create-cliente"
                  inputMode="numeric"
                />
              </label>
              <label className="block text-sm" htmlFor="pedidos-create-desc">
                {t('create.descripcion')}
                <input
                  id="pedidos-create-desc"
                  className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                  value={createDescripcion}
                  onChange={(e) => setCreateDescripcion(e.target.value)}
                  data-testid="pedidos-create-descripcion"
                />
              </label>
              <div className="flex gap-2">
                <label className="block text-sm flex-1" htmlFor="pedidos-create-qty">
                  {t('create.cantidad')}
                  <input
                    id="pedidos-create-qty"
                    className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={createCantidad}
                    onChange={(e) => setCreateCantidad(e.target.value)}
                    data-testid="pedidos-create-cantidad"
                    inputMode="numeric"
                  />
                </label>
                <label className="block text-sm flex-1" htmlFor="pedidos-create-precio">
                  {t('create.precio')}
                  <input
                    id="pedidos-create-precio"
                    className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                    value={createPrecio}
                    onChange={(e) => setCreatePrecio(e.target.value)}
                    data-testid="pedidos-create-precio"
                    inputMode="decimal"
                  />
                </label>
              </div>
              <IfModule flag="vertical.export">
                <fieldset
                  className="rounded border border-slate-200 dark:border-slate-600 p-3 space-y-2"
                  data-testid="pedidos-create-export"
                >
                  <legend className="px-1 text-sm font-semibold">{t('export.title')}</legend>
                  <p className="text-xs text-slate-500">{t('export.hint')}</p>
                  <div className="flex gap-2">
                    <label className="block text-sm flex-1" htmlFor="pedidos-create-incoterm">
                      {t('export.incoterm')}
                      <select
                        id="pedidos-create-incoterm"
                        className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                        value={createIncoterm}
                        onChange={(e) => setCreateIncoterm(e.target.value)}
                        data-testid="pedidos-create-incoterm"
                      >
                        <option value="">{t('export.incotermNone')}</option>
                        {INCOTERMS_2020.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm flex-1" htmlFor="pedidos-create-pais">
                      {t('export.paisDestino')}
                      <input
                        id="pedidos-create-pais"
                        className="mt-1 w-full border rounded px-2 py-1 uppercase dark:bg-slate-800"
                        maxLength={2}
                        value={createPaisDestino}
                        onChange={(e) => setCreatePaisDestino(e.target.value.toUpperCase())}
                        data-testid="pedidos-create-pais-destino"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <label className="block text-sm flex-1" htmlFor="pedidos-create-despachante">
                      {t('export.despachanteNombre')}
                      <input
                        id="pedidos-create-despachante"
                        className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                        maxLength={120}
                        value={createDespachanteNombre}
                        onChange={(e) => setCreateDespachanteNombre(e.target.value)}
                        data-testid="pedidos-create-despachante-nombre"
                      />
                    </label>
                    <label
                      className="block text-sm flex-1"
                      htmlFor="pedidos-create-despachante-email"
                    >
                      {t('export.despachanteEmail')}
                      <input
                        id="pedidos-create-despachante-email"
                        type="email"
                        className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                        maxLength={160}
                        value={createDespachanteEmail}
                        onChange={(e) => setCreateDespachanteEmail(e.target.value)}
                        data-testid="pedidos-create-despachante-email"
                      />
                    </label>
                  </div>
                </fieldset>
              </IfModule>
              {createError ? (
                <p className="text-sm text-red-600" role="alert" data-testid="pedidos-create-error">
                  {createError}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border"
                  onClick={() => setShowCreate(false)}
                  data-testid="pedidos-create-cancel"
                >
                  {t('create.cancel')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                  disabled={createSaving}
                  onClick={() => void handleCreate()}
                  data-testid="pedidos-create-submit"
                >
                  {createSaving ? t('create.saving') : t('create.submit')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700" role="tablist" aria-label={t('tabsLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'pedidos'}
            className={`px-3 py-2 text-sm ${tab === 'pedidos' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
            data-testid="pedidos-tab-pedidos"
            onClick={() => setTab('pedidos')}
          >
            {t('tabPedidos')}
          </button>
          <IfIntegration id="meli">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'meli'}
              className={`px-3 py-2 text-sm ${tab === 'meli' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
              data-testid="pedidos-tab-meli"
              onClick={() => setTab('meli')}
            >
              {t('tabMeli')}
            </button>
          </IfIntegration>
          <IfIntegration id="tiendanube">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'tiendanube'}
              className={`px-3 py-2 text-sm ${tab === 'tiendanube' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
              data-testid="pedidos-tab-tiendanube"
              onClick={() => setTab('tiendanube')}
            >
              {t('tabTiendanube')}
            </button>
          </IfIntegration>
          <IfIntegration id="woocommerce">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'woocommerce'}
              className={`px-3 py-2 text-sm ${tab === 'woocommerce' ? 'border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
              data-testid="pedidos-tab-woocommerce"
              onClick={() => setTab('woocommerce')}
            >
              {t('tabWooCommerce')}
            </button>
          </IfIntegration>
        </div>

        {tab === 'meli' ? (
          <MeliOrdenesPanel />
        ) : tab === 'tiendanube' ? (
          <TiendanubeOrdenesPanel />
        ) : tab === 'woocommerce' ? (
          <WooCommerceOrdenesPanel />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <label htmlFor="search-pedidos-estado" className="text-sm text-slate-600 dark:text-slate-300">
                {t('filterEstado')}
              </label>
              <select
                id="search-pedidos-estado"
                className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-600"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                data-testid="search-pedidos-estado"
              >
                <option value="">{t('filterAll')}</option>
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>
                    {t(`estado.${est}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
                onClick={() => void loadPedidos()}
                data-testid="pedidos-refresh-btn"
                aria-label={t('filterEstado')}
              >
                ↻
              </button>
            </div>

            <AsyncWrapper loading={loading} error={loadError}>
              {pedidos.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400" data-testid="pedidos-empty">
                  {t('empty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm" data-testid="pedidos-table">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4">{t('columns.id')}</th>
                        <th className="py-2 pr-4">{t('columns.cliente')}</th>
                        <th className="py-2 pr-4">{t('columns.estado')}</th>
                        <th className="py-2 pr-4">{t('columns.total')}</th>
                        <th className="py-2 pr-4">{t('columns.fecha')}</th>
                        <th className="py-2">{t('columns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((p, idx) => (
                        <tr
                          key={p.id}
                          role="row"
                          {...(selectedRow === idx
                            ? { 'aria-selected': 'true' as const }
                            : { 'aria-selected': 'false' as const })}
                          className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition ${
                            selectedRow === idx
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                          data-testid={`pedidos-row-${p.id}`}
                          tabIndex={0}
                          onClick={() => setSelectedRow(idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                        >
                          <td className="py-2 pr-4">{p.id}</td>
                          <td className="py-2 pr-4">{p.cliente?.rsocial ?? p.clienteId}</td>
                          <td className="py-2 pr-4">{t(`estado.${p.estado}`)}</td>
                          <td className="py-2 pr-4">{formatMoney(p.total)}</td>
                          <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-2">
                            <div className="flex flex-wrap gap-1" role="group" aria-label={t('columns.actions')}>
                              {p.estado === 'draft' ? (
                                <CanAccess permission="orders.create">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-indigo-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-confirm-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.confirm(p.id), e)}
                                  >
                                    {t('actions.confirm')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {p.estado === 'confirmed' || p.estado === 'invoiced' ? (
                                <CanAccess permission="orders.pick">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-amber-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-pack-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.pack(p.id), e)}
                                  >
                                    {t('actions.pack')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {p.estado === 'packed' || p.estado === 'invoiced' ? (
                                <CanAccess permission="orders.dispatch">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-orange-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-ship-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.ship(p.id), e)}
                                  >
                                    {t('actions.ship')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {p.estado === 'shipped' || p.estado === 'invoiced' ? (
                                <CanAccess permission="orders.deliver.confirm">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-cyan-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-deliver-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.deliver(p.id), e)}
                                  >
                                    {t('actions.deliver')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {['confirmed', 'packed', 'shipped', 'delivered'].includes(p.estado) &&
                              p.facturaId == null ? (
                                <CanAccess permission="sales.create">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-emerald-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-invoice-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) =>
                                      void runAction(
                                        p.id,
                                        () =>
                                          pedidosAPI.invoice(p.id, {
                                            fecha: todayIsoDate(),
                                            tipo: 'B',
                                            numero: Date.now() % 1_000_000,
                                          }),
                                        e,
                                      )
                                    }
                                  >
                                    {t('actions.invoice')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {p.estado === 'invoiced' || p.estado === 'delivered' ? (
                                <CanAccess permission="sales.create">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-green-700 text-white disabled:opacity-50"
                                    data-testid={`pedido-collect-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.collect(p.id), e)}
                                  >
                                    {t('actions.collect')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              {p.estado === 'draft' || p.estado === 'confirmed' ? (
                                <CanAccess permission="sales.cancel">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-red-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-cancel-${p.id}`}
                                    disabled={actionLoadingId === p.id}
                                    onClick={(e) => void runAction(p.id, () => pedidosAPI.cancel(p.id), e)}
                                  >
                                    {t('actions.cancel')}
                                  </button>
                                </CanAccess>
                              ) : null}
                              <IfModule flag="vertical.export">
                                <CanAccess permission="orders.create">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-xs rounded bg-indigo-600 text-white disabled:opacity-50"
                                    data-testid={`pedido-notificar-despachante-${p.id}`}
                                    disabled={notifyingId === p.id}
                                    onClick={(e) => void handleNotifyDespachante(p.id, e)}
                                  >
                                    {notifyingId === p.id
                                      ? t('export.notifying')
                                      : t('export.notifyDespachante')}
                                  </button>
                                </CanAccess>
                              </IfModule>
                              {remitoAllowed(p.estado) ? (
                                <IfModule flag="fiscal.remito">
                                  <CanAccess permission="sales.create">
                                    <button
                                      type="button"
                                      className="px-2 py-1 text-xs rounded bg-teal-600 text-white disabled:opacity-50"
                                      data-testid={`pedido-remito-${p.id}`}
                                      disabled={actionLoadingId === p.id}
                                      onClick={(e) =>
                                        void runAction(p.id, () => remitosAPI.createFromPedido(p.id), e)
                                      }
                                    >
                                      {actionLoadingId === p.id ? t('remitoCreating') : t('generateRemito')}
                                    </button>
                                  </CanAccess>
                                </IfModule>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AsyncWrapper>

            <KeyboardHint shortcuts={listShortcuts} className="mt-4" />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}
