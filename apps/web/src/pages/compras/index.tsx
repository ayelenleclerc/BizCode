import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import { articulosAPI, comprasAPI, proveedoresAPI, type OrdenCompra, type OrdenCompraItemRow } from '@/lib/api'
import type { ComprasOcPrefillState } from '@/lib/comprasOcPrefill'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { allowsDecimalQuantity, type Articulo, type UnidadBase } from '@bizcode/types'

const ESTADOS = ['draft', 'sent', 'received', 'cancelled'] as const

type ReceiveQuantityConfig = {
  decimalAllowed: boolean
  step: string
  factorConversion: number
}

/**
 * @en Resolves the receive-quantity input rules for an OC line from its catalog article's UoM data (#203); defaults to integer-only when the module is disabled or the article isn't loaded yet.
 * @es Resuelve las reglas del input de cantidad a recibir para una línea de OC según los datos UoM del artículo de catálogo (#203); usa enteros por defecto si el módulo está deshabilitado o el artículo aún no cargó.
 * @pt-BR Resolve as regras do input de quantidade a receber para uma linha de OC a partir dos dados UoM do artigo de catálogo (#203); usa somente inteiros por padrão quando o módulo está desabilitado ou o artigo ainda não carregou.
 */
function resolveReceiveQuantityConfig(articulo: Articulo | undefined, uomEnabled: boolean): ReceiveQuantityConfig {
  if (!uomEnabled || !articulo) {
    return { decimalAllowed: false, step: '1', factorConversion: 1 }
  }
  const unidadBase = (articulo.unidadBase ?? 'unidad') as UnidadBase
  const multiploVenta = articulo.multiploVenta != null ? Number(articulo.multiploVenta) : null
  const factorConversion = articulo.factorConversion != null ? Number(articulo.factorConversion) : 1
  return {
    decimalAllowed: allowsDecimalQuantity(unidadBase, multiploVenta),
    step: allowsDecimalQuantity(unidadBase, multiploVenta) ? '0.0001' : '1',
    factorConversion,
  }
}

