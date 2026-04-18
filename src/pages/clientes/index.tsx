import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, clientesAPI, type ClienteImportResult } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import { Cliente } from '@/types'
import ClienteForm from './ClienteForm'

export default function ClientesPage() {
  const { t } = useTranslation('clientes')
  const { t: tc } = useTranslation('common')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ClienteImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const importCloseRef = useRef<HTMLButtonElement>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)

  const loadClientes = async (search?: string) => {
    setLoading(true)
    try {
      const data = await clientesAPI.list(search)
      setClientes(data || [])
      setSelectedRow(0)
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  useHotkeys('f2', () => {
    const input = document.getElementById('search-clientes') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setSelectedCliente(null)
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

  const importErrorMessage = (error: unknown): string => {
    if (error instanceof ApiRequestFailedError) {
      if (!error.hasResponse) return t('import.errorNetwork')
      return error.message.trim() || t('import.errorGeneric')
    }
    return t('import.errorGeneric')
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await clientesAPI.downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'clientes_import_template.csv'
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
      const data = await clientesAPI.importFromCsv(importFile)
      setImportResult(data)
      await loadClientes(filtro)
    } catch (error) {
      setImportError(importErrorMessage(error))
    } finally {
      setImportLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFiltro(value)
    if (value.length > 0) {
      loadClientes(value)
    } else {
      loadClientes()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, clientes.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedCliente(clientes[index])
      setShowForm(true)
    }
  }

  const handleClienteGuardado = async (_cliente: Cliente) => {
    setShowForm(false)
    await loadClientes(filtro)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          id="search-clientes"
          type="text"
          placeholder={t('search.placeholder')}
          value={filtro}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <CanAccess permission="customers.manage">
          <button
            type="button"
            data-testid="btn-import-clientes"
            onClick={() => setShowImportDialog(true)}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
          >
            {t('import.button')}
          </button>
        </CanAccess>
        <button
          data-testid="btn-nuevo-cliente"
          onClick={() => {
            setSelectedCliente(null)
            setShowForm(true)
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          ➕ {tc('actions.new')} (F3)
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{tc('status.loading')}</div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('empty')}</div>
        ) : (
          <table
            ref={tableRef}
            data-testid="clientes-table"
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
              {clientes.map((cliente, idx) => (
                <tr
                  key={cliente.id}
                  role="row"
                  aria-selected={selectedRow === idx}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{cliente.codigo}</td>
                  <td className="px-4 py-3">{cliente.rsocial}</td>
                  <td className="px-4 py-3 font-mono text-sm">{cliente.cuit || '-'}</td>
                  <td className="px-4 py-3">{cliente.condIva}</td>
                  <td className="px-4 py-3">{cliente.telef || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {cliente.activo ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ClienteForm
          cliente={selectedCliente}
          onClose={() => setShowForm(false)}
          onGuardado={handleClienteGuardado}
        />
      )}

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
            aria-labelledby="clientes-import-title"
            data-testid="dialog-import-clientes"
            className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-xl text-slate-900 dark:text-slate-100"
          >
            <h2 id="clientes-import-title" className="text-xl font-semibold mb-2">
              {t('import.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('import.description')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('import.hintFormat')}</p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                type="button"
                data-testid="btn-download-template"
                className="text-left text-blue-600 dark:text-blue-400 underline"
                onClick={() => void handleDownloadTemplate()}
              >
                {t('import.downloadTemplate')}
              </button>
              <div>
                <input
                  ref={importFileInputRef}
                  data-testid="input-import-csv"
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
                  data-testid="btn-choose-import-file"
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  {t('import.chooseFile')}
                </button>
                {importFile ? (
                  <span className="ml-2 text-sm" data-testid="import-file-name">
                    {importFile.name}
                  </span>
                ) : null}
              </div>
            </div>

            {importError ? (
              <div
                role="alert"
                data-testid="import-error-banner"
                className="mb-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200"
              >
                {importError}
              </div>
            ) : null}

            {importLoading ? (
              <p className="mb-4 text-sm" data-testid="import-loading">
                {t('import.loading')}
              </p>
            ) : null}

            {importResult ? (
              <div className="mb-4 space-y-3" data-testid="import-result">
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
                      data-testid="import-errors-table"
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
                data-testid="btn-import-close"
                className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                onClick={() => setShowImportDialog(false)}
              >
                {t('import.close')}
              </button>
              <button
                type="button"
                data-testid="btn-submit-import"
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
  )
}
