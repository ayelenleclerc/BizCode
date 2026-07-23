import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogVariantsAPI } from '@/lib/api'
import type { CategoriaArticuloRow, CategoriaAtributoRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

/**
 * @en Manage hierarchical article categories and variant attributes (#235).
 * @es Gestiona categorías jerárquicas de artículos y atributos de variante (#235).
 * @pt-BR Gerencia categorias hierárquicas de artigos e atributos de variante (#235).
 */
export default function CategoriasArticuloPage() {
  const { t } = useTranslation('categoriasArticulo')
  const { t: tc } = useTranslation('common')

  const [rows, setRows] = useState<CategoriaArticuloRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [padreId, setPadreId] = useState('')
  const [precioDefault, setPrecioDefault] = useState('')

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<CategoriaArticuloRow | null>(null)
  const [attrNombre, setAttrNombre] = useState('')
  const [attrValores, setAttrValores] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await catalogVariantsAPI.listCategorias({ take: 200 })
      setRows(res?.data ?? [])
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('errors.load')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const loadDetail = useCallback(async (id: number) => {
    setActionError(null)
    try {
      const cat = await catalogVariantsAPI.getCategoria(id)
      setDetail(cat)
      setSelectedId(id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.load'))
    }
  }, [t])

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    setActionError(null)
    try {
      await catalogVariantsAPI.createCategoria({
        nombre: nombre.trim(),
        codigo: codigo.trim() || null,
        padreId: padreId ? Number(padreId) : null,
        precioDefault: precioDefault ? Number(precioDefault) : null,
        activo: true,
      })
      setNombre('')
      setCodigo('')
      setPadreId('')
      setPrecioDefault('')
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const onAddAtributo = async (e: FormEvent) => {
    e.preventDefault()
    if (selectedId == null) return
    setActionError(null)
    try {
      const valores = attrValores
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .map((valor, orden) => ({ valor, orden }))
      await catalogVariantsAPI.addAtributo(selectedId, {
        nombre: attrNombre.trim(),
        valores,
      })
      setAttrNombre('')
      setAttrValores('')
      await loadDetail(selectedId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const onDelete = async (id: number) => {
    setActionError(null)
    try {
      await catalogVariantsAPI.removeCategoria(id)
      if (selectedId === id) {
        setSelectedId(null)
        setDetail(null)
      }
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4" data-testid="categorias-articulo-page">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="categorias-action-error">
            {actionError}
          </p>
        ) : null}

        <CanAccess permission="products.manage">
          <form
            onSubmit={onCreate}
            className="grid max-w-3xl gap-3 rounded border border-slate-200 p-4 md:grid-cols-2"
            data-testid="categoria-create-form"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('form.nombre')}</span>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="rounded border px-2 py-1"
                data-testid="categoria-nombre"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('form.codigo')}</span>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="rounded border px-2 py-1"
                data-testid="categoria-codigo"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('form.padreId')}</span>
              <select
                value={padreId}
                onChange={(e) => setPadreId(e.target.value)}
                className="rounded border px-2 py-1"
                data-testid="categoria-padre"
              >
                <option value="">{t('form.noParent')}</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('form.precioDefault')}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={precioDefault}
                onChange={(e) => setPrecioDefault(e.target.value)}
                className="rounded border px-2 py-1"
                data-testid="categoria-precio"
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-white" data-testid="categoria-create">
                {t('actions.create')}
              </button>
            </div>
          </form>
        </CanAccess>

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="categorias-empty">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm" data-testid="categorias-table">
                <thead>
                  <tr>
                    <th>{t('columns.nombre')}</th>
                    <th>{t('columns.codigo')}</th>
                    <th>{t('columns.precio')}</th>
                    <th>{t('columns.estado')}</th>
                    <th>{t('columns.acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} data-testid={`categoria-row-${row.id}`}>
                      <td>{row.nombre}</td>
                      <td>{row.codigo ?? '—'}</td>
                      <td>{row.precioDefault ?? '—'}</td>
                      <td>{row.activo ? t('estado.activa') : t('estado.inactiva')}</td>
                      <td className="space-x-2">
                        <button
                          type="button"
                          className="underline"
                          onClick={() => void loadDetail(row.id)}
                          data-testid={`categoria-select-${row.id}`}
                        >
                          {t('actions.select')}
                        </button>
                        <CanAccess permission="products.manage">
                          <button
                            type="button"
                            className="text-red-700 underline"
                            onClick={() => void onDelete(row.id)}
                            data-testid={`categoria-delete-${row.id}`}
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
        </AsyncWrapper>

        {detail ? (
          <section className="rounded border border-slate-200 p-4" data-testid="categoria-detail">
            <h2 className="mb-3 text-lg font-medium">
              {t('atributos.title')}: {detail.nombre}
            </h2>
            {(detail.atributos ?? []).length === 0 ? (
              <p>{t('atributos.empty')}</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {(detail.atributos as CategoriaAtributoRow[]).map((attr) => (
                  <li key={attr.id} data-testid={`atributo-${attr.id}`}>
                    <strong>{attr.nombre}</strong>:{' '}
                    {attr.valores.map((v) => v.valor).join(', ') || '—'}
                  </li>
                ))}
              </ul>
            )}
            <CanAccess permission="products.manage">
              <form onSubmit={onAddAtributo} className="grid max-w-xl gap-2" data-testid="atributo-form">
                <label className="flex flex-col gap-1 text-sm">
                  <span>{t('atributos.nombre')}</span>
                  <input
                    required
                    value={attrNombre}
                    onChange={(e) => setAttrNombre(e.target.value)}
                    className="rounded border px-2 py-1"
                    data-testid="atributo-nombre"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>{t('atributos.valores')}</span>
                  <input
                    value={attrValores}
                    onChange={(e) => setAttrValores(e.target.value)}
                    className="rounded border px-2 py-1"
                    data-testid="atributo-valores"
                  />
                </label>
                <button type="submit" className="w-fit rounded bg-slate-800 px-3 py-2 text-white" data-testid="atributo-add">
                  {t('atributos.add')}
                </button>
              </form>
            </CanAccess>
            <p className="mt-2 text-xs text-slate-500">{tc('actions.close') ?? ''}</p>
          </section>
        ) : null}
      </div>
    </ErrorBoundary>
  )
}
