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
import type { ClienteCuentaCorrienteChartPoint } from '@/types'

type Props = {
  serie: ClienteCuentaCorrienteChartPoint[]
}

/**
 * @en Customer debt evolution chart (last 6 months, #232).
 * @es Gráfico de evolución de deuda del cliente (últimos 6 meses, #232).
 * @pt-BR Gráfico de evolução da dívida do cliente (últimos 6 meses, #232).
 */
export default function ClienteDeudaChart({ serie }: Props) {
  const { t } = useTranslation('clientes')

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
    <section aria-label={t('cc.chartAria')} data-testid="cliente-cc-chart">
      <h3 className="text-sm font-semibold mb-2">{t('cc.chartTitle')}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number' ? value.toFixed(2) : String(value ?? '')
              }
              labelFormatter={(l) => l}
            />
            <Line type="monotone" dataKey="saldo" name={t('cc.saldo')} stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
