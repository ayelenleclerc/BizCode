import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import { recuentosAPI, type Recuento } from '@/lib/api'

type RecuentoEstadoUi = 'in_progress' | 'closed'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function itemDiff(item: Recuento['items'][number]): number | null {
  if (item.cantFisica === null) return null
  return item.cantFisica - item.cantSistema
}

export default function RecuentosPage() {
  const { t } = useTranslation('recuentos')

  return (
    <CanAccess
      permission="inventory.count"
      fallback={
        <div data-testid="recuentos-forbidden">
          <p className="p-8 text-slate-600 dark:text-slate-300">{t('noAccess')}</p>
        </div>
      }
    >
      <RecuentosPageContent />
    </CanAccess>
  )
}

function RecuentosPageContent() {
  const { t } = useTranslation('recuentos')
  const [recuentos, setRecuentos] = useState<Recuento[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [selected, setSelected] = useState<Recuento | null>(null)
  const [physicalQty, setPhysicalQty] = useState<Record<number, string>>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const openRecuento = useMemo(
    () => recuentos.find((r) => r.estado === 'in_progress') ?? null,
    [recuentos],
  )

  const loadList = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await recuentosAPI.list()
      setRecuentos(res?.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const syncPhysicalQty = (row: Recuento) => {
    const qty: Record<number, string> = {}
    for (const item of row.items) {
      qty[item.articuloId] = item.cantFisica === null ? '' : String(item.cantFisica)
    }
    setPhysicalQty(qty)
  }

  const refreshSelected = async (id: number) => {
    const detail = await recuentosAPI.get(id)
    if (detail) {
      setSelected(detail)
      syncPhysicalQty(detail)
    }
  }

  const handleStart = async () => {
    setActionError(null)
    setActionLoading(true)
    try {
      const created = await recuentosAPI.start()
      if (created) {
        await loadList()
        setSelected(created)
        syncPhysicalQty(created)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('RECUENTO_ALREADY_OPEN')) {
        setActionError(t('errors.alreadyOpen'))
      } else {
        setActionError(msg)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveCounts = async () => {
    if (!selected || selected.estado !== 'in_progress') return
    const lines = selected.items
      .map((item) => {
        const raw = physicalQty[item.articuloId] ?? ''
        if (raw.trim() === '') return null
        const cantFisica = Number.parseInt(raw, 10)
        if (!Number.isFinite(cantFisica) || cantFisica < 0) return null
        return { articuloId: item.articuloId, cantFisica }
      })
      .filter((line): line is { articuloId: number; cantFisica: number } => line !== null)
    if (lines.length === 0) return

    setActionError(null)
    setActionLoading(true)
    try {
      const updated = await recuentosAPI.updateItems(selected.id, lines)
      if (updated) {
        setSelected(updated)
        syncPhysicalQty(updated)
        await loadList()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async () => {
    if (!selected || selected.estado !== 'in_progress') return
    const uncounted = selected.items.some((i) => {
      const raw = physicalQty[i.articuloId] ?? ''
      return raw.trim() === '' && i.cantFisica === null
    })
    if (uncounted) {
      setActionError(t('errors.incomplete'))
      return
    }

    setActionError(null)
    setActionLoading(true)
    try {
      await recuentosAPI.updateItems(
        selected.id,
        selected.items.map((item) => {
          const raw = physicalQty[item.articuloId] ?? ''
          const cantFisica =
            raw.trim() !== ''
              ? Number.parseInt(raw, 10)
              : (item.cantFisica ?? Number.NaN)
          return { articuloId: item.articuloId, cantFisica }
        }),
      )
      const closed = await recuentosAPI.close(selected.id)
      if (closed) {
        setSelected(closed)
        await loadList()
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('RECUENTO_ITEMS_INCOMPLETE')) {
        setActionError(t('errors.incomplete'))
      } else {
        setActionError(msg)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handlePdf = async () => {
    if (!selected || selected.estado !== 'closed') return
    setActionLoading(true)
    try {
      const blob = await recuentosAPI.downloadPdf(selected.id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      URL.revokeObjectURL(url)
    } finally {
      setActionLoading(false)
    }
  }

  const countedProgress = selected
    ? {
        counted: selected.items.filter((i) => {
          const raw = physicalQty[i.articuloId] ?? ''
          return raw.trim() !== '' || i.cantFisica !== null
        }).length,
        total: selected.items.length,
      }
    : { counted: 0, total: 0 }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="recuentos-page">
        <header className="mb-6 flex flex-wrap gap-4 items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          {!openRecuento && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              data-testid="recuentos-btn-start"
              disabled={actionLoading}
              onClick={() => void handleStart()}
            >
              {t('actions.start')}
            </button>
          )}
        </header>

        {openRecuento && (
          <p
            className="mb-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            role="status"
            aria-live="polite"
            data-testid="recuentos-stock-blocked"
          >
            {t('stockBlocked')}
          </p>
        )}

        {actionError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert" data-testid="recuentos-action-error">
            {actionError}
          </p>
        )}

        <AsyncWrapper loading={loading} error={loadError}>
          {recuentos.length === 0 ? (
            <p data-testid="recuentos-empty">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="recuentos-table">
                <caption className="sr-only">{t('title')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th scope="col" className="py-2 pr-2">{t('columns.id')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.fecha')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.operador')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.estado')}</th>
                    <th scope="col" className="py-2 pr-2">{t('columns.items')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recuentos.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer ${
                        selected?.id === r.id ? 'bg-blue-50 dark:bg-slate-800' : ''
                      }`}
                      data-testid={`recuentos-row-${r.id}`}
                      onClick={() => {
                        void refreshSelected(r.id)
                      }}
                    >
                      <td className="py-2 pr-2 font-mono">#{r.id}</td>
                      <td className="py-2 pr-2">{formatDate(r.fecha)}</td>
                      <td className="py-2 pr-2">{r.operador?.username ?? r.operadorId}</td>
                      <td className="py-2 pr-2">{t(`estado.${r.estado as RecuentoEstadoUi}`)}</td>
                      <td className="py-2 pr-2">{r.items.length}</td>
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
            data-testid="recuentos-detail"
          >
            <h2 className="font-semibold mb-1">{t('detail.title', { id: selected.id })}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {t('columns.estado')}: {t(`estado.${selected.estado as RecuentoEstadoUi}`)}
              {selected.estado === 'in_progress' && (
                <>
                  {' '}
                  — {t('detail.progress', countedProgress)}
                </>
              )}
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm" data-testid="recuentos-items-table">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th scope="col" className="py-2 pr-2">{t('detail.codigo')}</th>
                    <th scope="col" className="py-2 pr-2">{t('detail.descripcion')}</th>
                    <th scope="col" className="py-2 pr-2">{t('detail.sistema')}</th>
                    <th scope="col" className="py-2 pr-2">{t('detail.fisico')}</th>
                    <th scope="col" className="py-2 pr-2">{t('detail.diff')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item) => {
                    const diff = itemDiff(item)
                    const editable = selected.estado === 'in_progress'
                    return (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-2 font-mono">{item.articulo?.codigo ?? item.articuloId}</td>
                        <td className="py-2 pr-2">{item.articulo?.descripcion ?? '—'}</td>
                        <td className="py-2 pr-2 font-mono">{item.cantSistema}</td>
                        <td className="py-2 pr-2">
                          {editable ? (
                            <label className="sr-only" htmlFor={`recuento-qty-${item.articuloId}`}>
                              {t('detail.fisico')} {item.articulo?.descripcion}
                            </label>
                          ) : null}
                          {editable ? (
                            <input
                              id={`recuento-qty-${item.articuloId}`}
                              type="number"
                              min={0}
                              className="w-24 border rounded px-2 py-1 dark:bg-slate-800"
                              data-testid={`recuentos-qty-${item.articuloId}`}
                              value={physicalQty[item.articuloId] ?? ''}
                              onChange={(e) =>
                                setPhysicalQty((prev) => ({
                                  ...prev,
                                  [item.articuloId]: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="font-mono">{item.cantFisica ?? t('detail.pending')}</span>
                          )}
                        </td>
                        <td className="py-2 pr-2 font-mono">
                          {diff === null ? t('detail.pending') : diff}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.estado === 'in_progress' && (
                <>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                    data-testid="recuentos-btn-save"
                    disabled={actionLoading}
                    onClick={() => void handleSaveCounts()}
                  >
                    {t('actions.saveCounts')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
                    data-testid="recuentos-btn-close"
                    disabled={actionLoading}
                    onClick={() => void handleClose()}
                  >
                    {t('actions.close')}
                  </button>
                </>
              )}
              {selected.estado === 'closed' && (
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
                  data-testid="recuentos-btn-pdf"
                  disabled={actionLoading}
                  onClick={() => void handlePdf()}
                >
                  {t('actions.pdf')}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </ErrorBoundary>
  )
}
