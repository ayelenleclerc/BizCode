import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardTopArticuloRow } from '@/lib/api'

type Props = {
  rows: DashboardTopArticuloRow[]
}

export default function InicioTopArticulosChart({ rows }: Props) {
  const { t } = useTranslation('dashboardAnalytics')

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        label: `${r.codigo}`,
        descripcion: r.descripcion,
        total: Number.parseFloat(r.total) || 0,
        quantity: r.quantity,
      })),
    [rows],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('empty')}</p>
  }

  return (
    <section aria-label={t('chartTopArticlesAria')} data-testid="inicio-chart-top-articulos">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {t('chartTopArticlesTitle')}
      </h3>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" width={48} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [value ?? 0, t('total')]}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as { descripcion?: string } | undefined
                return row?.descripcion ?? ''
              }}
            />
            <Bar dataKey="total" fill="#0d9488" name={t('total')} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
