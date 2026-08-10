import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { rutasAPI, usersAPI, visitasAPI, zonasEntregaAPI } from '@/lib/api'
import type {
  AppUserDTO,
  DeliveryZone,
  RutaDiaStats,
  RutaParadaRow,
  RutaVendedorRow,
  VendedorZonaRow,
  VisitaDiaKpi,
  VisitaVendedorRow,
} from '@bizcode/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function canManageVisitas(permissions: readonly string[] | undefined): boolean {
  if (!permissions) return false
  return (
    permissions.includes('reports.operational.read') || permissions.includes('customers.manage')
  )
}

function canManageZones(permissions: readonly string[] | undefined): boolean {
  return Boolean(permissions?.includes('customers.manage'))
}

export default function VisitasPage() {
  const { t } = useTranslation('visitas')
  const { claims } = useAuth()
  const allowed = canManageVisitas(claims?.permissions)
  const zonesAllowed = canManageZones(claims?.permissions)

  const [fecha, setFecha] = useState(todayIsoDate)
  const [vendedorId, setVendedorId] = useState('')
  const [sellers, setSellers] = useState<AppUserDTO[]>([])
  const [rows, setRows] = useState<VisitaVendedorRow[]>([])
  const [kpi, setKpi] = useState<VisitaDiaKpi | null>(null)
  const [ruta, setRuta] = useState<RutaVendedorRow | null>(null)
  const [rutaStats, setRutaStats] = useState<RutaDiaStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  const [createClienteId, setCreateClienteId] = useState('')
  const [createVendedorId, setCreateVendedorId] = useState('')
  const [createFecha, setCreateFecha] = useState(todayIsoDate)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSaving, setCreateSaving] = useState(false)

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [vendedorZonas, setVendedorZonas] = useState<VendedorZonaRow[]>([])
  const [assignZoneId, setAssignZoneId] = useState('')
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [zoneSaving, setZoneSaving] = useState(false)

  useEffect(() => {
    if (!allowed) return
    void usersAPI
      .list()
      .then((list) => {
        const sellersOnly = (list ?? []).filter(
          (u) => u.role === 'seller' || u.role === 'manager' || u.role === 'owner',
        )
        setSellers(sellersOnly)
        if (sellersOnly.length > 0 && !vendedorId) {
          setVendedorId(String(sellersOnly[0].id))
        }
      })
      .catch(() => {
        setLoadError(new Error(t('usersLoadError')))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load sellers once when allowed
  }, [allowed, t])

  useEffect(() => {
    if (!zonesAllowed) return
    void zonasEntregaAPI
      .list()
      .then((list) => setZones(list ?? []))
      .catch(() => {
        /* zones panel optional */
      })
  }, [zonesAllowed])

  const load = useCallback(async () => {
    if (!allowed) return
    const vid = Number.parseInt(vendedorId, 10)
    if (!Number.isInteger(vid) || vid < 1) {
      setRows([])
      setKpi(null)
      setRuta(null)
      setRutaStats(null)
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      setLoadError(new Error(t('create.errors.fecha')))
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const [visitasRes, rutaRes] = await Promise.all([
        visitasAPI.list({ fecha, vendedorId: vid }),
        rutasAPI.getRuta({ fecha, vendedorId: vid }),
      ])
      setRows(visitasRes?.data ?? [])
      setKpi(visitasRes?.kpi ?? null)
      setRuta(rutaRes)
      if (rutaRes) {
        const st = await rutasAPI.getRutaStats(rutaRes.id)
        setRutaStats(st)
      } else {
        setRutaStats(null)
      }
      if (zonesAllowed) {
        const vz = await rutasAPI.listVendedorZonas({ vendedorId: vid })
        setVendedorZonas(vz.data ?? [])
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
      setRows([])
      setKpi(null)
      setRuta(null)
      setRutaStats(null)
    } finally {
      setLoading(false)
    }
  }, [allowed, fecha, t, vendedorId, zonesAllowed])

  useEffect(() => {
    if (allowed && vendedorId) {
      void load()
    }
  }, [allowed, load, vendedorId])

  useEffect(() => {
    if (!allowed || !vendedorId || !ruta?.id) return
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const vid = Number.parseInt(vendedorId, 10)
          const rutaRes = await rutasAPI.getRuta({ fecha, vendedorId: vid })
          setRuta(rutaRes)
          if (rutaRes) {
            setRutaStats(await rutasAPI.getRutaStats(rutaRes.id))
          } else {
            setRutaStats(null)
          }
        } catch {
          /* poll soft-fail */
        }
      })()
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [allowed, fecha, ruta?.id, vendedorId])

  const emptyMessage = useMemo(() => t('empty'), [t])
  const paradas: RutaParadaRow[] = ruta?.paradas ?? []

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setCreateError(null)
    const clienteId = Number.parseInt(createClienteId, 10)
    const vid = Number.parseInt(createVendedorId || vendedorId, 10)
    if (!Number.isInteger(clienteId) || clienteId < 1) {
      setCreateError(t('create.errors.clienteId'))
      return
    }
    if (!Number.isInteger(vid) || vid < 1) {
      setCreateError(t('create.errors.vendedorId'))
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(createFecha)) {
      setCreateError(t('create.errors.fecha'))
      return
    }
    setCreateSaving(true)
    try {
      await visitasAPI.create({
        clienteId,
        vendedorId: vid,
        fechaPlanificada: createFecha,
      })
      setCreateClienteId('')
      if (createFecha === fecha && String(vid) === vendedorId) {
        await load()
      } else {
        setFecha(createFecha)
        setVendedorId(String(vid))
      }
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : t('create.errors.generic'))
    } finally {
      setCreateSaving(false)
    }
  }

  async function handleAssignZone(event: FormEvent): Promise<void> {
    event.preventDefault()
    setZoneError(null)
    const vid = Number.parseInt(vendedorId, 10)
    const zid = Number.parseInt(assignZoneId, 10)
    if (!Number.isInteger(vid) || vid < 1 || !Number.isInteger(zid) || zid < 1) {
      setZoneError(t('zones.errors.invalid'))
      return
    }
    setZoneSaving(true)
    try {
      await rutasAPI.createVendedorZona({ vendedorId: vid, deliveryZoneId: zid })
      setAssignZoneId('')
      const vz = await rutasAPI.listVendedorZonas({ vendedorId: vid })
      setVendedorZonas(vz.data ?? [])
    } catch (error) {
      setZoneError(error instanceof Error ? error.message : t('zones.errors.generic'))
    } finally {
      setZoneSaving(false)
    }
  }

  async function handleDeleteZone(id: number): Promise<void> {
    setZoneSaving(true)
    setZoneError(null)
    try {
      await rutasAPI.deleteVendedorZona(id)
      setVendedorZonas((prev) => prev.filter((z) => z.id !== id))
    } catch (error) {
      setZoneError(error instanceof Error ? error.message : t('zones.errors.generic'))
    } finally {
      setZoneSaving(false)
    }
  }

  if (!allowed) {
    return (
      <div className="p-6" data-testid="visitas-page-forbidden">
        <h1 className="text-2xl font-semibold mb-2">{t('title')}</h1>
        <p role="alert">{t('forbidden')}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="visitas-page">
        <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>

        <form
          className="flex flex-wrap gap-3 items-end mb-6"
          onSubmit={(e) => {
            e.preventDefault()
            void load()
          }}
          data-testid="visitas-filters"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('filters.fecha')}</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border rounded px-2 py-1 bg-transparent"
              data-testid="visitas-filter-fecha"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('filters.vendedor')}</span>
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="border rounded px-2 py-1 bg-transparent min-w-[12rem]"
              data-testid="visitas-filter-vendedor"
              aria-label={t('filters.vendedor')}
            >
              <option value="">{t('selectVendedor')}</option>
              {sellers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} (#{u.id})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="px-3 py-2 rounded bg-blue-600 text-white"
            data-testid="visitas-filter-load"
          >
            {t('filters.load')}
          </button>
        </form>

        <section
          className="mb-8 rounded border border-slate-700 p-4"
          data-testid="visitas-ruta-panel"
          aria-label={t('ruta.title')}
        >
          <h2 className="text-lg font-medium mb-2">{t('ruta.title')}</h2>
          <p className="text-sm text-slate-400 mb-3">{t('ruta.pollingHint')}</p>
          {rutaStats ? (
            <div
              className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4"
              data-testid="visitas-ruta-stats"
            >
              <div className="rounded border border-slate-700 p-3">
                <div className="text-sm text-slate-400">{t('ruta.total')}</div>
                <div className="text-xl font-semibold">{rutaStats.total}</div>
              </div>
              <div className="rounded border border-slate-700 p-3">
                <div className="text-sm text-slate-400">{t('ruta.pendientes')}</div>
                <div className="text-xl font-semibold">{rutaStats.pendientes}</div>
              </div>
              <div className="rounded border border-slate-700 p-3">
                <div className="text-sm text-slate-400">{t('ruta.visitados')}</div>
                <div className="text-xl font-semibold">{rutaStats.visitados}</div>
              </div>
              <div className="rounded border border-slate-700 p-3">
                <div className="text-sm text-slate-400">{t('ruta.postergados')}</div>
                <div className="text-xl font-semibold">{rutaStats.postergados}</div>
              </div>
              <div className="rounded border border-slate-700 p-3">
                <div className="text-sm text-slate-400">{t('ruta.conversion')}</div>
                <div className="text-xl font-semibold">{rutaStats.conversionPct}%</div>
              </div>
            </div>
          ) : (
            <p className="mb-3" data-testid="visitas-ruta-empty">
              {t('ruta.empty')}
            </p>
          )}
          {paradas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="visitas-ruta-table">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="py-2 pr-3">{t('columns.orden')}</th>
                    <th className="py-2 pr-3">{t('columns.cliente')}</th>
                    <th className="py-2 pr-3">{t('columns.estado')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paradas.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800" data-testid={`ruta-parada-${p.id}`}>
                      <td className="py-2 pr-3">{p.orden}</td>
                      <td className="py-2 pr-3">{p.cliente?.rsocial ?? `#${p.clienteId}`}</td>
                      <td className="py-2 pr-3">{t(`ruta.estado.${p.estado}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {kpi != null && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
            data-testid="visitas-kpi"
            role="region"
            aria-label={t('title')}
          >
            <div className="rounded border border-slate-700 p-3">
              <div className="text-sm text-slate-400">{t('kpi.planificadas')}</div>
              <div className="text-xl font-semibold">{kpi.planificadas}</div>
            </div>
            <div className="rounded border border-slate-700 p-3">
              <div className="text-sm text-slate-400">{t('kpi.visitados')}</div>
              <div className="text-xl font-semibold">{kpi.visitados}</div>
            </div>
            <div className="rounded border border-slate-700 p-3">
              <div className="text-sm text-slate-400">{t('kpi.pedidos')}</div>
              <div className="text-xl font-semibold">{kpi.pedidos}</div>
            </div>
            <div className="rounded border border-slate-700 p-3">
              <div className="text-sm text-slate-400">{t('kpi.conversion')}</div>
              <div className="text-xl font-semibold">{kpi.conversionPct}%</div>
            </div>
          </div>
        )}

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="visitas-empty">{emptyMessage}</p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse" data-testid="visitas-table">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="py-2 pr-3">{t('columns.orden')}</th>
                    <th className="py-2 pr-3">{t('columns.cliente')}</th>
                    <th className="py-2 pr-3">{t('columns.domicilio')}</th>
                    <th className="py-2 pr-3">{t('columns.estado')}</th>
                    <th className="py-2 pr-3">{t('columns.resultado')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800"
                      data-testid={`visitas-row-${row.id}`}
                    >
                      <td className="py-2 pr-3">{row.orden}</td>
                      <td className="py-2 pr-3">
                        {row.cliente?.rsocial ?? `#${row.clienteId}`}
                      </td>
                      <td className="py-2 pr-3">{row.cliente?.domicilio ?? '—'}</td>
                      <td className="py-2 pr-3">{t(`estado.${row.estadoPlan}`)}</td>
                      <td className="py-2 pr-3">
                        {row.resultado
                          ? t(`resultado.${row.resultado}`)
                          : t('resultado.none')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>

        <section className="mt-6 border-t border-slate-700 pt-4" data-testid="visitas-create">
          <h2 className="text-lg font-medium mb-3">{t('create.title')}</h2>
          <form className="flex flex-wrap gap-3 items-end" onSubmit={(e) => void handleCreate(e)}>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('create.clienteId')}</span>
              <input
                value={createClienteId}
                onChange={(e) => setCreateClienteId(e.target.value)}
                className="border rounded px-2 py-1 bg-transparent"
                data-testid="visitas-create-cliente"
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('create.vendedorId')}</span>
              <select
                value={createVendedorId || vendedorId}
                onChange={(e) => setCreateVendedorId(e.target.value)}
                className="border rounded px-2 py-1 bg-transparent min-w-[12rem]"
                data-testid="visitas-create-vendedor"
              >
                {sellers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (#{u.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('create.fecha')}</span>
              <input
                type="date"
                value={createFecha}
                onChange={(e) => setCreateFecha(e.target.value)}
                className="border rounded px-2 py-1 bg-transparent"
                data-testid="visitas-create-fecha"
              />
            </label>
            <button
              type="submit"
              disabled={createSaving}
              className="px-3 py-2 rounded bg-green-700 text-white disabled:opacity-50"
              data-testid="visitas-create-submit"
            >
              {t('create.submit')}
            </button>
          </form>
          {createError ? (
            <p className="text-red-500 mt-2" role="alert" data-testid="visitas-create-error">
              {createError}
            </p>
          ) : null}
        </section>

        {zonesAllowed ? (
          <section className="mt-8 border-t border-slate-700 pt-4" data-testid="visitas-zones">
            <h2 className="text-lg font-medium mb-3">{t('zones.title')}</h2>
            <ul className="mb-4 space-y-2" data-testid="visitas-zones-list">
              {vendedorZonas.length === 0 ? (
                <li>{t('zones.empty')}</li>
              ) : (
                vendedorZonas.map((z) => (
                  <li key={z.id} className="flex items-center gap-3" data-testid={`visitas-zone-${z.id}`}>
                    <span>{z.deliveryZone?.nombre ?? `#${z.deliveryZoneId}`}</span>
                    <button
                      type="button"
                      className="text-sm text-red-400"
                      disabled={zoneSaving}
                      onClick={() => void handleDeleteZone(z.id)}
                      data-testid={`visitas-zone-delete-${z.id}`}
                    >
                      {t('zones.delete')}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <form className="flex flex-wrap gap-3 items-end" onSubmit={(e) => void handleAssignZone(e)}>
              <label className="flex flex-col gap-1 text-sm">
                <span>{t('zones.zone')}</span>
                <select
                  value={assignZoneId}
                  onChange={(e) => setAssignZoneId(e.target.value)}
                  className="border rounded px-2 py-1 bg-transparent min-w-[12rem]"
                  data-testid="visitas-zone-select"
                >
                  <option value="">{t('zones.select')}</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={zoneSaving}
                className="px-3 py-2 rounded bg-indigo-700 text-white disabled:opacity-50"
                data-testid="visitas-zone-assign"
              >
                {t('zones.assign')}
              </button>
            </form>
            {zoneError ? (
              <p className="text-red-500 mt-2" role="alert" data-testid="visitas-zone-error">
                {zoneError}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </ErrorBoundary>
  )
}