function formatMoney(value: string): string {
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function itemCodigoProveedor(item: OrdenCompraItemRow): string {
  if (item.codigoProveedor?.trim()) return item.codigoProveedor.trim()
  return String(item.articulo?.codigo ?? item.articuloId)
}

function itemDescripcionProveedor(item: OrdenCompraItemRow): string {
  if (item.descripcionProveedor?.trim()) return item.descripcionProveedor.trim()
  return item.articulo?.descripcion ?? `#${item.articuloId}`
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
  const { hasModule } = useFeatureFlags()
  const uomModule = hasModule('inventory.uom')
  const [articulosById, setArticulosById] = useState<Record<number, Articulo>>({})
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [selected, setSelected] = useState<OrdenCompra | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [receiveQty, setReceiveQty] = useState<Record<number, string>>({})
  const [receiveLote, setReceiveLote] = useState<Record<number, string>>({})
  const [receiveVenc, setReceiveVenc] = useState<Record<number, string>>({})
  const [formProveedorId, setFormProveedorId] = useState('')
  const [formArticuloId, setFormArticuloId] = useState('')
  const [formCantidad, setFormCantidad] = useState('1')
  const [formCosto, setFormCosto] = useState('')
  const formCostoRef = useRef(formCosto)
  formCostoRef.current = formCosto
  const [formNota, setFormNota] = useState('')
  const [catalogHint, setCatalogHint] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState(0)
  const listShortcuts = useGlobalListShortcuts()

  const loadList = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await comprasAPI.list(estadoFilter ? { estado: estadoFilter } : undefined)
      setOrdenes(res?.data ?? [])
      setSelectedRow(0)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [estadoFilter])

  useEffect(() => {
    void loadList()
  }, [loadList])

  // UoM (#203): OC item rows only carry id/codigo/descripcion/controlLote for the article;
  // load the catalog once to resolve unidadBase/factorConversion/multiploVenta for the receive dialog.
  useEffect(() => {
    if (!uomModule) {
      setArticulosById({})
      return
    }
    let cancelled = false
    void articulosAPI
      .list()
      .then((list: Articulo[] | undefined) => {
        if (cancelled || !list) return
        const map: Record<number, Articulo> = {}
        for (const articulo of list) {
          map[articulo.id] = articulo
        }
        setArticulosById(map)
      })
      .catch(() => {
        if (!cancelled) setArticulosById({})
      })
    return () => {
      cancelled = true
    }
  }, [uomModule])

  useEffect(() => {
    const prefill = (location.state as ComprasOcPrefillState | null)?.ocPrefill
    if (!prefill) return
    setFormProveedorId(String(prefill.proveedorId))
    setFormArticuloId(String(prefill.articuloId))
    setFormCosto(prefill.costoUnitario ?? '')
    setFormCantidad('1')
    setFormNota('')
    if (prefill.codigoProveedor || prefill.descripcionProveedor) {
      setCatalogHint(
        [prefill.codigoProveedor, prefill.descripcionProveedor].filter(Boolean).join(' — '),
      )
    } else {
      setCatalogHint(null)
    }
    setShowForm(true)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const proveedorId = Number.parseInt(formProveedorId, 10)
    const articuloId = Number.parseInt(formArticuloId, 10)
    if (!Number.isInteger(proveedorId) || proveedorId < 1 || !Number.isInteger(articuloId) || articuloId < 1) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const entries = await proveedoresAPI.listCatalogo(proveedorId)
        const entry = entries.find((e) => e.articuloId === articuloId && e.activo)
        if (cancelled) return
        if (entry) {
          setCatalogHint(`${entry.codigoProveedor} — ${entry.descripcion ?? entry.articulo.descripcion}`)
          if (!formCostoRef.current.trim() && entry.precioLista) {
            setFormCosto(entry.precioLista)
          }
        } else {
          setCatalogHint(null)
        }
      } catch {
        if (!cancelled) setCatalogHint(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [formProveedorId, formArticuloId])

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

  const openOrdenRow = useCallback(
    (index: number) => {
      const o = ordenes[index]
      if (o) void refreshSelected(o.id)
    },
    [ordenes],
  )

  const handleKeyDown = useListKeyboardNav({
    itemCount: ordenes.length,
    selectedRow,
    setSelectedRow,
    onOpenRow: openOrdenRow,
  })

  useListPageHotkeys({
    searchInputId: 'search-compras-estado',
    onNew: () => setShowForm(true),
    onClose: () => {
      setShowForm(false)
      setShowReceive(false)
    },
    isOverlayOpen: showForm || showReceive,
  })

  const handleReceive = async () => {
    if (!selected) return
    const lines = selected.items
      .map((item) => {
        const qtyConfig = resolveReceiveQuantityConfig(articulosById[item.articuloId], uomModule)
        const raw = receiveQty[item.id] ?? ''
        const cantidad = qtyConfig.decimalAllowed ? Number.parseFloat(raw) : Number.parseInt(raw, 10)
        if (!Number.isFinite(cantidad) || cantidad <= 0) return null
        const needsLot = item.articulo?.controlLote === true
        const nroLote = (receiveLote[item.id] ?? '').trim()
        const fechaVencimiento = (receiveVenc[item.id] ?? '').trim()
        return {
          itemId: item.id,
          cantidad,
          ...(needsLot && nroLote && fechaVencimiento ? { nroLote, fechaVencimiento } : {}),
        }
      })
      .filter(
        (line): line is { itemId: number; cantidad: number; nroLote?: string; fechaVencimiento?: string } =>
          line !== null,
      )
    if (lines.length === 0) return
    setActionLoading(true)
    try {
      const updated = await comprasAPI.receive(selected.id, lines)
      if (updated) setSelected(updated)
      setShowReceive(false)
      setReceiveLote({})
      setReceiveVenc({})
      await loadList()
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const blob = await comprasAPI.downloadPdf(selected.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `orden-compra-${selected.id}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
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
            <label htmlFor="search-compras-estado" className="block text-xs text-slate-500 mb-1">
              {t('filterEstado')}
            </label>
            <select
              id="search-compras-estado"
              data-testid="search-compras-estado"
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
                  {ordenes.map((o, idx) => (
                    <tr
                      key={o.id}
                      role="row"
                      {...(selectedRow === idx
                        ? { 'aria-selected': 'true' as const }
                        : { 'aria-selected': 'false' as const })}
                      className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition ${
                        selectedRow === idx
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                      }`}
                      data-testid={`compras-row-${o.id}`}
                      tabIndex={0}
                      onClick={() => {
                        setSelectedRow(idx)
                        void refreshSelected(o.id)
                      }}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
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
            {selected.items.length > 0 ? (
              <div className="overflow-x-auto mb-4" data-testid="compras-detail-items">
                <table className="w-full text-sm border border-slate-200 dark:border-slate-700">
                  <caption className="sr-only">{t('detail.itemsCaption')}</caption>
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-left">
                      <th scope="col" className="px-2 py-1">{t('detail.colCodigoProveedor')}</th>
                      <th scope="col" className="px-2 py-1">{t('detail.colDescripcionProveedor')}</th>
                      <th scope="col" className="px-2 py-1">{t('detail.colCantidad')}</th>
                      <th scope="col" className="px-2 py-1">{t('detail.colCosto')}</th>
                      <th scope="col" className="px-2 py-1">{t('detail.colSubtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-2 py-1 font-mono text-xs">{itemCodigoProveedor(item)}</td>
                        <td className="px-2 py-1">{itemDescripcionProveedor(item)}</td>
                        <td className="px-2 py-1 font-mono">{item.cantidad}</td>
                        <td className="px-2 py-1 font-mono">{formatMoney(item.costoUnitario)}</td>
                        <td className="px-2 py-1 font-mono">{formatMoney(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
                data-testid="compras-btn-pdf"
                disabled={actionLoading}
                onClick={() => void handleDownloadPdf()}
              >
                {t('actions.downloadPdf')}
              </button>
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
                {catalogHint ? (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400" data-testid="compras-catalog-hint">
                    {t('form.catalogMatch', { label: catalogHint })}
                  </p>
                ) : null}
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
                  const articulo = articulosById[item.articuloId]
                  const qtyConfig = resolveReceiveQuantityConfig(articulo, uomModule)
                  const showUnidadCompraHint = uomModule && qtyConfig.factorConversion !== 1
                  const unidadHintId = `compras-receive-unidad-hint-${item.id}`
                  return (
                    <li key={item.id} className="border-b pb-2">
                      <p className="text-sm font-medium">
                        {t('receive.item')}: {itemCodigoProveedor(item)} — {itemDescripcionProveedor(item)}
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
                        min={qtyConfig.decimalAllowed ? undefined : 1}
                        step={qtyConfig.step}
                        inputMode={qtyConfig.decimalAllowed ? 'decimal' : 'numeric'}
                        max={pending}
                        data-testid={`compras-receive-cantidad-${item.id}`}
                        aria-describedby={showUnidadCompraHint ? unidadHintId : undefined}
                        className="mt-1 w-24 border rounded px-2 py-1 dark:bg-slate-800"
                        value={receiveQty[item.id] ?? ''}
                        onChange={(e) =>
                          setReceiveQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      {showUnidadCompraHint ? (
                        <p
                          id={unidadHintId}
                          data-testid={unidadHintId}
                          className="mt-1 text-xs text-amber-700 dark:text-amber-400"
                        >
                          {t('receive.unidadCompraHint', { factor: qtyConfig.factorConversion })}
                        </p>
                      ) : null}
                      {item.articulo?.controlLote ? (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label htmlFor={`compras-receive-lote-${item.id}`} className="block text-xs mb-1">
                              {t('receive.nroLote')}
                            </label>
                            <input
                              id={`compras-receive-lote-${item.id}`}
                              type="text"
                              required
                              data-testid={`compras-receive-lote-${item.id}`}
                              className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                              value={receiveLote[item.id] ?? ''}
                              onChange={(e) =>
                                setReceiveLote((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label htmlFor={`compras-receive-venc-${item.id}`} className="block text-xs mb-1">
                              {t('receive.fechaVencimiento')}
                            </label>
                            <input
                              id={`compras-receive-venc-${item.id}`}
                              type="date"
                              required
                              data-testid={`compras-receive-venc-${item.id}`}
                              className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                              value={receiveVenc[item.id] ?? ''}
                              onChange={(e) =>
                                setReceiveVenc((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                      ) : null}
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

        <KeyboardHint shortcuts={listShortcuts} className="mt-4" />
      </div>
    </ErrorBoundary>
  )
}
