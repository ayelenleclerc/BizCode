import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ordenesTrabajoAPI, type OrdenTrabajoRow } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type DashboardCounts = {
  en_reparacion?: number
  listo?: number
  presupuestado?: number
}

const NEXT_BY_ESTADO: Record<string, { estado: string; labelKey: string } | null> = {
  recibido: { estado: 'diagnosticado', labelKey: 'actions.diagnosticar' },
  diagnosticado: { estado: 'presupuestado', labelKey: 'actions.presupuestar' },
  presupuestado: { estado: 'aprobado', labelKey: 'actions.aprobar' },
  aprobado: { estado: 'en_reparacion', labelKey: 'actions.reparar' },
  en_reparacion: { estado: 'listo', labelKey: 'actions.listo' },
  listo: { estado: 'entregado', labelKey: 'actions.entregar' },
  entregado: null,
  facturado: null,
  cancelado: null,
  sin_reparacion: null,
}

function formatMoney(value: number | string | null | undefined): string {
  if (value == null) return '—'
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatOtNumero(numero: number): string {
  return `OT-${String(numero).padStart(5, '0')}`
}

export default function OrdenesTrabajoPage() {
  const { t } = useTranslation('ordenesTrabajo')
  const [ordenes, setOrdenes] = useState<OrdenTrabajoRow[]>([])
  const [counts, setCounts] = useState<DashboardCounts>({})
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [form, setForm] = useState({
    clienteId: '',
    equipoDescripcion: '',
    sintomaReportado: '',
    equipoNroSerie: '',
    prioridad: 'normal',
    itemTipo: 'mano_de_obra',
    itemDesc: '',
    precioUnit: '',
    cantidad: '1',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await ordenesTrabajoAPI.list(filtroEstado ? { estado: filtroEstado } : undefined)
      setOrdenes(res?.data ?? [])
      setCounts((res?.counts as DashboardCounts) ?? {})
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        clienteId: Number.parseInt(form.clienteId, 10),
        equipoDescripcion: form.equipoDescripcion.trim(),
        sintomaReportado: form.sintomaReportado.trim(),
        equipoNroSerie: form.equipoNroSerie.trim() || null,
        prioridad: form.prioridad,
      }
      if (form.itemDesc.trim() && form.precioUnit) {
        body.items = [
          {
            tipo: form.itemTipo,
            descripcion: form.itemDesc.trim(),
            cantidad: Number.parseFloat(form.cantidad) || 1,
            precioUnit: Number.parseFloat(form.precioUnit),
            articuloId: form.itemTipo === 'repuesto' ? null : null,
          },
        ]
      }
      await ordenesTrabajoAPI.create(body)
      setShowForm(false)
      setForm({
        clienteId: '',
        equipoDescripcion: '',
        sintomaReportado: '',
        equipoNroSerie: '',
        prioridad: 'normal',
        itemTipo: 'mano_de_obra',
        itemDesc: '',
        precioUnit: '',
        cantidad: '1',
      })
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleTransition(row: OrdenTrabajoRow, nextEstado: string): Promise<void> {
    setActionId(row.id)
    try {
      const body: Record<string, unknown> = { estado: nextEstado }
      if (nextEstado === 'presupuestado' && (!row.items || row.items.length === 0)) {
        body.items = [
          {
            tipo: 'mano_de_obra',
            descripcion: row.equipoDescripcion.slice(0, 120),
            cantidad: 1,
            precioUnit: 0,
          },
        ]
      }
      if (nextEstado === 'diagnosticado') {
        body.diagnostico = row.diagnostico ?? 'Diagnóstico registrado'
      }
      await ordenesTrabajoAPI.transition(row.id, body)
      await load()
    } finally {
      setActionId(null)
    }
  }

  async function handleFacturar(row: OrdenTrabajoRow): Promise<void> {
    setActionId(row.id)
    try {
      await ordenesTrabajoAPI.facturar(row.id, { skipArcaCae: true })
      await load()
    } finally {
      setActionId(null)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="ordenes-trabajo-page">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          <CanAccess permission="sales.create">
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-2 text-sm text-white dark:bg-slate-200 dark:text-slate-900"
              data-testid="ot-new-btn"
              onClick={() => setShowForm(true)}
            >
              {t('new')}
            </button>
          </CanAccess>
        </div>

        <div
          className="mb-4 grid gap-3 sm:grid-cols-3"
          data-testid="ot-dashboard"
          aria-label={t('title')}
        >
          <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs uppercase text-slate-500">{t('dashboard.enReparacion')}</p>
            <p className="text-2xl font-semibold" data-testid="ot-count-en-reparacion">
              {counts.en_reparacion ?? 0}
            </p>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs uppercase text-slate-500">{t('dashboard.listas')}</p>
            <p className="text-2xl font-semibold" data-testid="ot-count-listo">
              {counts.listo ?? 0}
            </p>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs uppercase text-slate-500">{t('dashboard.esperando')}</p>
            <p className="text-2xl font-semibold" data-testid="ot-count-presupuestado">
              {counts.presupuestado ?? 0}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mr-2 text-sm" htmlFor="ot-filter-estado">
            {t('columns.estado')}
          </label>
          <select
            id="ot-filter-estado"
            data-testid="ot-filter-estado"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">{t('filterAll')}</option>
            {(
              [
                'recibido',
                'diagnosticado',
                'presupuestado',
                'aprobado',
                'en_reparacion',
                'listo',
                'entregado',
                'facturado',
                'cancelado',
                'sin_reparacion',
              ] as const
            ).map((estado) => (
              <option key={estado} value={estado}>
                {t(`estados.${estado}`)}
              </option>
            ))}
          </select>
        </div>

        {showForm ? (
          <form
            className="mb-6 grid max-w-xl gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
            data-testid="ot-create-form"
            onSubmit={(e) => void handleCreate(e)}
          >
            <label className="grid gap-1 text-sm">
              {t('clienteId')}
              <input
                required
                data-testid="ot-cliente-id"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.clienteId}
                onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('equipoDescripcion')}
              <input
                required
                data-testid="ot-equipo"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.equipoDescripcion}
                onChange={(e) => setForm((f) => ({ ...f, equipoDescripcion: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('sintoma')}
              <input
                required
                data-testid="ot-sintoma"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.sintomaReportado}
                onChange={(e) => setForm((f) => ({ ...f, sintomaReportado: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('nroSerie')}
              <input
                data-testid="ot-serie"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.equipoNroSerie}
                onChange={(e) => setForm((f) => ({ ...f, equipoNroSerie: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('itemDesc')}
              <input
                data-testid="ot-item-desc"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.itemDesc}
                onChange={(e) => setForm((f) => ({ ...f, itemDesc: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('precio')}
              <input
                data-testid="ot-precio"
                type="number"
                min="0"
                step="0.01"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={form.precioUnit}
                onChange={(e) => setForm((f) => ({ ...f, precioUnit: e.target.value }))}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                data-testid="ot-submit"
                className="rounded bg-slate-800 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
              >
                {t('create')}
              </button>
              <button
                type="button"
                data-testid="ot-cancel"
                className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
                onClick={() => setShowForm(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        ) : null}

        <AsyncWrapper loading={loading} error={loadError}>
          {ordenes.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400" data-testid="ot-empty">
              {t('empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" data-testid="ot-table">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                    <th className="px-2 py-2">{t('columns.numero')}</th>
                    <th className="px-2 py-2">{t('columns.cliente')}</th>
                    <th className="px-2 py-2">{t('columns.equipo')}</th>
                    <th className="px-2 py-2">{t('columns.estado')}</th>
                    <th className="px-2 py-2">{t('columns.presupuesto')}</th>
                    <th className="px-2 py-2">{t('columns.garantia')}</th>
                    <th className="px-2 py-2">{t('columns.acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((row) => {
                    const next = NEXT_BY_ESTADO[row.estado]
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                        data-testid={`ot-row-${row.id}`}
                      >
                        <td className="px-2 py-2 font-mono">{formatOtNumero(row.numero)}</td>
                        <td className="px-2 py-2">{row.cliente?.rsocial ?? row.clienteId}</td>
                        <td className="px-2 py-2">{row.equipoDescripcion}</td>
                        <td className="px-2 py-2">{t(`estados.${row.estado}`)}</td>
                        <td className="px-2 py-2">{formatMoney(row.presupuesto)}</td>
                        <td className="px-2 py-2">
                          {row.enGarantia ? t('warrantyYes') : t('warrantyNo')}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-2">
                            <CanAccess permission="sales.create">
                              {next ? (
                                <button
                                  type="button"
                                  disabled={actionId === row.id}
                                  data-testid={`ot-next-${row.id}`}
                                  className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                                  onClick={() => void handleTransition(row, next.estado)}
                                >
                                  {t(next.labelKey)}
                                </button>
                              ) : null}
                              {(row.estado === 'listo' || row.estado === 'entregado') &&
                              !row.enGarantia &&
                              !row.facturaId ? (
                                <button
                                  type="button"
                                  disabled={actionId === row.id}
                                  data-testid={`ot-facturar-${row.id}`}
                                  className="rounded bg-emerald-700 px-2 py-1 text-xs text-white"
                                  onClick={() => void handleFacturar(row)}
                                >
                                  {t('actions.facturar')}
                                </button>
                              ) : null}
                            </CanAccess>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
