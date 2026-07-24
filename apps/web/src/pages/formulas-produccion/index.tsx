import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  FormulaCostoResult,
  FormulaInsumoInput,
  FormulaInsumoUnidad,
  FormulaProduccionRow,
  FormulaProyeccionResult,
} from '@bizcode/types'
import { FORMULA_INSUMO_UNIDADES } from '@bizcode/types'
import { formulasProduccionAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'

type ActionState = 'idle' | 'create' | 'update' | 'deactivate' | 'project'
type InsumoDraft = {
  key: string
  articuloId: string
  cantidad: string
  unidad: FormulaInsumoUnidad
  esOpcional: boolean
}

function createEmptyInsumo(): InsumoDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    articuloId: '',
    cantidad: '',
    unidad: 'unidad',
    esOpcional: false,
  }
}

function insumosFromRow(row: FormulaProduccionRow): InsumoDraft[] {
  if (row.insumos.length === 0) return [createEmptyInsumo()]
  return row.insumos.map((insumo) => ({
    key: `insumo-${insumo.id}`,
    articuloId: String(insumo.articuloId),
    cantidad: String(insumo.cantidad),
    unidad: insumo.unidad,
    esOpcional: insumo.esOpcional,
  }))
}

function parseInsumos(drafts: InsumoDraft[]): FormulaInsumoInput[] | null {
  const parsed: FormulaInsumoInput[] = []
  for (const draft of drafts) {
    const articuloId = Number(draft.articuloId)
    const cantidad = Number(draft.cantidad)
    if (!Number.isFinite(articuloId) || articuloId <= 0) continue
    if (!Number.isFinite(cantidad) || cantidad <= 0) continue
    parsed.push({
      articuloId,
      cantidad,
      unidad: draft.unidad,
      esOpcional: draft.esOpcional,
    })
  }
  return parsed.length > 0 ? parsed : null
}

/**
 * @en Production BOM formulas page: list, create, cost, projection, versioning (#248).
 * @es Página de fórmulas BOM: listado, alta, costo, proyección y versionado (#248).
 * @pt-BR Página de fórmulas BOM: listagem, criação, custo, projeção e versionamento (#248).
 */
