import type { KeyboardEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type Column = { key: string; label: string }

type Props = {
  loading: boolean
  error: Error | null
  empty: boolean
  columns: Column[]
  rows: Record<string, string | number>[]
  tableTestId: string
  onExportCsv?: () => void
  exportDisabled?: boolean
  children?: ReactNode
  selectedRow?: number
  onRowKeyDown?: (e: KeyboardEvent, index: number) => void
  onRowClick?: (index: number) => void
}

export default function ReportesDataPanel({
  loading,
  error,
  empty,
  columns,
  rows,
  tableTestId,
  onExportCsv,
  exportDisabled,
  children,
  selectedRow,
  onRowKeyDown,
  onRowClick,
}: Props) {
  const { t } = useTranslation('reportes')

  return (
    <AsyncWrapper loading={loading} error={error}>
      {onExportCsv ? (
        <div className="mb-3">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={exportDisabled || loading}
            className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            data-testid="reportes-export-csv"
          >
            {t('exportCsv')}
          </button>
        </div>
      ) : null}
      {children}
      {empty ? (
        <p className="text-slate-600 dark:text-slate-300" data-testid="reportes-empty">
          {t('empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse" data-testid={tableTestId}>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <th key={col.key} scope="col" className="text-left py-2 px-3 font-semibold">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  role="row"
                  tabIndex={onRowKeyDown ? 0 : undefined}
                  {...(selectedRow === idx
                    ? { 'aria-selected': 'true' as const }
                    : onRowKeyDown
                      ? { 'aria-selected': 'false' as const }
                      : {})}
                  onClick={onRowClick ? () => onRowClick(idx) : undefined}
                  onKeyDown={onRowKeyDown ? (e) => onRowKeyDown(e, idx) : undefined}
                  className={`border-b border-slate-100 dark:border-slate-800 ${
                    onRowKeyDown
                      ? `cursor-pointer transition ${
                          selectedRow === idx
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-2 px-3">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AsyncWrapper>
  )
}
