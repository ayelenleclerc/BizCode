import { useState, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, articulosAPI, rubrosAPI, type CsvBulkImportResult } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import { Articulo, Rubro } from '@/types'
import ArticuloForm from './ArticuloForm'

type ImportDialogKind = 'rubros' | 'articulos'

export default function ArticulosPage() {
  const { t } = useTranslation('articulos')
  const { t: tc } = useTranslation('common')
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  const [importDialog, setImportDialog] = useState<ImportDialogKind | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<CsvBulkImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const importCloseRef = useRef<HTMLButtonElement>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)

  const refreshLists = async () => {
    setLoading(true)
    try {
      const [artData, rubData] = await Promise.all([
        articulosAPI.list(filtro.length > 0 ? filtro : undefined),
        rubrosAPI.list(),
      ])
      setArticulos(artData || [])
      setRubros(rubData || [])
      setSelectedRow(0)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial; filtro se actualiza vía handleSearch
  }, [])

  useHotkeys('f2', () => {
    const input = document.getElementById('search-articulos') as HTMLInputElement
    input?.focus()
  })

  useHotkeys('f3', () => {
    setSelectedArticulo(null)
    setShowForm(true)
  })

  useHotkeys('escape', () => {
    if (importDialog) setImportDialog(null)
    else if (showForm) setShowForm(false)
  })

  useEffect(() => {
    if (importDialog) {
      setImportFile(null)
      setImportResult(null)
      setImportError(null)
      importCloseRef.current?.focus()
    }
  }, [importDialog])

  const importErrorMessage = (error: unknown, prefix: 'importRubros' | 'importArticulos'): string => {
    if (error instanceof ApiRequestFailedError) {
      if (!error.hasResponse) return t(`${prefix}.errorNetwork`)
      return error.message.trim() || t(`${prefix}.errorGeneric`)
    }
    return t(`${prefix}.errorGeneric`)
  }

  const handleDownloadTemplate = async (kind: ImportDialogKind) => {
    const prefix = kind === 'rubros' ? 'importRubros' : 'importArticulos'
    try {
      const blob =
        kind === 'rubros' ? await rubrosAPI.downloadImportTemplate() : await articulosAPI.downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = kind === 'rubros' ? 'rubros_import_template.csv' : 'articulos_import_template.csv'
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setImportError(importErrorMessage(error, prefix))
    }
  }

  const handleSubmitImport = async (kind: ImportDialogKind) => {
    if (!importFile) return
    const prefix = kind === 'rubros' ? 'importRubros' : 'importArticulos'
    setImportLoading(true)
    setImportError(null)
    setImportResult(null)
    try {
      const data =
        kind === 'rubros' ? await rubrosAPI.importFromCsv(importFile) : await articulosAPI.importFromCsv(importFile)
      setImportResult(data)
      await refreshLists()
    } catch (error) {
      setImportError(importErrorMessage(error, prefix))
    } finally {
      setImportLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    setFiltro(value)
    if (value.length > 0) {
      const data = await articulosAPI.list(value)
      setArticulos(data || [])
    } else {
      const data = await articulosAPI.list()
      setArticulos(data || [])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedRow(Math.min(selectedRow + 1, articulos.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedRow(Math.max(selectedRow - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedArticulo(articulos[index])
      setShowForm(true)
    }
  }

  const handleArticuloGuardado = async () => {
    setShowForm(false)
    const data = await articulosAPI.list(filtro)
    setArticulos(data || [])
  }

  const ivaLabel = (condIva: string) => t(`iva.${condIva}` as `iva.1` | `iva.2` | `iva.3`)

  const importPrefix: 'importRubros' | 'importArticulos' | null =
    importDialog === 'rubros' ? 'importRubros' : importDialog === 'articulos' ? 'importArticulos' : null

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          id="search-articulos"
          type="text"
          placeholder={t('search.placeholder')}
          value={filtro}
          onChange={(e) => {
            void handleSearch(e.target.value)
          }}
          className="flex-1 min-w-[200px] px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <CanAccess permission="products.manage">
          <button
            type="button"
            data-testid="btn-import-rubros"
            onClick={() => setImportDialog('rubros')}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
          >
            {t('importRubros.button')}
          </button>
        </CanAccess>
        <CanAccess permission="products.manage">
          <button
            type="button"
            data-testid="btn-import-articulos"
            onClick={() => setImportDialog('articulos')}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
          >
            {t('importArticulos.button')}
          </button>
        </CanAccess>
        <button
          type="button"
          data-testid="btn-nuevo-articulo"
          onClick={() => {
            setSelectedArticulo(null)
            setShowForm(true)
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          {'\u2795'} {tc('actions.new')} (F3)
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{tc('status.loading')}</div>
        ) : articulos.length === 0 ? (
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
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.descripcion')}</th>
                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('table.rubro')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.iva')}</th>
                <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('table.precioLista1')}</th>
                <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('table.precioLista2')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.stock')}</th>
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('table.activo')}</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((articulo, idx) => (
                <tr
                  key={articulo.id}
                  data-selected={selectedRow === idx ? 'true' : 'false'}
                  onClick={() => setSelectedRow(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{articulo.codigo}</td>
                  <td className="px-4 py-3">{articulo.descripcion}</td>
                  <td className="px-4 py-3">{articulo.rubro?.nombre || '-'}</td>
                  <td className="px-4 py-3 text-center">{ivaLabel(articulo.condIva)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.precioLista1).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(articulo.precioLista2).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{articulo.stock}</td>
                  <td className="px-4 py-3 text-center">
                    {articulo.activo ? tc('status.active') : tc('status.inactive')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ArticuloForm
          articulo={selectedArticulo}
          rubros={rubros}
          onClose={() => setShowForm(false)}
          onGuardado={handleArticuloGuardado}
        />
      )}

      {importDialog && importPrefix ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/50"
            aria-label={t(`${importPrefix}.close`)}
            onClick={() => setImportDialog(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="articulos-import-title"
            data-testid={importDialog === 'rubros' ? 'dialog-import-rubros' : 'dialog-import-articulos'}
            className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-xl text-slate-900 dark:text-slate-100"
          >
            <h2 id="articulos-import-title" className="text-xl font-semibold mb-2">
              {t(`${importPrefix}.title`)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t(`${importPrefix}.description`)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t(`${importPrefix}.hintFormat`)}</p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                type="button"
                data-testid={importDialog === 'rubros' ? 'btn-download-rubros-template' : 'btn-download-articulos-template'}
                className="text-left text-blue-600 dark:text-blue-400 underline"
                onClick={() => void handleDownloadTemplate(importDialog)}
              >
                {t(`${importPrefix}.downloadTemplate`)}
              </button>
              <div>
                <input
                  ref={importFileInputRef}
                  data-testid={importDialog === 'rubros' ? 'input-import-rubros-csv' : 'input-import-articulos-csv'}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  aria-label={t(`${importPrefix}.chooseFile`)}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setImportFile(f)
                    setImportResult(null)
                    setImportError(null)
                  }}
                />
                <button
                  type="button"
                  data-testid={importDialog === 'rubros' ? 'btn-choose-rubros-import-file' : 'btn-choose-articulos-import-file'}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  {t(`${importPrefix}.chooseFile`)}
                </button>
                {importFile ? (
                  <span className="ml-2 text-sm" data-testid="import-csv-file-name">
                    {importFile.name}
                  </span>
                ) : null}
              </div>
            </div>

            {importError ? (
              <div
                role="alert"
                data-testid="import-csv-error-banner"
                className="mb-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200"
              >
                {importError}
              </div>
            ) : null}

            {importLoading ? (
              <p className="mb-4 text-sm" data-testid="import-csv-loading">
                {t(`${importPrefix}.loading`)}
              </p>
            ) : null}

            {importResult ? (
              <div className="mb-4 space-y-3" data-testid="import-csv-result">
                <p className="text-sm font-medium">
                  {t(`${importPrefix}.successSummary`, {
                    created: importResult.created,
                    skipped: importResult.skipped,
                  })}
                </p>
                {importResult.errors.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium mb-2">{t(`${importPrefix}.errorsHeading`)}</p>
                    <table
                      className="w-full text-sm border border-slate-200 dark:border-slate-600"
                      data-testid="import-csv-errors-table"
                    >
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-700">
                          <th className="text-left px-2 py-1">{t(`${importPrefix}.row`)}</th>
                          <th className="text-left px-2 py-1">{t(`${importPrefix}.message`)}</th>
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
                data-testid={importDialog === 'rubros' ? 'btn-import-rubros-close' : 'btn-import-articulos-close'}
                className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                onClick={() => setImportDialog(null)}
              >
                {t(`${importPrefix}.close`)}
              </button>
              <button
                type="button"
                data-testid={importDialog === 'rubros' ? 'btn-submit-rubros-import' : 'btn-submit-articulos-import'}
                disabled={!importFile || importLoading}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => void handleSubmitImport(importDialog)}
              >
                {t(`${importPrefix}.submit`)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
