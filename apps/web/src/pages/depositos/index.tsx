import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { depositosAPI } from '@/lib/api'
import type { DepositoRow, DepositoTipo } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

const TIPOS: DepositoTipo[] = ['central', 'sucursal', 'externo', 'picking', 'transito']

/**
 * @en Manage warehouses/deposits (#236).
 * @es Gestiona depósitos/almacenes (#236).
 * @pt-BR Gerencia depósitos/armazéns (#236).
 */
export default function DepositosPage() {
  const { t } = useTranslation('depositos')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<DepositoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState<DepositoTipo>('sucursal')
  const [direccion, setDireccion] = useState('')
  const [esDefault, setEsDefault] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await depositosAPI.listDepositos({ take: 200 })
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

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    setActionError(null)
    try {
      await depositosAPI.createDeposito({
        nombre,
        codigo,
        tipo,
        direccion: direccion || null,
        esDefault,
      })
      setNombre('')
      setCodigo('')
      setDireccion('')
      setEsDefault(false)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return
    setActionError(null)
    try {
      await depositosAPI.removeDeposito(id)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.delete'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="depositos-page">
        <header>
          <h1 className="text-xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-slate-600">{t('subtitle')}</p>
        </header>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="depositos-action-error">
            {actionError}
          </p>
        ) : null}

        <CanAccess permission="products.manage">
          <form onSubmit={(e) => void onCreate(e)} className="grid max-w-xl gap-2 md:grid-cols-2" data-testid="deposito-form">
            <label className="text-sm">
              {t('nombre')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                data-testid="deposito-nombre"
              />
            </label>
            <label className="text-sm">
              {t('codigo')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                data-testid="deposito-codigo"
              />
            </label>
            <label className="text-sm">
              {t('tipo')}
              <select
                className="mt-1 w-full rounded border px-2 py-1"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as DepositoTipo)}
                data-testid="deposito-tipo"
              >
                {TIPOS.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`tipos.${tp}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t('direccion')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                data-testid="deposito-direccion"
              />
            </label>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={esDefault}
                onChange={(e) => setEsDefault(e.target.checked)}
                data-testid="deposito-es-default"
              />
              {t('esDefault')}
            </label>
            <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-white md:col-span-2" data-testid="deposito-create">
              {t('create')}
            </button>
          </form>
        </CanAccess>

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="depositos-empty">{t('empty')}</p>
          ) : (
            <table className="min-w-full text-left text-sm" data-testid="depositos-table">
              <thead>
                <tr>
                  <th>{t('codigo')}</th>
                  <th>{t('nombre')}</th>
                  <th>{t('tipo')}</th>
                  <th>{t('esDefault')}</th>
                  <th>{t('activo')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} data-testid={`deposito-row-${row.id}`}>
                    <td>{row.codigo}</td>
                    <td>{row.nombre}</td>
                    <td>{t(`tipos.${row.tipo}`)}</td>
                    <td>{row.esDefault ? '✓' : ''}</td>
                    <td>{row.activo ? '✓' : ''}</td>
                    <td>
                      {!row.esDefault ? (
                        <CanAccess permission="products.manage">
                          <button
                            type="button"
                            className="text-red-700 underline"
                            onClick={() => void onDelete(row.id)}
                            data-testid={`deposito-delete-${row.id}`}
                          >
                            {tc('delete', 'Eliminar')}
                          </button>
                        </CanAccess>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
