import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import {
  ApiRequestFailedError,
  articulosAPI,
  proveedoresAPI,
  type ProveedorCatalogoRow,
} from '@/lib/api'

const MS_PER_DAY = 24 * 60 * 60 * 1000

type Props = {
  proveedorId: number
}

type PrecioStaleness = 'none' | 'ok' | 'warning' | 'danger'

function formatMoney(value: string | null): string {
  if (value == null) return '—'
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return value
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString()
}

/**
 * @en Returns price-list age indicator for supplier catalog rows (#273).
 * @es Indicador de antigüedad del precio de lista en catálogo (#273).
 * @pt-BR Indicador de idade do preço de lista no catálogo (#273).
 */
export function getPrecioListaStaleness(fechaIso: string | null, hasPrecio: boolean): PrecioStaleness {
  if (!hasPrecio) return 'none'
  if (!fechaIso) return 'ok'
  const d = new Date(fechaIso)
  if (Number.isNaN(d.getTime())) return 'ok'
  const days = Math.floor((Date.now() - d.getTime()) / MS_PER_DAY)
  if (days > 90) return 'danger'
  if (days > 30) return 'warning'
  return 'ok'
}

function stalenessClass(staleness: PrecioStaleness): string {
  if (staleness === 'warning') {
    return 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30'
  }
  if (staleness === 'danger') {
    return 'text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/30'
  }
  return ''
}

/**
 * @en Supplier catalog tab — codes, descriptions and list prices (#273).
 * @es Pestaña de catálogo del proveedor — códigos, descripciones y precios (#273).
 * @pt-BR Aba de catálogo do fornecedor — códigos, descrições e preços (#273).
 */
