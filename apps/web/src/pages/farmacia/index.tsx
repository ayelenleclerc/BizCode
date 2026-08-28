import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { farmaciaAPI } from '@/lib/api'
import type {
  LibroPsicotropicoMovimientoRow,
  LibroPsicotropicoTipo,
  RecetaDispensacionRow,
} from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type Tab = 'recetas' | 'libro' | 'serial'

const LIBRO_TIPOS: readonly LibroPsicotropicoTipo[] = ['ingreso', 'egreso', 'ajuste']

const EMPTY_RECETA_FORM = {
  numeroReceta: '',
  medicoNombre: '',
  matricula: '',
  fechaReceta: '',
  clienteId: '',
  observaciones: '',
}

const EMPTY_LIBRO_FORM = {
  articuloId: '',
  tipo: 'ingreso' as LibroPsicotropicoTipo,
  cantidad: '',
  referencia: '',
}

function optionalInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

/**
 * @en Pharmacy vertical console (#204): prescriptions, internal psychotropic book and lot serials.
 * @es Consola del vertical farmacia (#204): recetas, libro interno de psicotrópicos y seriales de lote.
 * @pt-BR Console do vertical farmácia (#204): receitas, livro interno de psicotrópicos e seriais de lote.
 */
export default function FarmaciaPage() {
  const { t } = useTranslation('farmacia')
  const [tab, setTab] = useState<Tab>('recetas')
  const [recetas, setRecetas] = useState<RecetaDispensacionRow[]>([])
  const [libro, setLibro] = useState<LibroPsicotropicoMovimientoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  const [recetaForm, setRecetaForm] = useState(EMPTY_RECETA_FORM)
  const [recetaSaving, setRecetaSaving] = useState(false)
  const [recetaMsg, setRecetaMsg] = useState<string | null>(null)

  const [libroForm, setLibroForm] = useState(EMPTY_LIBRO_FORM)
  const [libroSaving, setLibroSaving] = useState(false)
  const [libroMsg, setLibroMsg] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [serialForm, setSerialForm] = useState({ loteId: '', serialUnidad: '', codigoDatamatrix: '' })
  const [serialSaving, setSerialSaving] = useState(false)
  const [serialMsg, setSerialMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [recetaRows, libroRows] = await Promise.all([
        farmaciaAPI.listRecetas(),
        farmaciaAPI.listLibro(),
      ])
      setRecetas(recetaRows)
      setLibro(libroRows)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreateReceta(event: FormEvent): Promise<void> {
    event.preventDefault()
    setRecetaSaving(true)
    setRecetaMsg(null)
    try {
      await farmaciaAPI.createReceta({
        numeroReceta: recetaForm.numeroReceta.trim(),
        medicoNombre: recetaForm.medicoNombre.trim(),
        matricula: recetaForm.matricula.trim(),
        fechaReceta: recetaForm.fechaReceta,
        clienteId: optionalInt(recetaForm.clienteId),
        observaciones: recetaForm.observaciones.trim() || null,
      })
      setRecetaForm(EMPTY_RECETA_FORM)
      setRecetaMsg(t('recetas.saveOk'))
      await load()
    } catch (error) {
      setRecetaMsg(error instanceof Error ? error.message : t('recetas.saveError'))
    } finally {
      setRecetaSaving(false)
    }
  }

  async function handleCreateLibro(event: FormEvent): Promise<void> {
    event.preventDefault()
    setLibroSaving(true)
    setLibroMsg(null)
    try {
      const articuloId = optionalInt(libroForm.articuloId)
      const cantidad = Number.parseFloat(libroForm.cantidad)
      if (articuloId === null || !Number.isFinite(cantidad) || cantidad === 0) {
        setLibroMsg(t('libro.invalid'))
        return
      }
      await farmaciaAPI.createLibroMovimiento({
        articuloId,
        tipo: libroForm.tipo,
        cantidad,
        referencia: libroForm.referencia.trim() || null,
      })
      setLibroForm(EMPTY_LIBRO_FORM)
      setLibroMsg(t('libro.saveOk'))
      await load()
    } catch (error) {
      setLibroMsg(error instanceof Error ? error.message : t('libro.saveError'))
    } finally {
      setLibroSaving(false)
    }
  }

  async function handleExport(): Promise<void> {
    setExporting(true)
    setLibroMsg(null)
    try {
      const csv = await farmaciaAPI.exportLibroCsv()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'libro-psicotropicos.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLibroMsg(error instanceof Error ? error.message : t('libro.exportError'))
    } finally {
      setExporting(false)
    }
  }

  async function handleSaveSerial(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSerialSaving(true)
    setSerialMsg(null)
    try {
      const loteId = optionalInt(serialForm.loteId)
      if (loteId === null) {
        setSerialMsg(t('serial.invalid'))
        return
      }
      await farmaciaAPI.setLoteSerial(loteId, {
        serialUnidad: serialForm.serialUnidad.trim() || null,
        codigoDatamatrix: serialForm.codigoDatamatrix.trim() || null,
      })
      setSerialMsg(t('serial.saveOk'))
    } catch (error) {
      setSerialMsg(error instanceof Error ? error.message : t('serial.saveError'))
    } finally {
      setSerialSaving(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6" data-testid="farmacia-page">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p
          className="max-w-3xl rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100"
          role="note"
          data-testid="farmacia-compliance-notice"
        >
          {t('complianceNotice')}
        </p>

        <div className="flex gap-2" role="tablist" aria-label={t('title')}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'recetas'}
            className={`px-3 py-1.5 rounded border ${tab === 'recetas' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            data-testid="farmacia-tab-recetas"
            onClick={() => setTab('recetas')}
          >
            {t('tabs.recetas')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'libro'}
            className={`px-3 py-1.5 rounded border ${tab === 'libro' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            data-testid="farmacia-tab-libro"
            onClick={() => setTab('libro')}
          >
            {t('tabs.libro')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'serial'}
            className={`px-3 py-1.5 rounded border ${tab === 'serial' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            data-testid="farmacia-tab-serial"
            onClick={() => setTab('serial')}
          >
            {t('tabs.serial')}
          </button>
        </div>

        <AsyncWrapper loading={loading} error={loadError}>
          {tab === 'recetas' ? (
            <section className="space-y-4" aria-labelledby="farmacia-recetas-title">
              <h2 id="farmacia-recetas-title" className="text-lg font-semibold">
                {t('recetas.title')}
              </h2>

              <CanAccess permission="inventory.adjust">
                <form
                  onSubmit={(e) => void handleCreateReceta(e)}
                  className="grid max-w-3xl grid-cols-1 gap-3 rounded border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-600"
                  data-testid="farmacia-receta-form"
                >
                  <div>
                    <label htmlFor="farmacia-receta-numero" className="mb-1 block text-sm">
                      {t('recetas.numero')}
                    </label>
                    <input
                      id="farmacia-receta-numero"
                      type="text"
                      required
                      maxLength={40}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.numeroReceta}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, numeroReceta: e.target.value }))
                      }
                      data-testid="farmacia-receta-numero"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-receta-fecha" className="mb-1 block text-sm">
                      {t('recetas.fecha')}
                    </label>
                    <input
                      id="farmacia-receta-fecha"
                      type="date"
                      required
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.fechaReceta}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, fechaReceta: e.target.value }))
                      }
                      data-testid="farmacia-receta-fecha"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-receta-medico" className="mb-1 block text-sm">
                      {t('recetas.medico')}
                    </label>
                    <input
                      id="farmacia-receta-medico"
                      type="text"
                      required
                      maxLength={120}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.medicoNombre}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, medicoNombre: e.target.value }))
                      }
                      data-testid="farmacia-receta-medico"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-receta-matricula" className="mb-1 block text-sm">
                      {t('recetas.matricula')}
                    </label>
                    <input
                      id="farmacia-receta-matricula"
                      type="text"
                      required
                      maxLength={40}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.matricula}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, matricula: e.target.value }))
                      }
                      data-testid="farmacia-receta-matricula"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-receta-cliente" className="mb-1 block text-sm">
                      {t('recetas.clienteId')}
                    </label>
                    <input
                      id="farmacia-receta-cliente"
                      type="number"
                      min={1}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.clienteId}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, clienteId: e.target.value }))
                      }
                      data-testid="farmacia-receta-cliente"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="farmacia-receta-obs" className="mb-1 block text-sm">
                      {t('recetas.observaciones')}
                    </label>
                    <input
                      id="farmacia-receta-obs"
                      type="text"
                      maxLength={500}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={recetaForm.observaciones}
                      onChange={(e) =>
                        setRecetaForm((prev) => ({ ...prev, observaciones: e.target.value }))
                      }
                      data-testid="farmacia-receta-obs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                      disabled={recetaSaving}
                      data-testid="farmacia-receta-save"
                    >
                      {t('recetas.save')}
                    </button>
                    {recetaMsg ? (
                      <p className="mt-2 text-sm" role="status" data-testid="farmacia-receta-status">
                        {recetaMsg}
                      </p>
                    ) : null}
                  </div>
                </form>
              </CanAccess>

              {recetas.length === 0 ? (
                <p className="text-sm text-slate-500" data-testid="farmacia-recetas-empty">
                  {t('recetas.empty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full border-collapse text-sm"
                    data-testid="farmacia-recetas-table"
                  >
                    <thead>
                      <tr className="border-b text-left">
                        <th scope="col" className="py-2 pr-3">
                          {t('recetas.numero')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('recetas.fecha')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('recetas.medico')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('recetas.matricula')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('recetas.factura')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recetas.map((receta) => (
                        <tr
                          key={receta.id}
                          className="border-b border-slate-100 dark:border-slate-700"
                        >
                          <td className="py-2 pr-3 font-mono">{receta.numeroReceta}</td>
                          <td className="py-2 pr-3 tabular-nums">{receta.fechaReceta}</td>
                          <td className="py-2 pr-3">{receta.medicoNombre}</td>
                          <td className="py-2 pr-3">{receta.matricula}</td>
                          <td className="py-2 pr-3 tabular-nums">
                            {receta.facturaId ?? t('recetas.sinFactura')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {tab === 'libro' ? (
            <section className="space-y-4" aria-labelledby="farmacia-libro-title">
              <h2 id="farmacia-libro-title" className="text-lg font-semibold">
                {t('libro.title')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('libro.hint')}</p>

              <CanAccess permission="inventory.adjust">
                <form
                  onSubmit={(e) => void handleCreateLibro(e)}
                  className="grid max-w-3xl grid-cols-1 gap-3 rounded border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-600"
                  data-testid="farmacia-libro-form"
                >
                  <div>
                    <label htmlFor="farmacia-libro-articulo" className="mb-1 block text-sm">
                      {t('libro.articuloId')}
                    </label>
                    <input
                      id="farmacia-libro-articulo"
                      type="number"
                      min={1}
                      required
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={libroForm.articuloId}
                      onChange={(e) =>
                        setLibroForm((prev) => ({ ...prev, articuloId: e.target.value }))
                      }
                      data-testid="farmacia-libro-articulo"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-libro-tipo" className="mb-1 block text-sm">
                      {t('libro.tipo')}
                    </label>
                    <select
                      id="farmacia-libro-tipo"
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={libroForm.tipo}
                      onChange={(e) =>
                        setLibroForm((prev) => ({
                          ...prev,
                          tipo: e.target.value as LibroPsicotropicoTipo,
                        }))
                      }
                      data-testid="farmacia-libro-tipo"
                    >
                      {LIBRO_TIPOS.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {t(`libro.tipos.${tipo}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="farmacia-libro-cantidad" className="mb-1 block text-sm">
                      {t('libro.cantidad')}
                    </label>
                    <input
                      id="farmacia-libro-cantidad"
                      type="number"
                      step="any"
                      required
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={libroForm.cantidad}
                      onChange={(e) =>
                        setLibroForm((prev) => ({ ...prev, cantidad: e.target.value }))
                      }
                      data-testid="farmacia-libro-cantidad"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-libro-referencia" className="mb-1 block text-sm">
                      {t('libro.referencia')}
                    </label>
                    <input
                      id="farmacia-libro-referencia"
                      type="text"
                      maxLength={60}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={libroForm.referencia}
                      onChange={(e) =>
                        setLibroForm((prev) => ({ ...prev, referencia: e.target.value }))
                      }
                      data-testid="farmacia-libro-referencia"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                      disabled={libroSaving}
                      data-testid="farmacia-libro-save"
                    >
                      {t('libro.save')}
                    </button>
                    <button
                      type="button"
                      className="rounded border px-3 py-1.5 disabled:opacity-50"
                      disabled={exporting}
                      onClick={() => void handleExport()}
                      data-testid="farmacia-libro-export"
                    >
                      {t('libro.export')}
                    </button>
                  </div>
                  {libroMsg ? (
                    <p
                      className="text-sm sm:col-span-2"
                      role="status"
                      data-testid="farmacia-libro-status"
                    >
                      {libroMsg}
                    </p>
                  ) : null}
                </form>
              </CanAccess>

              {libro.length === 0 ? (
                <p className="text-sm text-slate-500" data-testid="farmacia-libro-empty">
                  {t('libro.empty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm" data-testid="farmacia-libro-table">
                    <thead>
                      <tr className="border-b text-left">
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.fecha')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.tipo')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.articulo')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.lote')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.cantidad')}
                        </th>
                        <th scope="col" className="py-2 pr-3">
                          {t('libro.referencia')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {libro.map((mov) => (
                        <tr key={mov.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-2 pr-3 tabular-nums">{mov.createdAt.slice(0, 10)}</td>
                          <td className="py-2 pr-3">{t(`libro.tipos.${mov.tipo}`)}</td>
                          <td className="py-2 pr-3">
                            {mov.articulo
                              ? `${mov.articulo.codigo} — ${mov.articulo.descripcion}`
                              : mov.articuloId}
                          </td>
                          <td className="py-2 pr-3 font-mono">{mov.lote?.nroLote ?? '—'}</td>
                          <td className="py-2 pr-3 tabular-nums">{mov.cantidad}</td>
                          <td className="py-2 pr-3">{mov.referencia ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {tab === 'serial' ? (
            <section className="space-y-4" aria-labelledby="farmacia-serial-title">
              <h2 id="farmacia-serial-title" className="text-lg font-semibold">
                {t('serial.title')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('serial.hint')}</p>

              <CanAccess permission="inventory.adjust">
                <form
                  onSubmit={(e) => void handleSaveSerial(e)}
                  className="max-w-md space-y-3 rounded border border-slate-200 p-4 dark:border-slate-600"
                  data-testid="farmacia-serial-form"
                >
                  <div>
                    <label htmlFor="farmacia-serial-lote" className="mb-1 block text-sm">
                      {t('serial.loteId')}
                    </label>
                    <input
                      id="farmacia-serial-lote"
                      type="number"
                      min={1}
                      required
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={serialForm.loteId}
                      onChange={(e) =>
                        setSerialForm((prev) => ({ ...prev, loteId: e.target.value }))
                      }
                      data-testid="farmacia-serial-lote"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-serial-unidad" className="mb-1 block text-sm">
                      {t('serial.serialUnidad')}
                    </label>
                    <input
                      id="farmacia-serial-unidad"
                      type="text"
                      maxLength={60}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={serialForm.serialUnidad}
                      onChange={(e) =>
                        setSerialForm((prev) => ({ ...prev, serialUnidad: e.target.value }))
                      }
                      data-testid="farmacia-serial-unidad"
                    />
                  </div>
                  <div>
                    <label htmlFor="farmacia-serial-datamatrix" className="mb-1 block text-sm">
                      {t('serial.codigoDatamatrix')}
                    </label>
                    <input
                      id="farmacia-serial-datamatrix"
                      type="text"
                      maxLength={200}
                      className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                      value={serialForm.codigoDatamatrix}
                      onChange={(e) =>
                        setSerialForm((prev) => ({ ...prev, codigoDatamatrix: e.target.value }))
                      }
                      data-testid="farmacia-serial-datamatrix"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                    disabled={serialSaving}
                    data-testid="farmacia-serial-save"
                  >
                    {t('serial.save')}
                  </button>
                  {serialMsg ? (
                    <p className="text-sm" role="status" data-testid="farmacia-serial-status">
                      {serialMsg}
                    </p>
                  ) : null}
                </form>
              </CanAccess>
            </section>
          ) : null}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
