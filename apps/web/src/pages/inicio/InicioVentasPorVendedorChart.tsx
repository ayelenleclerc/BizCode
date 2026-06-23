import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DashboardVentasBySellerRow } from '@/lib/api'

const PIE_COLORS = ['#4f46e5', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#65a30d', '#be185d']

type Props = {
  rows: DashboardVentasBySellerRow[]
}

export default function InicioVentasPorVendedorChart({ rows }: Props) {
  const { t } = useTranslation('dashboardAnalytics')

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        name: r.username ?? t('noSeller'),
        total: Number.parseFloat(r.total) || 0,
        count: r.count,
      })),
    [rows, t],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('empty')}</p>
  }

  return (
    <section aria-label={t('chartBySellerAria')} data-testid="inicio-chart-by-seller">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {t('chartBySellerTitle')}
      </h3>
      <div className="h-56 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
