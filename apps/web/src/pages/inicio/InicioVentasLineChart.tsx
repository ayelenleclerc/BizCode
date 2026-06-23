import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardVentasSeriesRow } from '@/lib/api'

type Props = {
  rows: DashboardVentasSeriesRow[]
}

export default function InicioVentasLineChart({ rows }: Props) {
  const { t } = useTranslation('dashboardAnalytics')

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        period: r.period,
        total: Number.parseFloat(r.total) || 0,
        count: r.count,
      })),
    [rows],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('empty')}</p>
  }

  return (
    <section aria-label={t('chartSalesAria')} data-testid="inicio-chart-ventas-line">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {t('chartSalesTitle')}
      </h3>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={56} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3 }}
              name={t('total')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
