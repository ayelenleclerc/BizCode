import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { articulosAPI, listasPreciosAPI } from '@/lib/api'
import type {
  Articulo,
  ListaPrecioBulkUpdateResult,
  ListaPrecioItemInput,
  ListaPrecioRow,
  PrecioEscalonadoInput,
} from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type TipoPrecio = 'fijo' | 'porcentaje_sobre_base'

type EscalonadoDraft = { cantidadDesde: string; cantidadHasta: string; precio: string }

const emptyEscalonado: EscalonadoDraft = { cantidadDesde: '', cantidadHasta: '', precio: '' }

function money(value: number | null | undefined, moneda = 'ARS'): string {
  if (value == null) return '—'
  return value.toLocaleString(undefined, { style: 'currency', currency: moneda })
}

export default function ListasPreciosPage() {
  const { t } = useTranslation('listasPrecios')
  const { t: tc } = useTranslation('common')

  const [listas, setListas] = useState<ListaPrecioRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [esDefault, setEsDefault] = useState(false)
  const [vigenciaHasta, setVigenciaHasta] = useState('')

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<ListaPrecioRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [articulos, setArticulos] = useState<Articulo[]>([])

  const [itemArticuloId, setItemArticuloId] = useState('')
  const [itemTipo, setItemTipo] = useState<TipoPrecio>('fijo')
  const [itemPrecio, setItemPrecio] = useState('')
  const [itemPorcentaje, setItemPorcentaje] = useState('')
  const [itemEscalonados, setItemEscalonados] = useState<EscalonadoDraft[]>([])

  const [bulkPorcentaje, setBulkPorcentaje] = useState('')
  const [bulkPreview, setBulkPreview] = useState<ListaPrecioBulkUpdateResult | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await listasPreciosAPI.list()
      setListas(res?.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('errors.load')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
    articulosAPI
      .list()
      .then((data) => setArticulos((data as Articulo[]) ?? []))
      .catch(() => {})
  }, [load])

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true)
    setActionError(null)
    setBulkPreview(null)
    try {
      const row = await listasPreciosAPI.getById(id)
      setDetail(row)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId != null) {
      void loadDetail(selectedId)
    } else {
      setDetail(null)
    }
  }, [selectedId, loadDetail])

  const articuloLabel = useCallback(
    (id: number): string => {
      const a = articulos.find((x) => x.id === id)
      return a ? `${a.codigo} — ${a.descripcion}` : `#${id}`
    },
    [articulos],
  )

  const availableArticulos = useMemo(() => {
    const usados = new Set((detail?.items ?? []).map((i) => i.articuloId))
    return articulos.filter((a) => a.activo && !usados.has(a.id))
  }, [articulos, detail])

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setActionError(null)
    try {
      const created = await listasPreciosAPI.create({
        nombre: nombre.trim(),
        moneda: moneda.trim().toUpperCase(),
        esDefault,
        vigenciaHasta: vigenciaHasta ? new Date(vigenciaHasta).toISOString() : null,
      })
      setNombre('')
      setMoneda('ARS')
      setEsDefault(false)
      setVigenciaHasta('')
      await load()
      setSelectedId(created.id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleToggleActiva(row: ListaPrecioRow): Promise<void> {
    setActionError(null)
    try {
      await listasPreciosAPI.update(row.id, { activa: !row.activa })
      await load()
      if (selectedId === row.id) await loadDetail(row.id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleDelete(row: ListaPrecioRow): Promise<void> {
    setActionError(null)
    try {
      await listasPreciosAPI.remove(row.id)
      if (selectedId === row.id) setSelectedId(null)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    }
  }

  function addEscalonadoRow(): void {
    setItemEscalonados((prev) => [...prev, { ...emptyEscalonado }])
  }

  function updateEscalonado(index: number, key: keyof EscalonadoDraft, value: string): void {
    setItemEscalonados((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    )
  }

  function removeEscalonadoRow(index: number): void {
    setItemEscalonados((prev) => prev.filter((_, i) => i !== index))
  }

  function resetItemForm(): void {
    setItemArticuloId('')
    setItemTipo('fijo')
    setItemPrecio('')
    setItemPorcentaje('')
    setItemEscalonados([])
  }

  async function handleAddItem(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (selectedId == null) return
    setActionError(null)
    const escalonados: PrecioEscalonadoInput[] = itemEscalonados
      .filter((e) => e.cantidadDesde !== '' && e.precio !== '')
      .map((e) => ({
        cantidadDesde: Number.parseFloat(e.cantidadDesde),
        cantidadHasta: e.cantidadHasta === '' ? null : Number.parseFloat(e.cantidadHasta),
        precio: Number.parseFloat(e.precio),
      }))
    const body: ListaPrecioItemInput = {
      articuloId: Number.parseInt(itemArticuloId, 10),
      tipoPrecio: itemTipo,
      precio: itemTipo === 'fijo' ? Number.parseFloat(itemPrecio) : null,
      porcentaje: itemTipo === 'porcentaje_sobre_base' ? Number.parseFloat(itemPorcentaje) : null,
      escalonados,
    }
    try {
      await listasPreciosAPI.upsertItem(selectedId, body)
      resetItemForm()
      await loadDetail(selectedId)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleRemoveItem(itemId: number): Promise<void> {
    if (selectedId == null) return
    setActionError(null)
    try {
      await listasPreciosAPI.removeItem(selectedId, itemId)
      await loadDetail(selectedId)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleBulkPreview(): Promise<void> {
    if (selectedId == null || bulkPorcentaje === '') return
    setBulkBusy(true)
    setActionError(null)
    try {
      const res = await listasPreciosAPI.bulkUpdate(selectedId, {
        porcentaje: Number.parseFloat(bulkPorcentaje),
        preview: true,
      })
      setBulkPreview(res)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setBulkBusy(false)
    }
  }

  async function handleBulkApply(): Promise<void> {
    if (selectedId == null || bulkPorcentaje === '') return
    setBulkBusy(true)
    setActionError(null)
    try {
      await listasPreciosAPI.bulkUpdate(selectedId, {
        porcentaje: Number.parseFloat(bulkPorcentaje),
        preview: false,
      })
      setBulkPreview(null)
      setBulkPorcentaje('')
      await loadDetail(selectedId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setBulkBusy(false)
    }
  }

  const monedaDetail = detail?.moneda ?? 'ARS'

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="listas-precios-page">
        <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>

        {actionError ? (
          <div
            role="alert"
            data-testid="listas-precios-error"
            className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          >
            {actionError}
          </div>
        ) : null}

        <CanAccess permission="products.manage">
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="mb-6 grid gap-3 rounded border border-slate-300 p-4 dark:border-slate-700 md:grid-cols-4"
            data-testid="listas-precios-create-form"
          >
            <label className="grid gap-1 text-sm">
              {t('form.nombre')} *
              <input
                data-testid="listas-precios-nombre"
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={80}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('form.moneda')}
              <input
                data-testid="listas-precios-moneda"
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                maxLength={3}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('form.vigenciaHasta')}
              <input
                data-testid="listas-precios-vigencia"
                type="date"
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={vigenciaHasta}
                onChange={(e) => setVigenciaHasta(e.target.value)}
              />
            </label>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="listas-precios-default"
                  type="checkbox"
                  checked={esDefault}
                  onChange={(e) => setEsDefault(e.target.checked)}
                />
                {t('form.esDefault')}
              </label>
            </div>
            <button
              type="submit"
              data-testid="listas-precios-crear"
              className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 md:col-span-1"
            >
              {tc('actions.new')}
            </button>
          </form>
        </CanAccess>

        <AsyncWrapper loading={loading} error={loadError}>
          {listas.length === 0 ? (
            <p data-testid="listas-precios-empty" className="text-slate-500 dark:text-slate-400">
              {t('empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" data-testid="listas-precios-table">
                <thead>
                  <tr className="border-b border-slate-300 text-left dark:border-slate-700">
                    <th className="py-2 pr-3">{t('columns.nombre')}</th>
                    <th className="py-2 pr-3">{t('columns.moneda')}</th>
                    <th className="py-2 pr-3">{t('columns.items')}</th>
                    <th className="py-2 pr-3">{t('columns.clientes')}</th>
                    <th className="py-2 pr-3">{t('columns.estado')}</th>
                    <th className="py-2 pr-3">{t('columns.acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {listas.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-200 dark:border-slate-800"
                      data-testid={`listas-precios-row-${row.id}`}
                    >
                      <td className="py-2 pr-3">
                        {row.nombre}
                        {row.esDefault ? (
                          <span className="ml-2 rounded bg-amber-200 px-1 text-xs text-amber-900">
                            {t('badge.default')}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">{row.moneda}</td>
                      <td className="py-2 pr-3">{row._count?.items ?? 0}</td>
                      <td className="py-2 pr-3">{row._count?.clientes ?? 0}</td>
                      <td className="py-2 pr-3">
                        {row.activa ? t('estado.activa') : t('estado.inactiva')}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-testid={`listas-precios-edit-${row.id}`}
                            className="text-sky-600 underline dark:text-sky-400"
                            onClick={() => setSelectedId(row.id)}
                          >
                            {t('actions.editItems')}
                          </button>
                          <CanAccess permission="products.manage">
                            <button
                              type="button"
                              data-testid={`listas-precios-toggle-${row.id}`}
                              className="text-slate-600 underline dark:text-slate-300"
                              onClick={() => void handleToggleActiva(row)}
                            >
                              {row.activa ? t('actions.deactivate') : t('actions.activate')}
                            </button>
                            <button
                              type="button"
                              data-testid={`listas-precios-delete-${row.id}`}
                              className="text-rose-600 underline dark:text-rose-400"
                              onClick={() => void handleDelete(row)}
                            >
                              {t('actions.delete')}
                            </button>
                          </CanAccess>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>

        {selectedId != null ? (
          <section
            className="mt-8 rounded border border-slate-300 p-4 dark:border-slate-700"
            aria-labelledby="listas-precios-detail-title"
            data-testid="listas-precios-detail"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="listas-precios-detail-title" className="text-xl font-semibold">
                {t('detail.title', { nombre: detail?.nombre ?? '' })}
              </h2>
              <button
                type="button"
                data-testid="listas-precios-detail-close"
                className="text-slate-500 underline"
                onClick={() => setSelectedId(null)}
              >
                {t('actions.close')}
              </button>
            </div>

            {detailLoading ? (
              <p data-testid="listas-precios-detail-loading">{t('detail.loading')}</p>
            ) : detail ? (
              <>
                <CanAccess permission="products.manage">
                  <form
                    onSubmit={(e) => void handleAddItem(e)}
                    className="mb-6 grid gap-3 rounded border border-slate-200 p-3 dark:border-slate-700"
                    data-testid="listas-precios-item-form"
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="grid gap-1 text-sm">
                        {t('item.articulo')} *
                        <select
                          data-testid="listas-precios-item-articulo"
                          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                          value={itemArticuloId}
                          onChange={(e) => setItemArticuloId(e.target.value)}
                          required
                        >
                          <option value="">—</option>
                          {availableArticulos.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.codigo} — {a.descripcion}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm">
                        {t('item.tipoPrecio')}
                        <select
                          data-testid="listas-precios-item-tipo"
                          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                          value={itemTipo}
                          onChange={(e) => setItemTipo(e.target.value as TipoPrecio)}
                        >
                          <option value="fijo">{t('item.tipo.fijo')}</option>
                          <option value="porcentaje_sobre_base">
                            {t('item.tipo.porcentaje')}
                          </option>
                        </select>
                      </label>
                      {itemTipo === 'fijo' ? (
                        <label className="grid gap-1 text-sm">
                          {t('item.precio')} *
                          <input
                            data-testid="listas-precios-item-precio"
                            type="number"
                            min={0}
                            step="0.01"
                            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                            value={itemPrecio}
                            onChange={(e) => setItemPrecio(e.target.value)}
                            required
                          />
                        </label>
                      ) : (
                        <label className="grid gap-1 text-sm">
                          {t('item.porcentaje')} *
                          <input
                            data-testid="listas-precios-item-porcentaje"
                            type="number"
                            step="0.01"
                            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                            value={itemPorcentaje}
                            onChange={(e) => setItemPorcentaje(e.target.value)}
                            required
                          />
                        </label>
                      )}
                    </div>

                    <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-700">
                      <legend className="px-1 text-sm font-semibold">{t('item.tramos')}</legend>
                      {itemEscalonados.map((esc, idx) => (
                        <div key={idx} className="mb-2 grid gap-2 md:grid-cols-4">
                          <input
                            data-testid={`listas-precios-tramo-desde-${idx}`}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder={t('item.desde')}
                            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                            value={esc.cantidadDesde}
                            onChange={(e) => updateEscalonado(idx, 'cantidadDesde', e.target.value)}
                          />
                          <input
                            data-testid={`listas-precios-tramo-hasta-${idx}`}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder={t('item.hasta')}
                            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                            value={esc.cantidadHasta}
                            onChange={(e) => updateEscalonado(idx, 'cantidadHasta', e.target.value)}
                          />
                          <input
                            data-testid={`listas-precios-tramo-precio-${idx}`}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder={t('item.precio')}
                            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                            value={esc.precio}
                            onChange={(e) => updateEscalonado(idx, 'precio', e.target.value)}
                          />
                          <button
                            type="button"
                            data-testid={`listas-precios-tramo-remove-${idx}`}
                            className="text-rose-600 underline dark:text-rose-400"
                            onClick={() => removeEscalonadoRow(idx)}
                          >
                            {t('actions.delete')}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        data-testid="listas-precios-tramo-add"
                        className="text-sky-600 underline dark:text-sky-400"
                        onClick={addEscalonadoRow}
                      >
                        {t('item.addTramo')}
                      </button>
                    </fieldset>

                    <button
                      type="submit"
                      data-testid="listas-precios-item-submit"
                      className="justify-self-start rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                    >
                      {t('item.save')}
                    </button>
                  </form>

                  <div
                    className="mb-6 grid gap-2 rounded border border-slate-200 p-3 dark:border-slate-700"
                    data-testid="listas-precios-bulk"
                  >
                    <h3 className="font-semibold">{t('bulk.title')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('bulk.hint')}</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="grid gap-1 text-sm">
                        {t('bulk.porcentaje')}
                        <input
                          data-testid="listas-precios-bulk-porcentaje"
                          type="number"
                          step="0.01"
                          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                          value={bulkPorcentaje}
                          onChange={(e) => setBulkPorcentaje(e.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        data-testid="listas-precios-bulk-preview"
                        disabled={bulkBusy || bulkPorcentaje === ''}
                        className="rounded bg-slate-600 px-3 py-2 text-white disabled:opacity-50"
                        onClick={() => void handleBulkPreview()}
                      >
                        {t('bulk.preview')}
                      </button>
                      {bulkPreview ? (
                        <button
                          type="button"
                          data-testid="listas-precios-bulk-apply"
                          disabled={bulkBusy}
                          className="rounded bg-amber-600 px-3 py-2 text-white disabled:opacity-50"
                          onClick={() => void handleBulkApply()}
                        >
                          {t('bulk.apply')}
                        </button>
                      ) : null}
                    </div>
                    {bulkPreview ? (
                      <div data-testid="listas-precios-bulk-result" className="text-sm">
                        <p className="mb-2 font-medium">
                          {t('bulk.afectados', { count: bulkPreview.afectados })}
                        </p>
                        <ul className="space-y-1">
                          {bulkPreview.ejemplos.map((ej) => (
                            <li key={ej.listaPrecioItemId}>
                              {articuloLabel(ej.articuloId)}: {money(ej.precioActual, monedaDetail)} →{' '}
                              {money(ej.precioNuevo, monedaDetail)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </CanAccess>

                {(detail.items ?? []).length === 0 ? (
                  <p data-testid="listas-precios-items-empty" className="text-slate-500 dark:text-slate-400">
                    {t('detail.emptyItems')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm" data-testid="listas-precios-items-table">
                      <thead>
                        <tr className="border-b border-slate-300 text-left dark:border-slate-700">
                          <th className="py-2 pr-3">{t('item.articulo')}</th>
                          <th className="py-2 pr-3">{t('item.tipoPrecio')}</th>
                          <th className="py-2 pr-3">{t('item.valor')}</th>
                          <th className="py-2 pr-3">{t('item.tramos')}</th>
                          <th className="py-2 pr-3">{t('columns.acciones')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items ?? []).map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-200 dark:border-slate-800"
                            data-testid={`listas-precios-item-row-${item.id}`}
                          >
                            <td className="py-2 pr-3">
                              {item.articulo
                                ? `${item.articulo.codigo} — ${item.articulo.descripcion}`
                                : articuloLabel(item.articuloId)}
                            </td>
                            <td className="py-2 pr-3">
                              {item.tipoPrecio === 'fijo'
                                ? t('item.tipo.fijo')
                                : t('item.tipo.porcentaje')}
                            </td>
                            <td className="py-2 pr-3">
                              {item.tipoPrecio === 'fijo'
                                ? money(item.precio, monedaDetail)
                                : `${item.porcentaje ?? 0}%`}
                            </td>
                            <td className="py-2 pr-3">{item.escalonados?.length ?? 0}</td>
                            <td className="py-2 pr-3">
                              <CanAccess permission="products.manage">
                                <button
                                  type="button"
                                  data-testid={`listas-precios-item-remove-${item.id}`}
                                  className="text-rose-600 underline dark:text-rose-400"
                                  onClick={() => void handleRemoveItem(item.id)}
                                >
                                  {t('actions.delete')}
                                </button>
                              </CanAccess>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </section>
        ) : null}
      </div>
    </ErrorBoundary>
  )
}