export default function ProveedorCatalogoSection({ proveedorId }: Props) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ProveedorCatalogoRow[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addCodigoInterno, setAddCodigoInterno] = useState('')
  const [addArticuloLabel, setAddArticuloLabel] = useState('')
  const [addArticuloId, setAddArticuloId] = useState<number | null>(null)
  const [addCodigoProveedor, setAddCodigoProveedor] = useState('')
  const [addDescripcion, setAddDescripcion] = useState('')
  const [addPrecio, setAddPrecio] = useState('')
  const [addUnidad, setAddUnidad] = useState('')
  const [addMultiplo, setAddMultiplo] = useState('1')
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [editingArticuloId, setEditingArticuloId] = useState<number | null>(null)
  const [editCodigoProveedor, setEditCodigoProveedor] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editPrecio, setEditPrecio] = useState('')
  const [editUnidad, setEditUnidad] = useState('')
  const [editMultiplo, setEditMultiplo] = useState('1')
  const [editActivo, setEditActivo] = useState(true)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<Awaited<
    ReturnType<typeof proveedoresAPI.importCatalogoFromCsv>
  > | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  const inputClass =
    'w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await proveedoresAPI.listCatalogo(proveedorId)
      setItems(rows ?? [])
    } catch (err) {
      if (err instanceof ApiRequestFailedError) {
        setError(err.message)
      } else {
        setError(tc('errors.generic'))
      }
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [proveedorId, tc])

  useEffect(() => {
    void load()
  }, [load])

  const resolveArticuloByCodigo = async (codigoStr: string): Promise<number | null> => {
    const codigo = Number.parseInt(codigoStr.trim(), 10)
    if (!Number.isInteger(codigo) || codigo < 1) return null
    const found = await articulosAPI.list(String(codigo))
    const list = Array.isArray(found) ? found : []
    const match = list.find(
      (a: { id?: number; codigo?: number }) => a.codigo === codigo && typeof a.id === 'number',
    )
    if (!match || typeof match.id !== 'number') return null
    setAddArticuloLabel(
      `${match.codigo} — ${typeof match.descripcion === 'string' ? match.descripcion : ''}`,
    )
    return match.id
  }

  const resetAddForm = () => {
    setAddCodigoInterno('')
    setAddArticuloLabel('')
    setAddArticuloId(null)
    setAddCodigoProveedor('')
    setAddDescripcion('')
    setAddPrecio('')
    setAddUnidad('')
    setAddMultiplo('1')
    setAddError(null)
  }

  const submitAdd = async () => {
    let articuloId = addArticuloId
    if (articuloId == null) {
      articuloId = await resolveArticuloByCodigo(addCodigoInterno)
      if (articuloId == null) {
        setAddError(t('catalogo.errors.articuloNotFound'))
        return
      }
      setAddArticuloId(articuloId)
    }
    if (!addCodigoProveedor.trim()) {
      setAddError(t('catalogo.errors.codigoProveedorRequired'))
      return
    }
    const precioRaw = addPrecio.trim()
    let precioLista: number | null = null
    if (precioRaw !== '') {
      const parsedPrecio = Number.parseFloat(precioRaw)
      if (!Number.isFinite(parsedPrecio) || parsedPrecio < 0) {
        setAddError(t('catalogo.errors.precioInvalid'))
        return
      }
      precioLista = parsedPrecio
    }
    const multiplo = Number.parseFloat(addMultiplo)
    if (!Number.isFinite(multiplo) || multiplo <= 0) {
      setAddError(t('catalogo.errors.multiploInvalid'))
      return
    }
    setAddSaving(true)
    setAddError(null)
    try {
      await proveedoresAPI.createCatalogoEntry(proveedorId, {
        articuloId,
        codigoProveedor: addCodigoProveedor.trim(),
        descripcion: addDescripcion.trim() || null,
        precioLista,
        unidadCompra: addUnidad.trim() || null,
        multiplo,
      })
      setShowAdd(false)
      resetAddForm()
      await load()
    } catch (err) {
      setAddError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setAddSaving(false)
    }
  }

  const startEdit = (row: ProveedorCatalogoRow) => {
    setEditingArticuloId(row.articuloId)
    setEditCodigoProveedor(row.codigoProveedor)
    setEditDescripcion(row.descripcion ?? '')
    setEditPrecio(row.precioLista ?? '')
    setEditUnidad(row.unidadCompra ?? '')
    setEditMultiplo(row.multiplo)
    setEditActivo(row.activo)
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingArticuloId(null)
    setEditError(null)
  }

  const submitEdit = async () => {
    if (editingArticuloId == null) return
    if (!editCodigoProveedor.trim()) {
      setEditError(t('catalogo.errors.codigoProveedorRequired'))
      return
    }
    const precioRaw = editPrecio.trim()
    let precioLista: number | null = null
    if (precioRaw !== '') {
      const parsedPrecio = Number.parseFloat(precioRaw)
      if (!Number.isFinite(parsedPrecio) || parsedPrecio < 0) {
        setEditError(t('catalogo.errors.precioInvalid'))
        return
      }
      precioLista = parsedPrecio
    }
    const multiplo = Number.parseFloat(editMultiplo)
    if (!Number.isFinite(multiplo) || multiplo <= 0) {
      setEditError(t('catalogo.errors.multiploInvalid'))
      return
    }
    setEditSaving(true)
    setEditError(null)
    try {
      await proveedoresAPI.updateCatalogoEntry(proveedorId, editingArticuloId, {
        codigoProveedor: editCodigoProveedor.trim(),
        descripcion: editDescripcion.trim() || null,
        precioLista,
        unidadCompra: editUnidad.trim() || null,
        multiplo,
        activo: editActivo,
      })
      setEditingArticuloId(null)
      await load()
    } catch (err) {
      setEditError(err instanceof ApiRequestFailedError ? err.message : tc('errors.generic'))
    } finally {
      setEditSaving(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csv = 'codigo_proveedor,codigo_interno,precio,unidad\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-catalogo-proveedor.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmitImport = async () => {
    if (!importFile) return
    setImportLoading(true)
    setImportError(null)
    setImportResult(null)
    try {
      const result = await proveedoresAPI.importCatalogoFromCsv(proveedorId, importFile)
      setImportResult(result)
      await load()
    } catch (err) {
      setImportError(err instanceof ApiRequestFailedError ? err.message : t('catalogo.import.errorGeneric'))
    } finally {
      setImportLoading(false)
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500" data-testid="proveedor-catalogo-loading">
        {tc('status.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600" data-testid="proveedor-catalogo-error">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-4" data-testid="proveedor-catalogo-section">
      <div className="flex flex-wrap gap-2">
        <CanAccess permission="suppliers.manage">
          <button
            type="button"
            data-testid="proveedor-catalogo-btn-add"
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white"
            onClick={() => {
              setShowAdd((v) => !v)
              if (showAdd) resetAddForm()
            }}
          >
            {showAdd ? t('catalogo.addCancel') : t('catalogo.addOpen')}
          </button>
          <button
            type="button"
            data-testid="proveedor-catalogo-btn-import"
            className="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600"
            onClick={() => {
              setShowImport(true)
              setImportFile(null)
              setImportResult(null)
              setImportError(null)
            }}
          >
            {t('catalogo.import.button')}
          </button>
        </CanAccess>
      </div>

      {showAdd ? (
        <section
          aria-labelledby="proveedor-catalogo-add-title"
          className="border border-slate-200 dark:border-slate-600 rounded p-3 space-y-3"
          data-testid="proveedor-catalogo-add-form"
        >
          <h3 id="proveedor-catalogo-add-title" className="text-sm font-semibold">
            {t('catalogo.addTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalogo-add-codigo-interno" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colCodigoInterno')}
              </label>
              <input
                id="catalogo-add-codigo-interno"
                data-testid="catalogo-add-codigo-interno"
                type="number"
                min={1}
                value={addCodigoInterno}
                onChange={(e) => {
                  setAddCodigoInterno(e.target.value)
                  setAddArticuloId(null)
                  setAddArticuloLabel('')
                }}
                onBlur={() => {
                  void resolveArticuloByCodigo(addCodigoInterno).then((id) => {
                    if (id != null) setAddArticuloId(id)
                  })
                }}
                className={inputClass}
              />
              {addArticuloLabel ? (
                <p className="text-xs text-slate-500 mt-1" data-testid="catalogo-add-articulo-label">
                  {addArticuloLabel}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="catalogo-add-codigo-proveedor" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colCodigoProveedor')}
              </label>
              <input
                id="catalogo-add-codigo-proveedor"
                data-testid="catalogo-add-codigo-proveedor"
                type="text"
                maxLength={50}
                value={addCodigoProveedor}
                onChange={(e) => setAddCodigoProveedor(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="catalogo-add-descripcion" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colDescripcionProveedor')}
              </label>
              <input
                id="catalogo-add-descripcion"
                data-testid="catalogo-add-descripcion"
                type="text"
                maxLength={120}
                value={addDescripcion}
                onChange={(e) => setAddDescripcion(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="catalogo-add-precio" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colPrecioLista')}
              </label>
              <input
                id="catalogo-add-precio"
                data-testid="catalogo-add-precio"
                type="number"
                min={0}
                step="0.01"
                value={addPrecio}
                onChange={(e) => setAddPrecio(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="catalogo-add-unidad" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colUnidad')}
              </label>
              <input
                id="catalogo-add-unidad"
                data-testid="catalogo-add-unidad"
                type="text"
                maxLength={30}
                value={addUnidad}
                onChange={(e) => setAddUnidad(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="catalogo-add-multiplo" className="block text-xs text-slate-500 mb-1">
                {t('catalogo.colMultiplo')}
              </label>
              <input
                id="catalogo-add-multiplo"
                data-testid="catalogo-add-multiplo"
                type="number"
                min={0.01}
                step="0.01"
                value={addMultiplo}
                onChange={(e) => setAddMultiplo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {addError ? (
            <p role="alert" className="text-xs text-red-600" data-testid="catalogo-add-error">
              {addError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600"
              onClick={() => {
                setShowAdd(false)
                resetAddForm()
              }}
            >
              {tc('actions.cancel')}
            </button>
            <button
              type="button"
              data-testid="catalogo-add-submit"
              disabled={addSaving}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => void submitAdd()}
            >
              {addSaving ? tc('actions.saving') : t('catalogo.addSubmit')}
            </button>
          </div>
        </section>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="proveedor-catalogo-empty">
          {t('catalogo.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border border-slate-200 dark:border-slate-600"
            data-testid="proveedor-catalogo-table"
          >
            <caption className="sr-only">{t('catalogo.tableCaption')}</caption>
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th scope="col" className="text-left px-2 py-1">
                  {t('catalogo.colCodigoProveedor')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('catalogo.colCodigoInterno')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('catalogo.colDescripcionInterna')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('catalogo.colDescripcionProveedor')}
                </th>
                <th scope="col" className="text-right px-2 py-1">
                  {t('catalogo.colPrecioLista')}
                </th>
                <th scope="col" className="text-left px-2 py-1">
                  {t('catalogo.colUnidad')}
                </th>
                <th scope="col" className="text-right px-2 py-1">
                  {t('catalogo.colMultiplo')}
                </th>
                <th scope="col" className="text-center px-2 py-1">
                  {t('catalogo.colActivo')}
                </th>
                <th scope="col" className="text-center px-2 py-1">
                  {t('catalogo.colAcciones')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const hasPrecio = row.precioLista != null
                const staleness = getPrecioListaStaleness(row.precioListaFecha, hasPrecio)
                const priceTitle =
                  staleness === 'warning'
                    ? t('catalogo.precioStaleWarning')
                    : staleness === 'danger'
                      ? t('catalogo.precioStaleDanger')
                      : undefined
                const isEditing = editingArticuloId === row.articuloId

                if (isEditing) {
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40"
                      data-testid={`catalogo-edit-row-${row.articuloId}`}
                    >
                      <td colSpan={9} className="px-2 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            aria-label={t('catalogo.colCodigoProveedor')}
                            data-testid="catalogo-edit-codigo-proveedor"
                            type="text"
                            maxLength={50}
                            value={editCodigoProveedor}
                            onChange={(e) => setEditCodigoProveedor(e.target.value)}
                            className={inputClass}
                          />
                          <input
                            aria-label={t('catalogo.colDescripcionProveedor')}
                            data-testid="catalogo-edit-descripcion"
                            type="text"
                            maxLength={120}
                            value={editDescripcion}
                            onChange={(e) => setEditDescripcion(e.target.value)}
                            className={inputClass}
                          />
                          <input
                            aria-label={t('catalogo.colPrecioLista')}
                            data-testid="catalogo-edit-precio"
                            type="number"
                            min={0}
                            step="0.01"
                            value={editPrecio}
                            onChange={(e) => setEditPrecio(e.target.value)}
                            className={inputClass}
                          />
                          <input
                            aria-label={t('catalogo.colUnidad')}
                            data-testid="catalogo-edit-unidad"
                            type="text"
                            maxLength={30}
                            value={editUnidad}
                            onChange={(e) => setEditUnidad(e.target.value)}
                            className={inputClass}
                          />
                          <input
                            aria-label={t('catalogo.colMultiplo')}
                            data-testid="catalogo-edit-multiplo"
                            type="number"
                            min={0.01}
                            step="0.01"
                            value={editMultiplo}
                            onChange={(e) => setEditMultiplo(e.target.value)}
                            className={inputClass}
                          />
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              data-testid="catalogo-edit-activo"
                              checked={editActivo}
                              onChange={(e) => setEditActivo(e.target.checked)}
                            />
                            {t('catalogo.colActivo')}
                          </label>
                        </div>
                        {editError ? (
                          <p role="alert" className="text-xs text-red-600 mt-2" data-testid="catalogo-edit-error">
                            {editError}
                          </p>
                        ) : null}
                        <div className="flex gap-2 mt-2 justify-end">
                          <button
                            type="button"
                            className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600"
                            onClick={cancelEdit}
                          >
                            {tc('actions.cancel')}
                          </button>
                          <button
                            type="button"
                            data-testid="catalogo-edit-submit"
                            disabled={editSaving}
                            className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
                            onClick={() => void submitEdit()}
                          >
                            {editSaving ? tc('actions.saving') : tc('actions.save')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={row.id} className="border-t border-slate-200 dark:border-slate-600">
                    <td className="px-2 py-1 font-mono text-xs">{row.codigoProveedor}</td>
                    <td className="px-2 py-1 font-mono text-xs">{row.articulo.codigo}</td>
                    <td className="px-2 py-1">{row.articulo.descripcion}</td>
                    <td className="px-2 py-1">{row.descripcion ?? '—'}</td>
                    <td className="px-2 py-1 text-right">
                      <span
                        className={`inline-block px-1 rounded ${stalenessClass(staleness)}`}
                        title={priceTitle}
                        data-testid={`catalogo-precio-${row.articuloId}`}
                        data-staleness={staleness}
                      >
                        {formatMoney(row.precioLista)}
                        {row.precioListaFecha ? (
                          <span className="block text-xs opacity-80">{formatDate(row.precioListaFecha)}</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-2 py-1">{row.unidadCompra ?? '—'}</td>
                    <td className="px-2 py-1 text-right">{row.multiplo}</td>
                    <td className="px-2 py-1 text-center">
                      {row.activo ? tc('status.active') : tc('status.inactive')}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <CanAccess permission="suppliers.manage">
                        <button
                          type="button"
                          data-testid={`catalogo-edit-btn-${row.articuloId}`}
                          className="text-xs text-blue-600 dark:text-blue-400 underline"
                          onClick={() => startEdit(row)}
                        >
                          {t('catalogo.edit')}
                        </button>
                      </CanAccess>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showImport ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/50"
            aria-label={t('catalogo.import.close')}
            onClick={() => setShowImport(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="proveedor-catalogo-import-title"
            data-testid="dialog-import-catalogo-proveedor"
            className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-xl"
          >
            <h2 id="proveedor-catalogo-import-title" className="text-lg font-semibold mb-2">
              {t('catalogo.import.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('catalogo.import.description')}</p>
            <button
              type="button"
              data-testid="btn-download-catalogo-template"
              className="text-left text-blue-600 dark:text-blue-400 underline text-sm mb-3"
              onClick={handleDownloadTemplate}
            >
              {t('catalogo.import.downloadTemplate')}
            </button>
            <input
              ref={importFileRef}
              data-testid="input-import-catalogo-csv"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label={t('catalogo.import.chooseFile')}
              onChange={(e) => {
                setImportFile(e.target.files?.[0] ?? null)
                setImportResult(null)
                setImportError(null)
              }}
            />
            <button
              type="button"
              data-testid="btn-choose-catalogo-import-file"
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600"
              onClick={() => importFileRef.current?.click()}
            >
              {t('catalogo.import.chooseFile')}
            </button>
            {importFile ? (
              <span className="ml-2 text-sm" data-testid="import-catalogo-file-name">
                {importFile.name}
              </span>
            ) : null}
            {importError ? (
              <p role="alert" className="text-sm text-red-600 mt-3" data-testid="import-catalogo-error">
                {importError}
              </p>
            ) : null}
            {importLoading ? (
              <p className="text-sm mt-3" data-testid="import-catalogo-loading">
                {t('catalogo.import.loading')}
              </p>
            ) : null}
            {importResult ? (
              <div className="mt-3 space-y-2" data-testid="import-catalogo-result">
                <p className="text-sm font-medium">
                  {t('catalogo.import.successSummary', {
                    created: importResult.created,
                    updated: importResult.updated,
                    skipped: importResult.skipped,
                  })}
                </p>
                {importResult.errors.length > 0 ? (
                  <table className="w-full text-sm border border-slate-200 dark:border-slate-600">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-700">
                        <th className="text-left px-2 py-1">{t('catalogo.import.row')}</th>
                        <th className="text-left px-2 py-1">{t('catalogo.import.message')}</th>
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
                ) : null}
              </div>
            ) : null}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                data-testid="btn-import-catalogo-close"
                className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600"
                onClick={() => setShowImport(false)}
              >
                {t('catalogo.import.close')}
              </button>
              <button
                type="button"
                data-testid="btn-submit-catalogo-import"
                disabled={!importFile || importLoading}
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={() => void handleSubmitImport()}
              >
                {t('catalogo.import.submit')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
