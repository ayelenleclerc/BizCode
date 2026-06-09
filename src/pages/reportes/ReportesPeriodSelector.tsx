import { useTranslation } from 'react-i18next'
import type { ReportesPreset } from './reportesDatePresets'

type Props = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPreset: (preset: ReportesPreset) => void
  showAgrupar?: boolean
  agrupar?: 'dia' | 'semana' | 'mes'
  onAgruparChange?: (value: 'dia' | 'semana' | 'mes') => void
}

export default function ReportesPeriodSelector({
  from,
  to,
  onFromChange,
  onToChange,
  onPreset,
  showAgrupar,
  agrupar,
  onAgruparChange,
}: Props) {
  const { t } = useTranslation('reportes')

  return (
    <fieldset className="flex flex-wrap gap-4 items-end border-0 p-0 m-0 mb-4">
      <legend className="sr-only">{t('period.legend')}</legend>
      <div className="flex flex-col gap-1">
        <label htmlFor="reportes-from" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('period.from')}
        </label>
        <input
          id="reportes-from"
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-800"
          data-testid="reportes-from"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="reportes-to" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('period.to')}
        </label>
        <input
          id="reportes-to"
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-800"
          data-testid="reportes-to"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('period.presets')}>
        {(['today', 'week', 'month', 'quarter'] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onPreset(preset)}
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {t(`period.preset.${preset}`)}
          </button>
        ))}
      </div>
      {showAgrupar && agrupar && onAgruparChange ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="reportes-agrupar" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('period.agrupar')}
          </label>
          <select
            id="reportes-agrupar"
            value={agrupar}
            onChange={(e) => onAgruparChange(e.target.value as 'dia' | 'semana' | 'mes')}
            className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-800"
            data-testid="reportes-agrupar"
          >
            <option value="dia">{t('period.agruparDia')}</option>
            <option value="semana">{t('period.agruparSemana')}</option>
            <option value="mes">{t('period.agruparMes')}</option>
          </select>
        </div>
      ) : null}
    </fieldset>
  )
}
