import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReporteVentasRow } from '@/lib/api'

type Props = {
  rows: ReporteVentasRow[]
}

export default function ReportesVentasChart({ rows }: Props) {
  const { t } = useTranslation('reportes')
  const maxTotal = useMemo(
    () => Math.max(1, ...rows.map((r) => Number.parseFloat(r.total) || 0)),
    [rows],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('empty')}</p>
  }

  return (
    <div
      className="flex items-end gap-2 h-40 mt-4"
      role="img"
      aria-label={t('ventas.chartLabel')}
      data-testid="reportes-ventas-chart"
    >
      {rows.map((row) => {
        const value = Number.parseFloat(row.total) || 0
        const heightPct = Math.round((value / maxTotal) * 100)
        return (
          <div key={row.periodo} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="w-full max-w-12 bg-indigo-500 dark:bg-indigo-400 rounded-t"
              style={{ height: `${heightPct}%` }}
              title={`${row.periodo}: ${row.total}`}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full text-center mt-1">
              {row.periodo}
            </span>
          </div>
        )
      })}
    </div>
  )
}
