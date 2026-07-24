import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  OrdenProduccionDisponibilidad,
  OrdenProduccionRow,
} from '@bizcode/types'
import { ordenesProduccionAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'

type ActionState = 'idle' | 'create' | 'start' | 'complete' | 'cancel' | 'purchase'

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)
}

function formatOrderNumber(numero: number): string {
  return `OP-${String(numero).padStart(5, '0')}`
}

function parseConsumos(
  raw: Record<number, string>,
): Array<{ articuloId: number; cantidadReal: number }> {
  return Object.entries(raw)
    .map(([articuloId, value]) => ({
      articuloId: Number(articuloId),
      cantidadReal: Number(value),
    }))
    .filter((row) => Number.isFinite(row.cantidadReal) && row.cantidadReal >= 0)
}

/**
 * @en Production orders page: planning from BOM, availability, completion and purchase suggestion (#249).
 * @es Página de órdenes de producción: planificación BOM, disponibilidad, cierre y sugerencia de compra (#249).
 * @pt-BR Página de ordens de produção: planejamento BOM, disponibilidade, conclusão e sugestão de compra (#249).
 */
export default function OrdenesProduccionPage() {
  const { t } = useTranslation('ordenesProduccion')
  const formId = useId()

  const [rows, setRows] = useState<OrdenProduccionRow[]>([])
  const [selected, setSelected] = useState<OrdenProduccionRow | null>(null)
  const [disponibilidad, setDisponibilidad] = useState<OrdenProduccionDisponibilidad | null>(null)

  const [createArticuloId, setCreateArticuloId] = useState('')
  const [createCantidad, setCreateCantidad] = useState('1')
  const [createDepositoId, setCreateDepositoId] = useState('')
  const [createObservaciones, setCreateObservaciones] = useState('')

  const [cantidadReal, setCantidadReal] = useState('')
  const [consumos, setConsumos] = useState<Record<number, string>>({})
  const [proveedorId, setProveedorId] = useState('')

  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [action, setAction] = useState<ActionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ordenesProduccionAPI.list({ limit: 100, offset: 0 })
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

  const selectOrden = useCallback(
    async (id: number) => {
      setError(null)
      setSuccess(null)
      setDetailLoading(true)
      try {
        const [detail, availability] = await Promise.all([
          ordenesProduccionAPI.getById(id),
          ordenesProduccionAPI.getDisponibilidad(id),
        ])
        setSelected(detail)
        setDisponibilidad(availability)
        setCantidadReal(String(detail.cantidadReal ?? detail.cantidadPlanif))
        setConsumos(
          Object.fromEntries(
            detail.insumos.map((insumo) => [
              insumo.articuloId,
              String(insumo.cantidadReal ?? (insumo.esOpcional ? 0 : insumo.cantidadPlan)),
            ]),
          ),
        )
      } catch {
        setError(t('errors.detail'))
        setSelected(null)
        setDisponibilidad(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [t],
  )

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const articuloId = Number(createArticuloId)
    const cantidad = Number(createCantidad)
    const deposito = createDepositoId.trim().length > 0 ? Number(createDepositoId) : undefined

    if (!Number.isFinite(articuloId) || articuloId <= 0) {
      setError(t('errors.invalidArticulo'))
      return
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setError(t('errors.invalidCantidad'))
      return
    }
    if (deposito !== undefined && (!Number.isFinite(deposito) || deposito <= 0)) {
      setError(t('errors.invalidDeposito'))
      return
    }

    setAction('create')
    setError(null)
    setSuccess(null)
    try {
      const created = await ordenesProduccionAPI.create({
        articuloId,
        cantidadPlanif: cantidad,
        ...(deposito !== undefined ? { depositoId: deposito } : {}),
        observaciones: createObservaciones.trim() || null,
      })
      setCreateArticuloId('')
      setCreateCantidad('1')
      setCreateDepositoId('')
      setCreateObservaciones('')
      await loadData()
      await selectOrden(created.id)
      setSuccess(t('success.create'))
    } catch {
      setError(t('errors.create'))
    } finally {
      setAction('idle')
    }
  }

  const startSelected = async () => {
    if (!selected) return
    setAction('start')
    setError(null)
    setSuccess(null)
    try {
      const updated = await ordenesProduccionAPI.iniciar(selected.id)
      await loadData()
      await selectOrden(updated.id)
      setSuccess(t('success.start'))
    } catch {
      setError(t('errors.start'))
    } finally {
      setAction('idle')
    }
  }

  const completeSelected = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    const produced = Number(cantidadReal)
    if (!Number.isFinite(produced) || produced <= 0) {
      setError(t('errors.invalidCantidadReal'))
      return
    }
    setAction('complete')
    setError(null)
    setSuccess(null)
    try {
      const updated = await ordenesProduccionAPI.completar(selected.id, {
        cantidadReal: produced,
        insumos: parseConsumos(consumos),
      })
      await loadData()
      await selectOrden(updated.id)
      setSuccess(t('success.complete'))
    } catch {
      setError(t('errors.complete'))
    } finally {
      setAction('idle')
    }
  }

  const cancelSelected = async () => {
    if (!selected) return
    setAction('cancel')
    setError(null)
    setSuccess(null)
    try {
      const updated = await ordenesProduccionAPI.cancelar(selected.id)
      await loadData()
      await selectOrden(updated.id)
      setSuccess(t('success.cancel'))
    } catch {
      setError(t('errors.cancel'))
    } finally {
      setAction('idle')
    }
  }

  const suggestPurchase = async () => {
    if (!selected) return
    const proveedor = Number(proveedorId)
    if (!Number.isFinite(proveedor) || proveedor <= 0) {
      setError(t('errors.invalidProveedor'))
      return
    }
    setAction('purchase')
    setError(null)
    setSuccess(null)
    try {
      const result = await ordenesProduccionAPI.sugerirCompra(selected.id, proveedor)
      setSuccess(t('success.purchase', { id: result.ordenCompraId }))
    } catch {
      setError(t('errors.purchase'))
    } finally {
      setAction('idle')
    }
  }

  const missingLines = disponibilidad?.lineas.filter((linea) => linea.faltante > 0) ?? []

  return (
    <ErrorBoundary>
      <main className="space-y-6 p-6" data-testid="ordenes-produccion-page">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </header>

        {error ? (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            data-testid="ordenes-produccion-error"
          >
            {error}
          </div>
        ) : null}
        {success ? (
          <p
            role="status"
            className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            data-testid="ordenes-produccion-success"
          >
            {success}
          </p>
        ) : null}

        <section aria-labelledby={`${formId}-list-title`}>
          <h2 id={`${formId}-list-title`} className="mb-3 text-lg font-semibold">
            {t('list.title')}
          </h2>
          {loading ? (
            <p role="status" aria-busy="true" data-testid="ordenes-produccion-loading">
              {t('states.loading')}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400" data-testid="ordenes-produccion-empty">
              {t('states.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm" data-testid="ordenes-produccion-table">
                <caption className="sr-only">{t('list.caption')}</caption>
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-3 py-2">
                      {t('fields.numero')}
                    </th>
                    <th scope="col" className="px-3 py-2">
                      {t('fields.articulo')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      {t('fields.cantidadPlanif')}
                    </th>
                    <th scope="col" className="px-3 py-2">
                      {t('fields.estado')}
                    </th>
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">{t('actions.select')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-t border-slate-200 dark:border-slate-700 ${
                        selected?.id === row.id ? 'bg-blue-50 dark:bg-slate-900' : ''
                      }`}
                      data-testid={`ordenes-produccion-row-${row.id}`}
                    >
                      <td className="px-3 py-2 font-mono">{formatOrderNumber(row.numero)}</td>
                      <td className="px-3 py-2">
                        {row.articulo
                          ? `${row.articulo.codigo} — ${row.articulo.descripcion}`
                          : String(row.articuloId)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatNumber(row.cantidadPlanif)}
                      </td>
                      <td className="px-3 py-2">{t(`estados.${row.estado}`)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => void selectOrden(row.id)}
                          className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-600"
                          data-testid={`ordenes-produccion-select-${row.id}`}
                          aria-pressed={selected?.id === row.id}
                        >
                          {t('actions.select')}
                        </button>
                      </td>
                    </tr>
                  ))}
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
              data-testid="ordenes-produccion-create-form"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label htmlFor={`${formId}-articulo`} className="text-sm font-medium">
                  {t('fields.articuloId')}
                  <input
                    id={`${formId}-articulo`}
                    type="number"
                    min="1"
                    required
                    value={createArticuloId}
                    onChange={(event) => setCreateArticuloId(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="ordenes-produccion-articulo-id"
                  />
                </label>
                <label htmlFor={`${formId}-cantidad`} className="text-sm font-medium">
                  {t('fields.cantidadPlanif')}
                  <input
                    id={`${formId}-cantidad`}
                    type="number"
                    min="0.0001"
                    step="any"
                    required
                    value={createCantidad}
                    onChange={(event) => setCreateCantidad(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="ordenes-produccion-cantidad"
                  />
                </label>
                <label htmlFor={`${formId}-deposito`} className="text-sm font-medium">
                  {t('fields.depositoId')}
                  <input
                    id={`${formId}-deposito`}
                    type="number"
                    min="1"
                    value={createDepositoId}
                    onChange={(event) => setCreateDepositoId(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="ordenes-produccion-deposito"
                  />
                </label>
                <label htmlFor={`${formId}-obs`} className="text-sm font-medium">
                  {t('fields.observaciones')}
                  <input
                    id={`${formId}-obs`}
                    type="text"
                    value={createObservaciones}
                    onChange={(event) => setCreateObservaciones(event.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                    data-testid="ordenes-produccion-observaciones"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={action !== 'idle'}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                data-testid="ordenes-produccion-create"
              >
                {action === 'create' ? t('actions.saving') : t('actions.create')}
              </button>
            </form>
          </section>
        </CanAccess>

        {!selected ? (
          <p
            className="text-slate-600 dark:text-slate-400"
            data-testid="ordenes-produccion-no-selection"
          >
            {t('states.noSelection')}
          </p>
        ) : (
          <>
            <section
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              aria-labelledby={`${formId}-detail-title`}
              data-testid="ordenes-produccion-detail"
            >
              <h2 id={`${formId}-detail-title`} className="mb-3 text-lg font-semibold">
                {t('detail.title', { numero: formatOrderNumber(selected.numero) })}
              </h2>
              {detailLoading ? (
                <p role="status" aria-busy="true" data-testid="ordenes-produccion-detail-loading">
                  {t('states.detailLoading')}
                </p>
              ) : (
                <>
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-xs text-slate-500">{t('fields.estado')}</dt>
                      <dd data-testid="ordenes-produccion-detail-estado">
                        {t(`estados.${selected.estado}`)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('fields.cantidadPlanif')}</dt>
                      <dd className="font-mono">{formatNumber(selected.cantidadPlanif)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('fields.cantidadReal')}</dt>
                      <dd className="font-mono" data-testid="ordenes-produccion-detail-real">
                        {selected.cantidadReal === null
                          ? t('states.pending')
                          : formatNumber(selected.cantidadReal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('fields.costoTotal')}</dt>
                      <dd className="font-mono" data-testid="ordenes-produccion-detail-costo">
                        {selected.costoTotal === null
                          ? t('states.pending')
                          : formatNumber(selected.costoTotal)}
                      </dd>
                    </div>
                  </dl>

                  {disponibilidad ? (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-semibold">{t('availability.title')}</h3>
                      {disponibilidad.suficiente ? (
                        <p
                          className="text-sm text-emerald-700 dark:text-emerald-300"
                          data-testid="ordenes-produccion-availability-ok"
                        >
                          {t('availability.sufficient')}
                        </p>
                      ) : (
                        <p
                          role="alert"
                          className="text-sm text-amber-800 dark:text-amber-200"
                          data-testid="ordenes-produccion-availability-warning"
                        >
                          {t('availability.insufficient', { count: missingLines.length })}
                        </p>
                      )}
                      <div className="mt-2 overflow-x-auto">
                        <table
                          className="w-full text-left text-sm"
                          data-testid="ordenes-produccion-availability-table"
                        >
                          <caption className="sr-only">{t('availability.caption')}</caption>
                          <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                              <th scope="col" className="px-3 py-2">
                                {t('fields.articulo')}
                              </th>
                              <th scope="col" className="px-3 py-2 text-right">
                                {t('availability.needed')}
                              </th>
                              <th scope="col" className="px-3 py-2 text-right">
                                {t('availability.available')}
                              </th>
                              <th scope="col" className="px-3 py-2 text-right">
                                {t('availability.missing')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {disponibilidad.lineas.map((linea) => (
                              <tr
                                key={linea.articuloId}
                                className="border-t border-slate-200 dark:border-slate-700"
                                data-testid={`ordenes-produccion-availability-row-${linea.articuloId}`}
                              >
                                <td className="px-3 py-2">
                                  {linea.codigo} — {linea.descripcion}
                                </td>
                                <td className="px-3 py-2 text-right font-mono">
                                  {formatNumber(linea.necesario)} {t(`units.${linea.unidad}`)}
                                </td>
                                <td className="px-3 py-2 text-right font-mono">
                                  {linea.mueveStock ? formatNumber(linea.disponible) : '—'}
                                </td>
                                <td className="px-3 py-2 text-right font-mono">
                                  {formatNumber(linea.faltante)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>

            <CanAccess permission="inventory.adjust">
              {selected.estado === 'planificada' ? (
                <section
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  aria-labelledby={`${formId}-start-title`}
                >
                  <h2 id={`${formId}-start-title`} className="mb-3 text-lg font-semibold">
                    {t('start.title')}
                  </h2>
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                    {t('start.help')}
                  </p>
                  <button
                    type="button"
                    onClick={() => void startSelected()}
                    disabled={action !== 'idle'}
                    className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                    data-testid="ordenes-produccion-start"
                  >
                    {action === 'start' ? t('actions.starting') : t('actions.start')}
                  </button>
                </section>
              ) : null}

              {selected.estado === 'en_proceso' ? (
                <section
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  aria-labelledby={`${formId}-complete-title`}
                >
                  <h2 id={`${formId}-complete-title`} className="mb-3 text-lg font-semibold">
                    {t('complete.title')}
                  </h2>
                  <form
                    onSubmit={(event) => void completeSelected(event)}
                    className="space-y-4"
                    data-testid="ordenes-produccion-complete-form"
                  >
                    <label htmlFor={`${formId}-real`} className="block text-sm font-medium">
                      {t('fields.cantidadReal')}
                      <input
                        id={`${formId}-real`}
                        type="number"
                        min="0.0001"
                        step="any"
                        required
                        value={cantidadReal}
                        onChange={(event) => setCantidadReal(event.target.value)}
                        className="mt-1 block w-full max-w-xs rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                        data-testid="ordenes-produccion-cantidad-real"
                      />
                    </label>

                    <fieldset className="space-y-2">
                      <legend className="text-sm font-semibold">{t('complete.consumption')}</legend>
                      {selected.insumos.map((insumo) => (
                        <label
                          key={insumo.id}
                          htmlFor={`${formId}-consumo-${insumo.id}`}
                          className="block text-xs font-medium"
                        >
                          {insumo.articulo
                            ? `${insumo.articulo.codigo} — ${insumo.articulo.descripcion}`
                            : String(insumo.articuloId)}{' '}
                          ({t(`units.${insumo.unidad}`)}, {t('complete.planned')}:{' '}
                          {formatNumber(insumo.cantidadPlan)})
                          <input
                            id={`${formId}-consumo-${insumo.id}`}
                            type="number"
                            min="0"
                            step="any"
                            value={consumos[insumo.articuloId] ?? ''}
                            onChange={(event) =>
                              setConsumos((prev) => ({
                                ...prev,
                                [insumo.articuloId]: event.target.value,
                              }))
                            }
                            className="mt-1 block w-full max-w-xs rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-700"
                            data-testid={`ordenes-produccion-consumo-${insumo.articuloId}`}
                          />
                        </label>
                      ))}
                    </fieldset>

                    <button
                      type="submit"
                      disabled={action !== 'idle'}
                      className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      data-testid="ordenes-produccion-complete"
                    >
                      {action === 'complete' ? t('actions.completing') : t('actions.complete')}
                    </button>
                  </form>
                </section>
              ) : null}
            </CanAccess>

            <CanAccess permission="products.manage">
              <section
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                aria-labelledby={`${formId}-actions-title`}
              >
                <h2 id={`${formId}-actions-title`} className="mb-3 text-lg font-semibold">
                  {t('purchase.title')}
                </h2>
                <div className="flex flex-wrap items-end gap-3">
                  <label htmlFor={`${formId}-proveedor`} className="text-sm font-medium">
                    {t('fields.proveedorId')}
                    <input
                      id={`${formId}-proveedor`}
                      type="number"
                      min="1"
                      value={proveedorId}
                      onChange={(event) => setProveedorId(event.target.value)}
                      className="mt-1 block rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                      data-testid="ordenes-produccion-proveedor"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void suggestPurchase()}
                    disabled={action !== 'idle' || missingLines.length === 0}
                    className="rounded bg-slate-800 px-4 py-2 font-semibold text-white disabled:opacity-50 dark:bg-slate-600"
                    data-testid="ordenes-produccion-suggest-purchase"
                  >
                    {action === 'purchase' ? t('actions.suggesting') : t('actions.suggestPurchase')}
                  </button>
                  {selected.estado === 'planificada' || selected.estado === 'en_proceso' ? (
                    <button
                      type="button"
                      onClick={() => void cancelSelected()}
                      disabled={action !== 'idle'}
                      className="rounded bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      data-testid="ordenes-produccion-cancel"
                    >
                      {action === 'cancel' ? t('actions.cancelling') : t('actions.cancel')}
                    </button>
                  ) : null}
                </div>
              </section>
            </CanAccess>
          </>
        )}
      </main>
    </ErrorBoundary>
  )
}
