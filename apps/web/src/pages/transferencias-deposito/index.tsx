import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { depositosAPI } from '@/lib/api'
import type { DepositoRow, TransferenciaDepositoRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

/**
 * @en Create and progress inter-warehouse transfers (#236).
 * @es Crea y avanza transferencias entre depósitos (#236).
 * @pt-BR Cria e avança transferências entre depósitos (#236).
 */
export default function TransferenciasDepositoPage() {
  const { t } = useTranslation('transferenciasDeposito')
  const [rows, setRows] = useState<TransferenciaDepositoRow[]>([])
  const [depositos, setDepositos] = useState<DepositoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [articuloId, setArticuloId] = useState('')
  const [cantidad, setCantidad] = useState('1')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [transf, deps] = await Promise.all([
        depositosAPI.listTransferencias({ take: 100 }),
        depositosAPI.listDepositos({ take: 200, activo: true }),
      ])
      setRows(transf?.data ?? [])
      setDepositos(deps?.data ?? [])
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
      await depositosAPI.createTransferencia({
        origenId: Number(origenId),
        destinoId: Number(destinoId),
        items: [{ articuloId: Number(articuloId), cantidadEnviada: Number(cantidad) }],
      })
      setArticuloId('')
      setCantidad('1')
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await fn()
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.action'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="transferencias-page">
        <header>
          <h1 className="text-xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-slate-600">{t('subtitle')}</p>
        </header>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="transferencias-action-error">
            {actionError}
          </p>
        ) : null}

        <CanAccess permission="products.manage">
          <form onSubmit={(e) => void onCreate(e)} className="grid max-w-xl gap-2 md:grid-cols-2" data-testid="transferencia-form">
            <label className="text-sm">
              {t('origen')}
              <select
                className="mt-1 w-full rounded border px-2 py-1"
                value={origenId}
                onChange={(e) => setOrigenId(e.target.value)}
                required
                data-testid="transf-origen"
              >
                <option value="">—</option>
                {depositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} — {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t('destino')}
              <select
                className="mt-1 w-full rounded border px-2 py-1"
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                required
                data-testid="transf-destino"
              >
                <option value="">—</option>
                {depositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} — {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t('articuloId')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                type="number"
                min={1}
                value={articuloId}
                onChange={(e) => setArticuloId(e.target.value)}
                required
                data-testid="transf-articulo"
              />
            </label>
            <label className="text-sm">
              {t('cantidad')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                data-testid="transf-cantidad"
              />
            </label>
            <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-white md:col-span-2" data-testid="transf-create">
              {t('create')}
            </button>
          </form>
        </CanAccess>

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="transferencias-empty">{t('empty')}</p>
          ) : (
            <table className="min-w-full text-left text-sm" data-testid="transferencias-table">
              <thead>
                <tr>
                  <th>{t('numero')}</th>
                  <th>{t('origen')}</th>
                  <th>{t('destino')}</th>
                  <th>{t('estado')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} data-testid={`transf-row-${row.id}`}>
                    <td>{row.numero}</td>
                    <td>{row.origenCodigo ?? row.origenId}</td>
                    <td>{row.destinoCodigo ?? row.destinoId}</td>
                    <td>{t(`estados.${row.estado}`)}</td>
                    <td className="space-x-2">
                      <CanAccess permission="products.manage">
                        {row.estado === 'pendiente' ? (
                          <>
                            <button
                              type="button"
                              className="underline"
                              onClick={() => void runAction(() => depositosAPI.markEnTransito(row.id))}
                              data-testid={`transf-en-transito-${row.id}`}
                            >
                              {t('enviar')}
                            </button>
                            <button
                              type="button"
                              className="text-red-700 underline"
                              onClick={() => void runAction(() => depositosAPI.anularTransferencia(row.id))}
                              data-testid={`transf-anular-${row.id}`}
                            >
                              {t('anular')}
                            </button>
                          </>
                        ) : null}
                        {row.estado === 'en_transito' ? (
                          <>
                            <button
                              type="button"
                              className="underline"
                              onClick={() =>
                                void runAction(() =>
                                  depositosAPI.recibirTransferencia(row.id, {
                                    items: (row.items ?? []).map((it) => ({
                                      articuloId: it.articuloId,
                                      cantidadRecibida: it.cantidadEnviada,
                                    })),
                                  }),
                                )
                              }
                              data-testid={`transf-recibir-${row.id}`}
                            >
                              {t('recibir')}
                            </button>
                            <button
                              type="button"
                              className="text-red-700 underline"
                              onClick={() => void runAction(() => depositosAPI.anularTransferencia(row.id))}
                              data-testid={`transf-anular-${row.id}`}
                            >
                              {t('anular')}
                            </button>
                          </>
                        ) : null}
                      </CanAccess>
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
