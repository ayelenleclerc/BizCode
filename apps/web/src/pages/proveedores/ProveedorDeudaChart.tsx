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
import type { ProveedorCuentaCorrienteChartPoint } from '@/types'

type Props = {
  serie: ProveedorCuentaCorrienteChartPoint[]
}

/**
 * @en Supplier debt evolution chart (last 6 months, #270).
 * @es Gráfico de evolución de deuda del proveedor (últimos 6 meses, #270).
 * @pt-BR Gráfico de evolução da dívida do fornecedor (últimos 6 meses, #270).
 */
export default function ProveedorDeudaChart({ serie }: Props) {
  const { t } = useTranslation('proveedores')

  const chartData = useMemo(
    () =>
      serie.map((row) => ({
        period: row.period,
        saldo: Number.parseFloat(row.saldo) || 0,
      })),
    [serie],
  )

  if (serie.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('cc.chartEmpty')}</p>
  }

  return (
    <section aria-label={t('cc.chartAria')} data-testid="proveedor-cc-chart">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {t('cc.chartTitle')}
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
              dataKey="saldo"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3 }}
              name={t('cc.saldo')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
