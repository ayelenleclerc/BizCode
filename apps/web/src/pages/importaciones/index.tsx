import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { importacionesAPI } from '@/lib/api'
import type {
  BulkImportValidateSummary,
  ImportDuplicateMode,
  ImportEntity,
  ImportJobRow,
  ImportModo,
} from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

const ENTITIES: ImportEntity[] = ['clientes', 'articulos', 'proveedores', 'saldos']

/**
 * @en Unified wizard for bulk Excel/CSV import with dry-run and SSE progress (#238).
 * @es Wizard unificado de importación masiva Excel/CSV con dry-run y progreso SSE (#238).
 * @pt-BR Assistente unificado de importação em massa Excel/CSV com dry-run e progresso SSE (#238).
 */
export default function ImportacionesPage() {
  const { t } = useTranslation('importaciones')
  const [entity, setEntity] = useState<ImportEntity>('clientes')
  const [duplicateMode, setDuplicateMode] = useState<ImportDuplicateMode>('skip')
  const [modo, setModo] = useState<ImportModo>('mejores_esfuerzos')
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<BulkImportValidateSummary | null>(null)
  const [job, setJob] = useState<ImportJobRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const downloadTemplate = async (format: 'csv' | 'xlsx') => {
    setActionError(null)
    try {
      const blob = await importacionesAPI.downloadTemplate(entity, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entity}_import_template.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t('errors.template'))
    }
  }

  const runValidate = async () => {
    if (!file) {
      setActionError(t('errors.fileRequired'))
      return
    }
    setLoading(true)
    setError(null)
    setActionError(null)
    setSummary(null)
    try {
      setSummary(await importacionesAPI.validate({ entity, file, duplicateMode }))
    } catch (e) {
      setError(e instanceof Error ? e : new Error(t('errors.validate')))
    } finally {
      setLoading(false)
    }
  }

  const startImport = async () => {
    if (!file) {
      setActionError(t('errors.fileRequired'))
      return
    }
    setLoading(true)
    setActionError(null)
    try {
      const created = await importacionesAPI.startJob({ entity, file, modo, duplicateMode })
      setJob(created)
      setProgress(0)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t('errors.start'))
    } finally {
      setLoading(false)
    }
  }

  const pollJob = useCallback(async (id: number) => {
    const row = await importacionesAPI.getJob(id)
    setJob(row)
    if (row.totalRows > 0) {
      setProgress(Math.round((row.processedRows / row.totalRows) * 100))
    }
    return row
  }, [])

  useEffect(() => {
    if (!job || job.estado === 'completed' || job.estado === 'failed') return
    const url = `/api/importaciones/jobs/${job.id}/events`
    let es: EventSource | null = null
    let timer: ReturnType<typeof setInterval> | null = null
    try {
      es = new EventSource(url)
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as {
            processedRows?: number
            totalRows?: number
            estado?: string
          }
          if (data.totalRows && data.processedRows != null) {
            setProgress(Math.round((data.processedRows / data.totalRows) * 100))
          }
          if (data.estado === 'completed' || data.estado === 'failed') {
            void pollJob(job.id)
            es?.close()
          }
        } catch {
          /* ignore malformed SSE */
        }
      }
      es.onerror = () => {
        es?.close()
        timer = setInterval(() => {
          void pollJob(job.id).then((row) => {
            if (row.estado === 'completed' || row.estado === 'failed') {
              if (timer) clearInterval(timer)
            }
          })
        }, 1000)
      }
    } catch {
      timer = setInterval(() => {
        void pollJob(job.id).then((row) => {
          if (row.estado === 'completed' || row.estado === 'failed') {
            if (timer) clearInterval(timer)
          }
        })
      }, 1000)
    }
    return () => {
      es?.close()
      if (timer) clearInterval(timer)
    }
  }, [job, pollJob])

  const downloadReport = async () => {
    if (!job) return
    try {
      const blob = await importacionesAPI.downloadReport(job.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `import-job-${job.id}-report.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t('errors.report'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="importaciones-page">
        <header>
          <h1 className="text-xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-slate-600">{t('subtitle')}</p>
        </header>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="importaciones-error">
            {actionError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            {t('entity')}
            <select
              className="mt-1 block rounded border px-2 py-1"
              value={entity}
              onChange={(e) => setEntity(e.target.value as ImportEntity)}
              data-testid="importaciones-entity"
            >
              {ENTITIES.map((en) => (
                <option key={en} value={en}>
                  {t(`entities.${en}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t('duplicateMode')}
            <select
              className="mt-1 block rounded border px-2 py-1"
              value={duplicateMode}
              onChange={(e) => setDuplicateMode(e.target.value as ImportDuplicateMode)}
              data-testid="importaciones-duplicate"
            >
              <option value="skip">{t('duplicateModes.skip')}</option>
              <option value="update">{t('duplicateModes.update')}</option>
            </select>
          </label>
          <label className="text-sm">
            {t('modo')}
            <select
              className="mt-1 block rounded border px-2 py-1"
              value={modo}
              onChange={(e) => setModo(e.target.value as ImportModo)}
              data-testid="importaciones-modo"
            >
              <option value="mejores_esfuerzos">{t('modos.mejores_esfuerzos')}</option>
              <option value="todo_o_nada">{t('modos.todo_o_nada')}</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={() => void downloadTemplate('csv')}
            data-testid="importaciones-template-csv"
          >
            {t('downloadCsv')}
          </button>
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={() => void downloadTemplate('xlsx')}
            data-testid="importaciones-template-xlsx"
          >
            {t('downloadXlsx')}
          </button>
        </div>

        <label className="block text-sm">
          {t('file')}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="mt-1 block"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            data-testid="importaciones-file"
          />
        </label>

        <CanAccess permission="data_import.manage">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-2 text-white"
              onClick={() => void runValidate()}
              data-testid="importaciones-validate"
            >
              {t('validate')}
            </button>
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-2 text-white"
              onClick={() => void startImport()}
              data-testid="importaciones-start"
            >
              {t('start')}
            </button>
          </div>
        </CanAccess>

        <AsyncWrapper loading={loading} error={error}>
          {summary ? (
            <section data-testid="importaciones-summary" className="rounded border p-3 text-sm">
              <h2 className="font-semibold">{t('summaryTitle')}</h2>
              <p>
                {t('summaryLine', {
                  ok: summary.okCount,
                  errors: summary.errorCount,
                  duplicates: summary.duplicateCount,
                  total: summary.totalRows,
                })}
              </p>
              {summary.issues.length > 0 ? (
                <ul className="mt-2 max-h-48 overflow-auto" data-testid="importaciones-issues">
                  {summary.issues.map((issue) => (
                    <li key={`${issue.row}-${issue.code}-${issue.message}`}>
                      {t('issueLine', {
                        row: issue.row,
                        kind: issue.kind,
                        message: issue.message,
                      })}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </AsyncWrapper>

        {job ? (
          <section data-testid="importaciones-job" className="space-y-2 rounded border p-3 text-sm">
            <h2 className="font-semibold">{t('jobTitle', { id: job.id })}</h2>
            <p data-testid="importaciones-job-estado">
              {t('estado')}: {t(`estados.${job.estado}`)}
            </p>
            <div
              className="h-2 w-full overflow-hidden rounded bg-slate-200"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              data-testid="importaciones-progress"
            >
              <div className="h-full bg-slate-800" style={{ width: `${progress}%` }} />
            </div>
            {(job.estado === 'completed' || job.estado === 'failed') && (
              <button
                type="button"
                className="underline"
                onClick={() => void downloadReport()}
                data-testid="importaciones-report"
              >
                {t('downloadReport')}
              </button>
            )}
          </section>
        ) : null}
      </div>
    </ErrorBoundary>
  )
}
