import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { usersAPI, visitasAPI } from '@/lib/api'
import type { AppUserDTO, VisitaDiaKpi, VisitaVendedorRow } from '@bizcode/types'
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

export default function VisitasPage() {
  const { t } = useTranslation('visitas')
  const { claims } = useAuth()
  const allowed = canManageVisitas(claims?.permissions)

  const [fecha, setFecha] = useState(todayIsoDate)
  const [vendedorId, setVendedorId] = useState('')
  const [sellers, setSellers] = useState<AppUserDTO[]>([])
  const [rows, setRows] = useState<VisitaVendedorRow[]>([])
  const [kpi, setKpi] = useState<VisitaDiaKpi | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  const [createClienteId, setCreateClienteId] = useState('')
  const [createVendedorId, setCreateVendedorId] = useState('')
  const [createFecha, setCreateFecha] = useState(todayIsoDate)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSaving, setCreateSaving] = useState(false)

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

  const load = useCallback(async () => {
    if (!allowed) return
    const vid = Number.parseInt(vendedorId, 10)
    if (!Number.isInteger(vid) || vid < 1) {
      setRows([])
      setKpi(null)
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      setLoadError(new Error(t('create.errors.fecha')))
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const res = await visitasAPI.list({ fecha, vendedorId: vid })
      setRows(res?.data ?? [])
      setKpi(res?.kpi ?? null)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
      setRows([])
      setKpi(null)
    } finally {
      setLoading(false)
    }
  }, [allowed, fecha, t, vendedorId])

  useEffect(() => {
    if (allowed && vendedorId) {
      void load()
    }
  }, [allowed, load, vendedorId])

  const emptyMessage = useMemo(() => t('empty'), [t])

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
      </div>
    </ErrorBoundary>
  )
}
