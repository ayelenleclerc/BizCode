import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import KeyboardHint from '@/components/shared/KeyboardHint'
import { useListKeyboardNav } from '@/hooks/useListPageKeyboard'
import { useAuth } from '@/contexts/AuthContext'
import { ordenesEntregaAPI, type OrdenEntrega, type OrdenEntregaLineItem } from '@/lib/api'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString()
}

function sortQueue(ordenes: OrdenEntrega[]): OrdenEntrega[] {
  return [...ordenes].sort((a, b) => {
    const zoneA = a.zona?.nombre ?? ''
    const zoneB = b.zona?.nombre ?? ''
    if (zoneA !== zoneB) return zoneA.localeCompare(zoneB)
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })
}

export default function PickingPage() {
  const { t } = useTranslation('picking')

  return (
    <CanAccess
      permission="orders.pick"
      fallback={
        <div className="p-8" data-testid="picking-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <ErrorBoundary>
        <PickingPageContent />
      </ErrorBoundary>
    </CanAccess>
  )
}

function PickingPageContent() {
  const { t } = useTranslation('picking')
  const { t: tc } = useTranslation('common')
  const { t: tLog } = useTranslation('logistica')
  const listShortcuts = useMemo(
    () => [
      { key: '↑↓', description: tc('shortcuts.navigate') },
      { key: 'Enter', description: tc('shortcuts.open') },
    ],
    [tc],
  )
  const { claims } = useAuth()
  const isLead = claims?.role === 'warehouse_lead' || (claims?.permissions.includes('orders.dispatch') ?? false)

  const [pendingQueue, setPendingQueue] = useState<OrdenEntrega[]>([])
  const [readyQueue, setReadyQueue] = useState<OrdenEntrega[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const [activeOrden, setActiveOrden] = useState<OrdenEntrega | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const sortedPending = useMemo(() => sortQueue(pendingQueue), [pendingQueue])

  useEffect(() => {
    setSelectedRow(0)
  }, [sortedPending])

  const loadQueues = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [pendingRes, readyRes] = await Promise.all([
        ordenesEntregaAPI.list({ estado: 'pending', limit: 200 }),
        isLead ? ordenesEntregaAPI.list({ estado: 'ready', limit: 200 }) : Promise.resolve(undefined),
      ])
      setPendingQueue(pendingRes?.data ?? [])
      setReadyQueue(readyRes?.data ?? [])
    } catch {
      setLoadError(t('errors.load'))
      setPendingQueue([])
      setReadyQueue([])
    } finally {
      setLoading(false)
    }
  }, [isLead, t])

  useEffect(() => {
    void loadQueues()
  }, [loadQueues])

  const resetChecklist = useCallback((items: OrdenEntregaLineItem[]) => {
    const next: Record<number, boolean> = {}
    for (const item of items) {
      next[item.id] = false
    }
    setCheckedItems(next)
  }, [])

  const openOrder = useCallback(
    async (orden: OrdenEntrega) => {
      setSelectedId(orden.id)
      setActionError(null)
      if (orden.estado === 'picking' && orden.pickerUserId === claims?.userId) {
        setActiveOrden(orden)
        resetChecklist(orden.items)
        return
      }
      if (orden.estado !== 'pending') {
        setActiveOrden(orden)
        resetChecklist(orden.items)
        return
      }
      setActionLoading(true)
      try {
        const updated = await ordenesEntregaAPI.iniciarPicking(orden.id)
        if (updated) {
          setActiveOrden(updated)
          resetChecklist(updated.items)
          await loadQueues()
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : ''
        setActionError(msg.includes('PICKING_ASSIGNED') ? t('errors.locked') : t('errors.start'))
      } finally {
        setActionLoading(false)
      }
    },
    [claims?.userId, loadQueues, resetChecklist, t],
  )

  const onOpenRow = useCallback(
    (index: number) => {
      const orden = sortedPending[index]
      if (orden) {
        setSelectedId(orden.id)
        void openOrder(orden)
      }
    },
    [openOrder, sortedPending],
  )

  const handleKeyDown = useListKeyboardNav({
    itemCount: sortedPending.length,
    selectedRow,
    setSelectedRow,
    onOpenRow,
  })

  const allItemsChecked = useMemo(() => {
    if (!activeOrden) return false
    if (activeOrden.items.length === 0) return true
    return activeOrden.items.every((item) => checkedItems[item.id] === true)
  }, [activeOrden, checkedItems])

  const handleMarkReady = async () => {
    if (!activeOrden || !allItemsChecked) {
      setActionError(t('errors.checklist'))
      return
    }
    setActionLoading(true)
    setActionError(null)
    try {
      await ordenesEntregaAPI.marcarLista(activeOrden.id)
      setActiveOrden(null)
      setSelectedId(null)
      setCheckedItems({})
      await loadQueues()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setActionError(msg.includes('PICKING_ASSIGNED') ? t('errors.locked') : t('errors.ready'))
    } finally {
      setActionLoading(false)
    }
  }

  const toggleItem = (itemId: number) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  return (
    <div className="p-6" data-testid="picking-page">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
          onClick={() => void loadQueues()}
          disabled={loading}
          data-testid="picking-refresh"
        >
          {tLog('actions.refresh')}
        </button>
      </header>

      {sortedPending.length > 0 && <KeyboardHint shortcuts={listShortcuts} className="mb-4" />}

      {loadError ? (
        <p className="mb-4 text-red-700 dark:text-red-400" role="alert" data-testid="picking-load-error">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="picking-queue-heading" data-testid="picking-queue">
          <h2 id="picking-queue-heading" className="mb-3 text-lg font-medium">
            {t('queue.title')}
          </h2>
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400">{t('queue.loading')}</p>
          ) : sortedPending.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">{t('queue.empty')}</p>
          ) : (
            <ul className="divide-y rounded border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
              {sortedPending.map((orden, idx) => (
                <li key={orden.id}>
                  <button
                    type="button"
                    tabIndex={0}
                    {...(selectedRow === idx
                      ? { 'aria-selected': 'true' as const }
                      : { 'aria-selected': 'false' as const })}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedRow === idx || selectedId === orden.id
                        ? 'bg-blue-600 text-white dark:bg-blue-900'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedRow(idx)
                      setSelectedId(orden.id)
                      void openOrder(orden)
                    }}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    data-testid={`picking-queue-item-${orden.id}`}
                  >
                    <span className="font-medium">{orden.cliente?.rsocial ?? `#${orden.clienteId}`}</span>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                      {orden.zona?.nombre ?? '—'} · {formatDate(orden.fecha)}
                      {orden.zona?.horario ? ` · ${orden.zona.horario}` : ''}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {tLog(`estado.${orden.estado}`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="picking-detail-heading" data-testid="picking-detail">
          <h2 id="picking-detail-heading" className="mb-3 text-lg font-medium">
            {activeOrden ? activeOrden.cliente?.rsocial : t('queue.selectHint')}
          </h2>
          {!activeOrden ? (
            <p className="text-slate-600 dark:text-slate-400">{t('queue.selectHint')}</p>
          ) : (
            <div className="rounded border border-slate-200 p-4 dark:border-slate-700">
              <dl className="mb-4 grid gap-2 text-sm">
                <div>
                  <dt className="font-medium">{t('detail.zona')}</dt>
                  <dd>{activeOrden.zona?.nombre ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('detail.fecha')}</dt>
                  <dd>{formatDate(activeOrden.fecha)}</dd>
                </div>
                {activeOrden.zona?.horario ? (
                  <div>
                    <dt className="font-medium">{t('detail.horario')}</dt>
                    <dd>{activeOrden.zona.horario}</dd>
                  </div>
                ) : null}
                {activeOrden.picker ? (
                  <div>
                    <dt className="font-medium">{t('detail.picker')}</dt>
                    <dd>{activeOrden.picker.username}</dd>
                  </div>
                ) : null}
              </dl>

              {actionError ? (
                <p className="mb-3 text-red-700 dark:text-red-400" role="alert">
                  {actionError}
                </p>
              ) : null}

              {activeOrden.estado === 'picking' || activeOrden.estado === 'pending' ? (
                <>
                  <h3 className="mb-2 font-medium">{t('detail.checklistTitle')}</h3>
                  {activeOrden.items.length === 0 ? (
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t('detail.noItems')}</p>
                  ) : (
                    <ul className="mb-4 space-y-2" data-testid="picking-checklist">
                      {activeOrden.items.map((item) => (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checkedItems[item.id] === true}
                              onChange={() => toggleItem(item.id)}
                              data-testid={`picking-check-${item.id}`}
                            />
                            <span>
                              {item.articulo.descripcion} ({item.articulo.codigo}) × {item.cantidad}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
                    disabled={actionLoading || !allItemsChecked || activeOrden.estado !== 'picking'}
                    onClick={() => void handleMarkReady()}
                    data-testid="picking-mark-ready"
                  >
                    {actionLoading ? t('detail.saving') : t('detail.markReady')}
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {tLog(`estado.${activeOrden.estado}`)}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {isLead ? (
        <section className="mt-8" aria-labelledby="picking-lead-heading" data-testid="picking-lead-ready-panel">
          <h2 id="picking-lead-heading" className="mb-2 text-lg font-medium">
            {t('lead.title')}
          </h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t('lead.hint')}</p>
          {readyQueue.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">{t('lead.empty')}</p>
          ) : (
            <ul className="mb-4 divide-y rounded border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
              {sortQueue(readyQueue).map((orden) => (
                <li key={orden.id} className="px-4 py-2 text-sm">
                  {orden.cliente?.rsocial} — {orden.zona?.nombre ?? '—'} · {formatDate(orden.fecha)}
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/logistica/repartos"
            className="inline-block rounded bg-slate-800 px-4 py-2 text-white dark:bg-slate-200 dark:text-slate-900"
            data-testid="picking-lead-repartos-link"
          >
            {t('lead.cta')}
          </Link>
        </section>
      ) : null}
    </div>
  )
}
