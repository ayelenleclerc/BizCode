import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from '@/components/ErrorBoundary'
import { CanAccess } from '@/components/CanAccess'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import LogisticaReportesPanel from './LogisticaReportesPanel'
import {
  ordenesEntregaAPI,
  zonasEntregaAPI,
  type OrdenEntrega,
  type OrdenEntregaEstado,
} from '@/lib/api'

const ESTADOS: OrdenEntregaEstado[] = [
  'pending',
  'picking',
  'ready',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

export default function LogisticaPage() {
  const { claims } = useAuth()
  const { t } = useTranslation('logistica')
  const canRead =
    (claims?.permissions.includes('logistics.read') ?? false) ||
    (claims?.permissions.includes('orders.deliver.confirm') ?? false)

  if (!canRead) {
    return <LogisticaForbidden t={t} />
  }

  return (
    <ErrorBoundary>
      <LogisticaPageContent />
    </ErrorBoundary>
  )
}

function LogisticaForbidden({ t }: { t: (key: string) => string }) {
  return (
    <div className="p-8" data-testid="logistica-forbidden">
      <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
    </div>
  )
}

type LogisticaPageTab = 'ordenes' | 'reportes'

function LogisticaPageContent() {
  const { t } = useTranslation('logistica')
  const { t: tReportes } = useTranslation('logisticaReportes')
  const { t: tRepartos } = useTranslation('repartos')
  const { t: tSeguimiento } = useTranslation('seguimiento')
  const { claims } = useAuth()
  const { hasModule } = useFeatureFlags()
  const [pageTab, setPageTab] = useState<LogisticaPageTab>('ordenes')
  const isDriver = claims?.role === 'driver'
  const canDispatch = claims?.permissions.includes('orders.dispatch') ?? false
  const canDeliver = claims?.permissions.includes('orders.deliver.confirm') ?? false
  const canCreate = claims?.permissions.includes('orders.create') ?? false
  const canPick = claims?.permissions.includes('orders.pick') ?? false
  const showPickingLink = canPick && hasModule('logistics.picking')
  const showReportesTab =
    !isDriver &&
    hasModule('logistics.dispatches') &&
    (claims?.role === 'owner' ||
      claims?.role === 'manager' ||
      claims?.role === 'logistics_planner')
  const showSeguimientoLink =
    !isDriver &&
    hasModule('logistics.gps') &&
    (claims?.role === 'owner' ||
      claims?.role === 'manager' ||
      claims?.role === 'logistics_planner')

  const [fecha, setFecha] = useState(todayIso)
  const [estado, setEstado] = useState<OrdenEntregaEstado | ''>('')
  const [zonaId, setZonaId] = useState('')
  const [ordenes, setOrdenes] = useState<OrdenEntrega[]>([])
  const [zonas, setZonas] = useState<{ id: number; nombre: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formClienteId, setFormClienteId] = useState('')
  const [formFecha, setFormFecha] = useState(todayIso)
  const [formZonaId, setFormZonaId] = useState('')
  const [formDriverId, setFormDriverId] = useState('')
  const [formNota, setFormNota] = useState('')
  const [saving, setSaving] = useState(false)

  const loadZonas = useCallback(async () => {
    if (isDriver) return
    try {
      const data = await zonasEntregaAPI.list()
      setZonas((data ?? []).map((z) => ({ id: z.id, nombre: z.nombre })))
    } catch {
      setZonas([])
    }
  }, [isDriver])

  const loadOrdenes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: {
        fecha?: string
        estado?: OrdenEntregaEstado
        zonaId?: number
      } = { fecha }
      if (estado) params.estado = estado
      if (zonaId) {
        const z = Number.parseInt(zonaId, 10)
        if (Number.isFinite(z) && z > 0) params.zonaId = z
      }
      const res = await ordenesEntregaAPI.list(params)
      setOrdenes(res?.data ?? [])
    } catch {
      setError(t('errors.load'))
      setOrdenes([])
    } finally {
      setLoading(false)
    }
  }, [estado, fecha, t, zonaId])

  useEffect(() => {
    void loadZonas()
  }, [loadZonas])

  useEffect(() => {
    void loadOrdenes()
  }, [loadOrdenes])

  const handleTransition = async (orden: OrdenEntrega, next: OrdenEntregaEstado) => {
    setError(null)
    try {
      await ordenesEntregaAPI.update(orden.id, { estado: next })
      void loadOrdenes()
    } catch {
      setError(t('errors.transition'))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const cid = Number.parseInt(formClienteId, 10)
    if (!Number.isFinite(cid) || cid < 1) return
    setSaving(true)
    setError(null)
    try {
      await ordenesEntregaAPI.create({
        clienteId: cid,
        fecha: formFecha,
        zonaId: formZonaId ? Number.parseInt(formZonaId, 10) : null,
        driverId: formDriverId ? Number.parseInt(formDriverId, 10) : null,
        nota: formNota.trim() || null,
      })
      setShowForm(false)
      void loadOrdenes()
    } catch {
      setError(t('errors.save'))
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = isDriver ? t('driverView.title') : t('title')

  return (
    <div className="p-8 max-w-6xl mx-auto" data-testid="logistica-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
        <div className="flex gap-2 flex-wrap">
          {!isDriver && showPickingLink && (
            <Link
              to="/logistica/picking"
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded inline-flex items-center"
              data-testid="logistica-picking-link"
            >
              {t('linkPicking')}
            </Link>
          )}
          {showSeguimientoLink && (
            <Link
              to="/logistica/seguimiento"
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded inline-flex items-center"
              data-testid="logistica-seguimiento-link"
            >
              {tSeguimiento('title')}
            </Link>
          )}
          {!isDriver && (
            <Link
              to="/logistica/repartos"
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded inline-flex items-center"
              data-testid="logistica-repartos-link"
            >
              {tRepartos('navLink')}
            </Link>
          )}
          {isDriver && canDeliver && (
            <Link
              to="/logistica/repartos/chofer"
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded inline-flex items-center"
              data-testid="logistica-chofer-route-link"
            >
              {t('driverView.routeLink')}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void loadOrdenes()}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded"
            data-testid="logistica-refresh"
          >
            {t('actions.refresh')}
          </button>
          <CanAccess permission="orders.create">
            {!isDriver && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
                data-testid="logistica-new-order"
              >
                {t('actions.newOrder')}
              </button>
            )}
          </CanAccess>
        </div>
      </div>

      {showReportesTab && (
        <div
          className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700"
          role="tablist"
          aria-label={t('tabs.label')}
        >
          <button
            type="button"
            role="tab"
            {...(pageTab === 'ordenes'
              ? { 'aria-selected': 'true' as const }
              : { 'aria-selected': 'false' as const })}
            onClick={() => setPageTab('ordenes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              pageTab === 'ordenes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
            data-testid="logistica-tab-ordenes"
          >
            {t('tabs.ordenes')}
          </button>
          <button
            type="button"
            role="tab"
            {...(pageTab === 'reportes'
              ? { 'aria-selected': 'true' as const }
              : { 'aria-selected': 'false' as const })}
            onClick={() => setPageTab('reportes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              pageTab === 'reportes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
            data-testid="logistica-tab-reportes"
          >
            {tReportes('tab')}
          </button>
        </div>
      )}

      {pageTab === 'reportes' && showReportesTab ? (
        <LogisticaReportesPanel />
      ) : (
        <>
      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-4 mb-6" data-testid="logistica-filters">
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('filters.fecha')}</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            data-testid="logistica-filter-fecha"
          />
        </label>
        {!isDriver && (
          <>
            <label className="text-sm">
              <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('filters.estado')}</span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as OrdenEntregaEstado | '')}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                data-testid="logistica-filter-estado"
              >
                <option value="">{t('filters.allEstados')}</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {t(`estado.${e}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('filters.zona')}</span>
              <select
                value={zonaId}
                onChange={(e) => setZonaId(e.target.value)}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                data-testid="logistica-filter-zona"
              >
                <option value="">{t('filters.allZonas')}</option>
                {zonas.map((z) => (
                  <option key={z.id} value={String(z.id)}>
                    {z.nombre}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">{t('loading')}</p>
      ) : ordenes.length === 0 ? (
        <p className="text-slate-500" data-testid="logistica-empty">
          {t('empty')}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table className="min-w-full text-sm" data-testid="logistica-table">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-left">{t('table.cliente')}</th>
                <th className="px-3 py-2 text-left">{t('table.fecha')}</th>
                <th className="px-3 py-2 text-left">{t('table.estado')}</th>
                {!isDriver && <th className="px-3 py-2 text-left">{t('table.zona')}</th>}
                {!isDriver && <th className="px-3 py-2 text-left">{t('table.driver')}</th>}
                <th className="px-3 py-2 text-left">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">
                    {orden.cliente?.rsocial ?? `#${orden.clienteId}`}
                  </td>
                  <td className="px-3 py-2">{formatDate(orden.fecha)}</td>
                  <td className="px-3 py-2">{t(`estado.${orden.estado}`)}</td>
                  {!isDriver && (
                    <td className="px-3 py-2">{orden.zona?.nombre ?? '—'}</td>
                  )}
                  {!isDriver && (
                    <td className="px-3 py-2">{orden.driver?.username ?? '—'}</td>
                  )}
                  <td className="px-3 py-2 space-x-2">
                    {isDriver && canDeliver && orden.estado === 'in_transit' && (
                      <button
                        type="button"
                        className="text-blue-600 dark:text-blue-400 underline text-xs"
                        onClick={() => void handleTransition(orden, 'delivered')}
                        data-testid={`logistica-confirm-${orden.id}`}
                      >
                        {t('driverView.confirm')}
                      </button>
                    )}
                    {!isDriver && canDispatch && orden.estado === 'assigned' && (
                      <button
                        type="button"
                        className="text-blue-600 dark:text-blue-400 underline text-xs"
                        onClick={() => void handleTransition(orden, 'in_transit')}
                      >
                        {t('actions.assignTransit')}
                      </button>
                    )}
                    {!isDriver && canDeliver && orden.estado === 'in_transit' && (
                      <button
                        type="button"
                        className="text-green-700 dark:text-green-400 underline text-xs"
                        onClick={() => void handleTransition(orden, 'delivered')}
                      >
                        {t('actions.markDelivered')}
                      </button>
                    )}
                    {!isDriver && canDispatch && orden.estado !== 'delivered' && orden.estado !== 'failed' && (
                      <button
                        type="button"
                        className="text-red-600 dark:text-red-400 underline text-xs"
                        onClick={() => void handleTransition(orden, 'failed')}
                      >
                        {t('actions.markFailed')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && canCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logistica-form-title"
          data-testid="logistica-form-dialog"
        >
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md space-y-4"
          >
            <h2 id="logistica-form-title" className="text-lg font-bold">
              {t('form.title')}
            </h2>
            <label className="block text-sm">
              {t('form.clienteId')}
              <input
                type="number"
                min={1}
                required
                value={formClienteId}
                onChange={(e) => setFormClienteId(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                data-testid="logistica-form-cliente-id"
              />
            </label>
            <label className="block text-sm">
              {t('form.fecha')}
              <input
                type="date"
                required
                value={formFecha}
                onChange={(e) => setFormFecha(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
              />
            </label>
            <label className="block text-sm">
              {t('form.zonaId')}
              <input
                type="number"
                min={1}
                value={formZonaId}
                onChange={(e) => setFormZonaId(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
              />
            </label>
            <label className="block text-sm">
              {t('form.driverId')}
              <input
                type="number"
                min={1}
                value={formDriverId}
                onChange={(e) => setFormDriverId(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
              />
            </label>
            <label className="block text-sm">
              {t('form.nota')}
              <textarea
                value={formNota}
                onChange={(e) => setFormNota(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
                rows={2}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded"
                onClick={() => setShowForm(false)}
              >
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
                data-testid="logistica-form-submit"
              >
                {t('form.submit')}
              </button>
            </div>
          </form>
        </div>
      )}
        </>
      )}
    </div>
  )
}
