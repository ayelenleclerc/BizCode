import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  dashboardAPI,
  usersAPI,
  zonasEntregaAPI,
  type AppUserDTO,
  type DashboardVentasGroupBy,
  type DashboardVentasHistoricoDTO,
} from '@/lib/api'
import type { DeliveryZone } from '@/types'
import { downloadCsvBlob } from '@/pages/reportes/reportesExport'
import { resolveInicioAnalyticsPreset } from './inicioDatePresets'
import InicioTopArticulosChart from './InicioTopArticulosChart'
import InicioVentasLineChart from './InicioVentasLineChart'
import InicioVentasPorVendedorChart from './InicioVentasPorVendedorChart'

export default function InicioAnalyticsTab() {
  const { t } = useTranslation(['dashboardAnalytics', 'common'])
  const initial = resolveInicioAnalyticsPreset('days30')

  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [groupBy, setGroupBy] = useState<DashboardVentasGroupBy>('day')
  const [vendedorId, setVendedorId] = useState('')
  const [deliveryZoneId, setDeliveryZoneId] = useState('')

  const [users, setUsers] = useState<AppUserDTO[]>([])
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [data, setData] = useState<DashboardVentasHistoricoDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void Promise.all([usersAPI.list(), zonasEntregaAPI.list()])
      .then(([userRows, zoneRows]) => {
        if (!cancelled) {
          setUsers(userRows ?? [])
          setZones(zoneRows ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([])
          setZones([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const buildParams = useCallback(() => {
    const params = { from, to, groupBy }
    const vid = vendedorId ? Number.parseInt(vendedorId, 10) : undefined
    const zid = deliveryZoneId ? Number.parseInt(deliveryZoneId, 10) : undefined
    return {
      ...params,
      ...(vid != null && Number.isFinite(vid) && vid > 0 ? { vendedorId: vid } : {}),
      ...(zid != null && Number.isFinite(zid) && zid > 0 ? { deliveryZoneId: zid } : {}),
    }
  }, [deliveryZoneId, from, groupBy, to, vendedorId])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardAPI.ventasHistorico(buildParams())
      setData(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load on tab mount
  }, [])

  const applyPreset = (preset: 'days30' | 'days90' | 'days365') => {
    const range = resolveInicioAnalyticsPreset(preset)
    setFrom(range.from)
    setTo(range.to)
  }

  const exportCsv = async () => {
    try {
      const blob = await dashboardAPI.exportVentasHistoricoCsv(buildParams())
      downloadCsvBlob(blob, 'dashboard-ventas-historico.csv')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="space-y-6" data-testid="inicio-analytics-tab">
      <fieldset className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {t('dashboardAnalytics:filtersTitle')}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('dashboardAnalytics:from')}</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              data-testid="inicio-analytics-from"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('dashboardAnalytics:to')}</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              data-testid="inicio-analytics-to"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('dashboardAnalytics:groupBy')}</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as DashboardVentasGroupBy)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              data-testid="inicio-analytics-groupby"
            >
              <option value="day">{t('dashboardAnalytics:groupBy_day')}</option>
              <option value="week">{t('dashboardAnalytics:groupBy_week')}</option>
              <option value="month">{t('dashboardAnalytics:groupBy_month')}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t('dashboardAnalytics:vendedor')}</span>
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              data-testid="inicio-analytics-vendedor"
            >
              <option value="">{t('dashboardAnalytics:vendedorAll')}</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.username}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span>{t('dashboardAnalytics:deliveryZone')}</span>
            <select
              value={deliveryZoneId}
              onChange={(e) => setDeliveryZoneId(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
              data-testid="inicio-analytics-zone"
            >
              <option value="">{t('dashboardAnalytics:zoneAll')}</option>
              {zones.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm"
            onClick={() => applyPreset('days30')}
            data-testid="inicio-preset-30"
          >
            {t('dashboardAnalytics:preset30')}
          </button>
          <button
            type="button"
            className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm"
            onClick={() => applyPreset('days90')}
            data-testid="inicio-preset-90"
          >
            {t('dashboardAnalytics:preset90')}
          </button>
          <button
            type="button"
            className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm"
            onClick={() => applyPreset('days365')}
            data-testid="inicio-preset-365"
          >
            {t('dashboardAnalytics:preset365')}
          </button>
          <button
            type="button"
            className="rounded bg-indigo-600 text-white px-3 py-1 text-sm"
            onClick={() => void loadData()}
            data-testid="inicio-analytics-apply"
          >
            {t('dashboardAnalytics:apply')}
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm"
            onClick={() => void exportCsv()}
            data-testid="inicio-analytics-export"
          >
            {t('dashboardAnalytics:exportCsv')}
          </button>
        </div>
      </fieldset>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400" role="status" aria-busy="true">
          {t('common:status.loading')}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-red-600 dark:text-red-400 text-sm" data-testid="inicio-analytics-error">
          {error}
        </p>
      ) : null}

      {!loading && !error && data ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="xl:col-span-2">
            <InicioVentasLineChart rows={data.series} />
          </div>
          <InicioTopArticulosChart rows={data.topArticles} />
          <InicioVentasPorVendedorChart rows={data.bySeller} />
        </div>
      ) : null}
    </div>
  )
}
