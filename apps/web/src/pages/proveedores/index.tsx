import { useState, useEffect, useRef, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, proveedoresAPI, type CsvBulkImportResult, type ProveedorListParams } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import type { Proveedor, ProveedorCategoria } from '@bizcode/types'
import ProveedorForm from '@/pages/proveedores/ProveedorForm'

const CATEGORIAS: ProveedorCategoria[] = ['materia_prima', 'insumos', 'servicios', 'logistica']

export default function ProveedoresPage() {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const listShortcuts = useGlobalListShortcuts()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const [filtroActivo, setFiltroActivo] = useState<'all' | 'true' | 'false'>('all')
  const [filtroCategoria, setFiltroCategoria] = useState<ProveedorCategoria | ''>('')
  const [deactivating, setDeactivating] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<CsvBulkImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const importCloseRef = useRef<HTMLButtonElement>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)

  const loadList = useCallback(async (
    search?: string,
    activoFilter: 'all' | 'true' | 'false' = filtroActivo,
    categoriaFilter: ProveedorCategoria | '' = filtroCategoria,
  ) => {
    setLoading(true)
    setLoadError(null)
    try {
      const params: ProveedorListParams = {}
      const q = search ?? filtro
      if (q) params.q = q
      if (activoFilter === 'true') params.activo = true
      if (activoFilter === 'false') params.activo = false
      if (categoriaFilter) params.categoria = categoriaFilter
      const data = await proveedoresAPI.list(params)
      setProveedores(data || [])
      setSelectedRow(0)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [filtro, filtroActivo, filtroCategoria])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useHotkeys('f2', () => {
    const input = document.getElementById('search-proveedores') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setEditingId(null)
    setShowForm(true)
  })

  useHotkeys('escape', () => {
    if (showImportDialog) setShowImportDialog(false)
    else if (showForm) setShowForm(false)
  })

  useEffect(() => {
    if (showImportDialog) {
      setImportFile(null)
      setImportResult(null)
      setImportError(null)
      importCloseRef.current?.focus()
    }
  }, [showImportDialog])

  const openEditForm = (p: Proveedor) => {
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleDeactivate = async (p: Proveedor) => {
    if (!p.activo) return
    setDeactivating(true)
    try {
      await proveedoresAPI.delete(p.id)
      await loadList(filtro)
    } catch {
      setLoadError(new Error(t('form.errors.deactivateFailed')))
    } finally {
      setDeactivating(false)
    }
  }

  const importErrorMessage = (error: unknown): string => {
    if (error instanceof ApiRequestFailedError) {
      if (!error.hasResponse) return t('import.errorNetwork')
      return error.message.trim() || t('import.errorGeneric')
    }
    return t('import.errorGeneric')
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await proveedoresAPI.downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'proveedores_import_template.csv'
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setImportError(importErrorMessage(error))
    }
  }

  const handleSubmitImport = async () => {
    if (!importFile) return
    setImportLoading(true)
    setImportError(null)
    setImportResult(null)
    try {
      const data = await proveedoresAPI.importFromCsv(importFile)
      setImportResult(data)
      await loadList(filtro)
    } catch (error) {
      setImportError(importErrorMessage(error))
    } finally {
      setImportLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFiltro(value)
    if (value.length > 0) loadList(value)
    else loadList()
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, proveedores.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      openEditForm(proveedores[index])
    }
  }

  return (
    <CanAccess
      permission="suppliers.read"
      fallback={
        <div className="p-8">
          <p className="text-slate-700 dark:text-slate-300">{t('noAccess')}</p>
        </div>
      }
    >
      <ErrorBoundary>
      <div className="p-8 h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <input
            id="search-proveedores"
            data-testid="search-proveedores"
            type="text"
            placeholder={t('search.placeholder')}
            value={filtro}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <div>
            <label htmlFor="filtro-proveedor-activo" className="block text-xs text-slate-500 mb-1">
              {t('filters.activo')}
            </label>
            <select
              id="filtro-proveedor-activo"
              data-testid="filtro-proveedor-activo"
              value={filtroActivo}
              onChange={(e) => {
                const v = e.target.value as 'all' | 'true' | 'false'
                setFiltroActivo(v)
                void loadList(filtro, v, filtroCategoria)
              }}
              className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="all">{t('filters.activoAll')}</option>
              <option value="true">{t('filters.activoOnly')}</option>
              <option value="false">{t('filters.inactivoOnly')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="filtro-proveedor-categoria" className="block text-xs text-slate-500 mb-1">
              {t('filters.categoria')}
            </label>
            <select
              id="filtro-proveedor-categoria"
              data-testid="filtro-proveedor-categoria"
              value={filtroCategoria}
              onChange={(e) => {
                const v = e.target.value as ProveedorCategoria | ''
                setFiltroCategoria(v)
                void loadList(filtro, filtroActivo, v)
              }}
              className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="">{t('filters.categoriaAll')}</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {t(`form.categoriaOptions.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <CanAccess permission="suppliers.manage">
            <button
              type="button"
              data-testid="btn-import-proveedores"
              onClick={() => setShowImportDialog(true)}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
            >
              {t('import.button')}
            </button>
          </CanAccess>
          <CanAccess permission="suppliers.manage">
            <button
              type="button"
              data-testid="btn-nuevo-proveedor"
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              {tc('actions.new')} (F3)
            </button>
          </CanAccess>
        </div>

        <div className="flex-1 overflow-auto">
          <AsyncWrapper loading={loading} error={loadError}>
          {proveedores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('empty')}</div>
          ) : (
            <table
              ref={tableRef}
              aria-label={t('title')}
              className="w-full border-collapse bg-white dark:bg-slate-800 rounded overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.codigo')}</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.rsocial')}</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.cuit')}</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.condIva')}</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.telef')}</th>
                  <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.activo')}</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p, idx) => (
                  <tr
                    key={p.id}
                    role="row"
                    {...(selectedRow === idx
                      ? { 'aria-selected': 'true' as const }
                      : { 'aria-selected': 'false' as const })}
                    onClick={() => setSelectedRow(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    tabIndex={0}
                    className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                      selectedRow === idx
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">{p.codigo}</td>
                    <td className="px-4 py-3">{p.rsocial}</td>
                    <td className="px-4 py-3 font-mono text-sm">{p.cuit || '-'}</td>
                    <td className="px-4 py-3">{p.condIva}</td>
                    <td className="px-4 py-3">{p.telef || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        data-testid={p.activo ? 'proveedor-badge-activo' : 'proveedor-badge-inactivo'}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          p.activo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.activo ? tc('status.active') : tc('status.inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </AsyncWrapper>
        </div>

        {proveedores[selectedRow] && (
          <CanAccess permission="suppliers.manage">
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                data-testid="btn-editar-proveedor"
                className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                onClick={() => openEditForm(proveedores[selectedRow])}
              >
                {t('actions.edit')}
              </button>
              {proveedores[selectedRow].activo ? (
                <button
                  type="button"
                  data-testid="btn-desactivar-proveedor"
                  disabled={deactivating}
                  className="px-4 py-2 rounded border border-red-300 text-red-700 dark:border-red-800 dark:text-red-300 disabled:opacity-50"
                  onClick={() => void handleDeactivate(proveedores[selectedRow])}
                >
                  {t('actions.deactivate')}
                </button>
              ) : null}
            </div>
          </CanAccess>
        )}

        <KeyboardHint shortcuts={listShortcuts} className="mt-4" />

        {showForm ? (
          <ProveedorForm
            proveedorId={editingId}
            onClose={() => setShowForm(false)}
            onSaved={() => void loadList(filtro)}
          />
        ) : null}

        {showImportDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 h-full w-full bg-black/50"
              aria-label={t('import.close')}
              onClick={() => setShowImportDialog(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="proveedores-import-title"
              data-testid="dialog-import-proveedores"
              className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-xl text-slate-900 dark:text-slate-100"
            >
              <h2 id="proveedores-import-title" className="text-xl font-semibold mb-2">
                {t('import.title')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('import.description')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('import.hintFormat')}</p>
              <div className="flex flex-col gap-3 mb-4">
                <button
                  type="button"
                  data-testid="btn-download-proveedor-template"
                  className="text-left text-blue-600 dark:text-blue-400 underline"
                  onClick={() => void handleDownloadTemplate()}
                >
                  {t('import.downloadTemplate')}
                </button>
                <div>
                  <input
                    ref={importFileInputRef}
                    data-testid="input-import-proveedor-csv"
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    aria-label={t('import.chooseFile')}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setImportFile(f)
                      setImportResult(null)
                      setImportError(null)
                    }}
                  />
                  <button
                    type="button"
                    data-testid="btn-choose-proveedor-import-file"
                    className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => importFileInputRef.current?.click()}
                  >
                    {t('import.chooseFile')}
                  </button>
                  {importFile ? (
                    <span className="ml-2 text-sm" data-testid="import-proveedor-file-name">
                      {importFile.name}
                    </span>
                  ) : null}
                </div>
              </div>
              {importError ? (
                <div
                  role="alert"
                  data-testid="import-proveedor-error-banner"
                  className="mb-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200"
                >
                  {importError}
                </div>
              ) : null}
              {importLoading ? (
                <p className="mb-4 text-sm" data-testid="import-proveedor-loading">
                  {t('import.loading')}
                </p>
              ) : null}
              {importResult ? (
                <div className="mb-4 space-y-3" data-testid="import-proveedor-result">
                  <p className="text-sm font-medium">
                    {t('import.successSummary', {
                      created: importResult.created,
                      skipped: importResult.skipped,
                    })}
                  </p>
                  {importResult.errors.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('import.errorsHeading')}</p>
                      <table
                        className="w-full text-sm border border-slate-200 dark:border-slate-600"
                        data-testid="import-proveedor-errors-table"
                      >
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-700">
                            <th className="text-left px-2 py-1">{t('import.row')}</th>
                            <th className="text-left px-2 py-1">{t('import.message')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.errors.map((err, i) => (
                            <tr key={`${err.row}-${i}`} className="border-t border-slate-200 dark:border-slate-600">
                              <td className="px-2 py-1">{err.row}</td>
                              <td className="px-2 py-1">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  ref={importCloseRef}
                  data-testid="btn-import-proveedor-close"
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                  onClick={() => setShowImportDialog(false)}
                >
                  {t('import.close')}
                </button>
                <button
                  type="button"
                  data-testid="btn-submit-proveedor-import"
                  disabled={!importFile || importLoading}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => void handleSubmitImport()}
                >
                  {t('import.submit')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      </ErrorBoundary>
    </CanAccess>
  )
}