export default function FormulasProduccionPage() {
  const { t } = useTranslation('formulasProduccion')
  const formId = useId()

  const [rows, setRows] = useState<FormulaProduccionRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selected, setSelected] = useState<FormulaProduccionRow | null>(null)
  const [costo, setCosto] = useState<FormulaCostoResult | null>(null)
  const [proyeccion, setProyeccion] = useState<FormulaProyeccionResult | null>(null)

  const [createArticuloId, setCreateArticuloId] = useState('')
  const [createRendimiento, setCreateRendimiento] = useState('1')
  const [createObservaciones, setCreateObservaciones] = useState('')
  const [createInsumos, setCreateInsumos] = useState<InsumoDraft[]>([createEmptyInsumo()])

  const [editRendimiento, setEditRendimiento] = useState('1')
  const [editObservaciones, setEditObservaciones] = useState('')
  const [editInsumos, setEditInsumos] = useState<InsumoDraft[]>([createEmptyInsumo()])
  const [unidades, setUnidades] = useState('1')

  const [loading, setLoading] = useState(true)
  const [costLoading, setCostLoading] = useState(false)
  const [action, setAction] = useState<ActionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetCreateForm = useCallback(() => {
    setCreateArticuloId('')
    setCreateRendimiento('1')
    setCreateObservaciones('')
    setCreateInsumos([createEmptyInsumo()])
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await formulasProduccionAPI.list({ limit: 100, offset: 0 })
      setRows(response.data)
    } catch {
      setError(t('errors.load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectFormula = useCallback(
    async (id: number) => {
      setSelectedId(id)
      setProyeccion(null)
      setCosto(null)
      setError(null)
      setSuccess(null)
      setCostLoading(true)
      try {
        const [detail, cost] = await Promise.all([
          formulasProduccionAPI.getById(id),
          formulasProduccionAPI.getCosto(id),
        ])
        setSelected(detail)
        setCosto(cost)
        if (detail.activa) {
          setEditRendimiento(String(detail.rendimiento))
          setEditObservaciones(detail.observaciones ?? '')
          setEditInsumos(insumosFromRow(detail))
        }
      } catch {
        setError(t('errors.cost'))
        setSelected(null)
        setCosto(null)
      } finally {
        setCostLoading(false)
      }
    },
    [t],
  )

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const articulo = Number(createArticuloId)
    const yieldValue = Number(createRendimiento)
    const parsedInsumos = parseInsumos(createInsumos)

    if (!Number.isFinite(articulo) || articulo <= 0) {
      setError(t('errors.invalidArticulo'))
      return
    }
    if (!Number.isFinite(yieldValue) || yieldValue <= 0) {
      setError(t('errors.invalidRendimiento'))
      return
    }
    if (!parsedInsumos) {
      setError(t('errors.invalidInsumos'))
      return
    }

    setAction('create')
    setError(null)
    setSuccess(null)
    try {
      const created = await formulasProduccionAPI.create({
        articuloId: articulo,
        rendimiento: yieldValue,
        observaciones: createObservaciones.trim() || null,
        insumos: parsedInsumos,
      })
      resetCreateForm()
      await loadData()
      await selectFormula(created.id)
      setSuccess(t('success.create'))
    } catch {
      setError(t('errors.create'))
    } finally {
      setAction('idle')
    }
  }

  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !selected.activa) return

    const yieldValue = Number(editRendimiento)
    const parsedInsumos = parseInsumos(editInsumos)
    if (!Number.isFinite(yieldValue) || yieldValue <= 0) {
      setError(t('errors.invalidRendimiento'))
      return
    }
    if (!parsedInsumos) {
      setError(t('errors.invalidInsumos'))
      return
    }

    setAction('update')
    setError(null)
    setSuccess(null)
    try {
      const updated = await formulasProduccionAPI.update(selected.id, {
        rendimiento: yieldValue,
        observaciones: editObservaciones.trim() || null,
        insumos: parsedInsumos,
      })
      await loadData()
      await selectFormula(updated.id)
      setSuccess(t('success.update'))
    } catch {
      setError(t('errors.update'))
    } finally {
      setAction('idle')
    }
  }

  const deactivateSelected = async () => {
    if (!selected || !selected.activa) return
    setAction('deactivate')
    setError(null)
    setSuccess(null)
    try {
      await formulasProduccionAPI.deactivate(selected.id)
      await loadData()
      await selectFormula(selected.id)
      setSuccess(t('success.deactivate'))
    } catch {
      setError(t('errors.deactivate'))
    } finally {
      setAction('idle')
    }
  }

  const runProjection = async () => {
    if (!selected) return
    const units = Number(unidades)
    if (!Number.isFinite(units) || units <= 0) {
      setError(t('errors.invalidUnidades'))
      return
    }
    setAction('project')
    setError(null)
    setSuccess(null)
    try {
      const result = await formulasProduccionAPI.proyectar(selected.id, units)
      setProyeccion(result)
    } catch {
      setError(t('errors.projection'))
    } finally {
      setAction('idle')
    }
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(
      value,
    )

  const articleLabel = (row: FormulaProduccionRow) =>
    row.articulo
      ? `${row.articulo.codigo} — ${row.articulo.descripcion}`
      : String(row.articuloId)

  return (
    <ErrorBoundary>
      <main className="space-y-6 p-6" data-testid="formulas-produccion-page">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </header>

        {error ? (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            data-testid="formulas-produccion-error"
          >
            {error}
          </div>
        ) : null}
        {success ? (
          <p
            role="status"
            className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            data-testid="formulas-produccion-success"
          >
            {success}
          </p>
        ) : null}

        <section aria-labelledby={`${formId}-list-title`}>
          <h2 id={`${formId}-list-title`} className="mb-3 text-lg font-semibold">
            {t('list.title')}
          </h2>
          {loading ? (
            <p role="status" aria-busy="true" data-testid="formulas-produccion-loading">
              {t('states.loading')}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400" data-testid="formulas-produccion-empty">
              {t('states.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm" data-testid="formulas-produccion-table">
                <caption className="sr-only">{t('list.caption')}</caption>
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-3 py-2">
                      {t('fields.articulo')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      {t('fields.version')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      {t('fields.rendimiento')}
                    </th>
                    <th scope="col" className="px-3 py-2">
                      {t('fields.activa')}
                    </th>
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">{t('actions.select')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isSelected = selectedId === row.id
                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-200 dark:border-slate-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-slate-900' : ''
                        }`}
                        data-testid={`formulas-produccion-row-${row.id}`}
                      >
                        <td className="px-3 py-2">{articleLabel(row)}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.version}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.rendimiento}</td>
                        <td className="px-3 py-2">
                          {row.activa ? t('status.active') : t('status.inactive')}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => void selectFormula(row.id)}
                            className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-600"
                            data-testid={`formulas-produccion-select-${row.id}`}
                            aria-pressed={isSelected}
                          >
                            {t('actions.select')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <CanAccess permission="products.manage">
          <section
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            aria-labelledby={`${formId}-create-title`}
          >
            <h2 id={`${formId}-create-title`} className="mb-3 text-lg font-semibold">
              {t('create.title')}
            </h2>
            <form
              onSubmit={(event) => void submitCreate(event)}
              className="space-y-4"
              data-testid="formulas-produccion-create-form"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label htmlFor={`${formId}-create-articulo`} className="text-sm font-medium">
                  {t('fields.articuloId')}
                  <input
                    id={`${formId}-create-articulo`}
                    type="number"
                    min="1"
                    required
                    value={createArticuloId}
                    onChange={(event) => setCreateArticuloId(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="formulas-produccion-articulo-id"
                  />
                </label>
                <label htmlFor={`${formId}-create-rendimiento`} className="text-sm font-medium">
                  {t('fields.rendimiento')}
                  <input
                    id={`${formId}-create-rendimiento`}
                    type="number"
                    min="0.0001"
                    step="any"
                    required
                    value={createRendimiento}
                    onChange={(event) => setCreateRendimiento(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="formulas-produccion-rendimiento"
                  />
                </label>
                <label htmlFor={`${formId}-create-obs`} className="text-sm font-medium sm:col-span-2 lg:col-span-1">
                  {t('fields.observaciones')}
                  <input
                    id={`${formId}-create-obs`}
                    type="text"
                    value={createObservaciones}
                    onChange={(event) => setCreateObservaciones(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="formulas-produccion-observaciones"
                  />
                </label>
              </div>

              <InsumosEditor
                formId={`${formId}-create`}
                insumos={createInsumos}
                onChange={(key, patch) =>
                  setCreateInsumos((prev) =>
                    prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
                  )
                }
                onAdd={() => setCreateInsumos((prev) => [...prev, createEmptyInsumo()])}
                onRemove={(key) =>
                  setCreateInsumos((prev) =>
                    prev.length <= 1 ? prev : prev.filter((row) => row.key !== key),
                  )
                }
                testIdPrefix="formulas-produccion"
              />

              <button
                type="submit"
                disabled={action !== 'idle'}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                data-testid="formulas-produccion-create"
              >
                {action === 'create' ? t('actions.saving') : t('actions.create')}
              </button>
            </form>
          </section>
        </CanAccess>

        {!selectedId ? (
          <p className="text-slate-600 dark:text-slate-400" data-testid="formulas-produccion-no-selection">
            {t('states.noSelection')}
          </p>
        ) : (
          <>
            <section
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              aria-labelledby={`${formId}-cost-title`}
              data-testid="formulas-produccion-cost-panel"
            >
              <h2 id={`${formId}-cost-title`} className="mb-3 text-lg font-semibold">
                {t('cost.title')}
              </h2>
              {costLoading ? (
                <p role="status" aria-busy="true" data-testid="formulas-produccion-cost-loading">
                  {t('states.costLoading')}
                </p>
              ) : costo ? (
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="formulas-produccion-cost">
                  <div>
                    <dt className="text-xs text-slate-500">{t('cost.unitCost')}</dt>
                    <dd className="font-mono text-lg" data-testid="formulas-produccion-cost-unitario">
                      {formatMoney(costo.costoUnitario)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{t('cost.salePrice')}</dt>
                    <dd className="font-mono text-lg" data-testid="formulas-produccion-cost-precio">
                      {formatMoney(costo.precioVenta)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{t('cost.marginPct')}</dt>
                    <dd className="font-mono text-lg" data-testid="formulas-produccion-cost-margen">
                      {formatMoney(costo.margenPorcentaje)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{t('cost.inputsCost')}</dt>
                    <dd className="font-mono text-lg">{formatMoney(costo.costoInsumos)}</dd>
                  </div>
                </dl>
              ) : null}
            </section>

            <section
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              aria-labelledby={`${formId}-proj-title`}
            >
              <h2 id={`${formId}-proj-title`} className="mb-3 text-lg font-semibold">
                {t('projection.title')}
              </h2>
              <div className="flex flex-wrap items-end gap-3">
                <label htmlFor={`${formId}-unidades`} className="text-sm font-medium">
                  {t('projection.units')}
                  <input
                    id={`${formId}-unidades`}
                    type="number"
                    min="0.0001"
                    step="any"
                    value={unidades}
                    onChange={(event) => setUnidades(event.target.value)}
                    className="mt-1 block rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="formulas-produccion-unidades"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void runProjection()}
                  disabled={action !== 'idle' || !selected}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                  data-testid="formulas-produccion-project"
                >
                  {action === 'project' ? t('actions.projecting') : t('actions.project')}
                </button>
              </div>
              {proyeccion ? (
                <div className="mt-4 overflow-x-auto">
                  <p className="mb-2 text-sm" data-testid="formulas-produccion-proyeccion-corridas">
                    {t('projection.runs')}: {proyeccion.corridas}
                  </p>
                  <table
                    className="w-full text-left text-sm"
                    data-testid="formulas-produccion-proyeccion-table"
                  >
                    <caption className="sr-only">{t('projection.caption')}</caption>
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th scope="col" className="px-3 py-2">
                          {t('fields.articulo')}
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          {t('fields.cantidad')}
                        </th>
                        <th scope="col" className="px-3 py-2">
                          {t('fields.unidad')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyeccion.lineas.map((linea) => (
                        <tr
                          key={`${linea.articuloId}-${linea.unidad}`}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-3 py-2">
                            {linea.codigo} — {linea.descripcion}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{linea.cantidad}</td>
                          <td className="px-3 py-2">{t(`units.${linea.unidad}`)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>

            {selected?.activa ? (
              <CanAccess permission="products.manage">
                <section
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  aria-labelledby={`${formId}-edit-title`}
                >
                  <h2 id={`${formId}-edit-title`} className="mb-3 text-lg font-semibold">
                    {t('edit.title')}
                  </h2>
                  <form
                    onSubmit={(event) => void submitUpdate(event)}
                    className="space-y-4"
                    data-testid="formulas-produccion-update-form"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label htmlFor={`${formId}-edit-rendimiento`} className="text-sm font-medium">
                        {t('fields.rendimiento')}
                        <input
                          id={`${formId}-edit-rendimiento`}
                          type="number"
                          min="0.0001"
                          step="any"
                          required
                          value={editRendimiento}
                          onChange={(event) => setEditRendimiento(event.target.value)}
                          className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                          data-testid="formulas-produccion-update-rendimiento"
                        />
                      </label>
                      <label htmlFor={`${formId}-edit-obs`} className="text-sm font-medium">
                        {t('fields.observaciones')}
                        <input
                          id={`${formId}-edit-obs`}
                          type="text"
                          value={editObservaciones}
                          onChange={(event) => setEditObservaciones(event.target.value)}
                          className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                          data-testid="formulas-produccion-update-observaciones"
                        />
                      </label>
                    </div>

                    <InsumosEditor
                      formId={`${formId}-edit`}
                      insumos={editInsumos}
                      onChange={(key, patch) =>
                        setEditInsumos((prev) =>
                          prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
                        )
                      }
                      onAdd={() => setEditInsumos((prev) => [...prev, createEmptyInsumo()])}
                      onRemove={(key) =>
                        setEditInsumos((prev) =>
                          prev.length <= 1 ? prev : prev.filter((row) => row.key !== key),
                        )
                      }
                      testIdPrefix="formulas-produccion-update"
                    />

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={action !== 'idle'}
                        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                        data-testid="formulas-produccion-update"
                      >
                        {action === 'update' ? t('actions.saving') : t('actions.update')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deactivateSelected()}
                        disabled={action !== 'idle'}
                        className="rounded bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                        data-testid="formulas-produccion-deactivate"
                      >
                        {action === 'deactivate' ? t('actions.deactivating') : t('actions.deactivate')}
                      </button>
                    </div>
                  </form>
                </section>
              </CanAccess>
            ) : null}
          </>
        )}
      </main>
    </ErrorBoundary>
  )
}

type InsumosEditorProps = {
  formId: string
  insumos: InsumoDraft[]
  onChange: (key: string, patch: Partial<InsumoDraft>) => void
  onAdd: () => void
  onRemove: (key: string) => void
  testIdPrefix: string
}

function InsumosEditor({
  formId,
  insumos,
  onChange,
  onAdd,
  onRemove,
  testIdPrefix,
}: InsumosEditorProps) {
  const { t } = useTranslation('formulasProduccion')

  return (
    <div data-testid={`${testIdPrefix}-insumos`}>
      <h3 className="mb-2 text-sm font-semibold">{t('insumos.title')}</h3>
      <div className="space-y-2">
        {insumos.map((insumo, index) => (
          <div
            key={insumo.key}
            className="grid gap-2 rounded border border-slate-200 p-2 sm:grid-cols-5 dark:border-slate-600"
            data-testid={`${testIdPrefix}-insumo-row-${index}`}
          >
            <label
              htmlFor={`${formId}-insumo-art-${insumo.key}`}
              className="text-xs font-medium sm:col-span-1"
            >
              {t('fields.articuloId')}
              <input
                id={`${formId}-insumo-art-${insumo.key}`}
                type="number"
                min="1"
                value={insumo.articuloId}
                onChange={(event) => onChange(insumo.key, { articuloId: event.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-700"
                data-testid={`${testIdPrefix}-insumo-articulo-${index}`}
              />
            </label>
            <label
              htmlFor={`${formId}-insumo-qty-${insumo.key}`}
              className="text-xs font-medium sm:col-span-1"
            >
              {t('fields.cantidad')}
              <input
                id={`${formId}-insumo-qty-${insumo.key}`}
                type="number"
                min="0.0001"
                step="any"
                value={insumo.cantidad}
                onChange={(event) => onChange(insumo.key, { cantidad: event.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-700"
                data-testid={`${testIdPrefix}-insumo-cantidad-${index}`}
              />
            </label>
            <label
              htmlFor={`${formId}-insumo-unit-${insumo.key}`}
              className="text-xs font-medium sm:col-span-1"
            >
              {t('fields.unidad')}
              <select
                id={`${formId}-insumo-unit-${insumo.key}`}
                value={insumo.unidad}
                onChange={(event) =>
                  onChange(insumo.key, { unidad: event.target.value as FormulaInsumoUnidad })
                }
                className="mt-1 block w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-700"
                data-testid={`${testIdPrefix}-insumo-unidad-${index}`}
              >
                {FORMULA_INSUMO_UNIDADES.map((unit) => (
                  <option key={unit} value={unit}>
                    {t(`units.${unit}`)}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor={`${formId}-insumo-opt-${insumo.key}`}
              className="flex items-end gap-2 text-xs font-medium sm:col-span-1"
            >
              <input
                id={`${formId}-insumo-opt-${insumo.key}`}
                type="checkbox"
                checked={insumo.esOpcional}
                onChange={(event) => onChange(insumo.key, { esOpcional: event.target.checked })}
                data-testid={`${testIdPrefix}-insumo-opcional-${index}`}
              />
              {t('insumos.optional')}
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onRemove(insumo.key)}
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                data-testid={`${testIdPrefix}-insumo-remove-${index}`}
              >
                {t('insumos.remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 rounded border border-slate-300 px-3 py-1 text-sm dark:border-slate-600"
        data-testid={`${testIdPrefix}-insumo-add`}
      >
        {t('insumos.add')}
      </button>
    </div>
  )
}
