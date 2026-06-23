import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import { chequesAPI, type ChequeDTO, type ChequeEstadoDTO } from '@/lib/api'

function formatMoney(value: string | number): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

function daysUntil(value: string): number {
  const target = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

const ESTADOS: ChequeEstadoDTO[] = [
  'en_cartera',
  'emitido',
  'depositado',
  'endosado',
  'descontado',
  'cobrado',
  'rechazado',
  'anulado',
]

export default function ChequesSection() {
  const { t } = useTranslation('finanzas')
  const [cheques, setCheques] = useState<ChequeDTO[]>([])
  const [resumen, setResumen] = useState<{
    enCartera: { count: number; total: string }
    proximosVencer: { count: number; total: string }
    rechazados: { count: number; total: string }
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [bancoFilter, setBancoFilter] = useState('')
  const [actionId, setActionId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [listRes, resumenRes] = await Promise.all([
        chequesAPI.list({
          estado: estadoFilter ? (estadoFilter as ChequeEstadoDTO) : undefined,
          banco: bancoFilter.trim() || undefined,
        }),
        chequesAPI.resumen(),
      ])
      setCheques(listRes?.data ?? [])
      setResumen(resumenRes)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [bancoFilter, estadoFilter])

  useEffect(() => {
    void load()
  }, [load])

  const proximosIds = useMemo(() => {
    return new Set(
      cheques
        .filter((c) => c.estado === 'en_cartera' && daysUntil(c.fechaVencimiento) <= 3)
        .map((c) => c.id),
    )
  }, [cheques])

  const runAction = async (id: number, fn: () => Promise<ChequeDTO>) => {
    setActionId(id)
    setActionError(null)
    try {
      await fn()
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="mt-8" aria-labelledby="finanzas-cheques-heading" data-testid="cheques-section">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="finanzas-cheques-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('cheques.title')}
        </h2>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => void load()}
          data-testid="cheques-refresh"
        >
          ↻
        </button>
      </div>

      {resumen ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3" data-testid="cheques-resumen">
          <div className="rounded border border-slate-200 dark:border-slate-600 p-3">
            <p className="text-xs text-slate-500">{t('cheques.resumen.enCartera')}</p>
            <p className="font-semibold">
              {resumen.enCartera.count} — {formatMoney(resumen.enCartera.total)}
            </p>
          </div>
          <div className="rounded border border-amber-200 dark:border-amber-700 p-3">
            <p className="text-xs text-slate-500">{t('cheques.resumen.proximos')}</p>
            <p className="font-semibold">
              {resumen.proximosVencer.count} — {formatMoney(resumen.proximosVencer.total)}
            </p>
          </div>
          <div className="rounded border border-red-200 dark:border-red-800 p-3">
            <p className="text-xs text-slate-500">{t('cheques.resumen.rechazados')}</p>
            <p className="font-semibold">
              {resumen.rechazados.count} — {formatMoney(resumen.rechazados.total)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-3" data-testid="cheques-filters">
        <label className="text-sm">
          <span className="block text-xs text-slate-500 mb-1">{t('cheques.filters.estado')}</span>
          <select
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            data-testid="cheques-filter-estado"
          >
            <option value="">{t('cheques.filters.all')}</option>
            {ESTADOS.map((est) => (
              <option key={est} value={est}>
                {t(`cheques.estado.${est}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-slate-500 mb-1">{t('cheques.filters.banco')}</span>
          <input
            type="search"
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={bancoFilter}
            onChange={(e) => setBancoFilter(e.target.value)}
            data-testid="cheques-filter-banco"
          />
        </label>
      </div>

      <AsyncWrapper loading={loading} error={error}>
        {actionError ? (
          <p className="text-sm text-red-600 mb-2" role="alert" data-testid="cheques-action-error">
            {actionError}
          </p>
        ) : null}
        {cheques.length === 0 ? (
          <p className="text-slate-500" data-testid="cheques-empty">
            {t('cheques.empty')}
          </p>
        ) : (
          <table className="min-w-full text-sm" data-testid="cheques-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                <th className="py-2 pr-2">{t('cheques.colNumero')}</th>
                <th className="py-2 pr-2">{t('cheques.colBanco')}</th>
                <th className="py-2 pr-2">{t('cheques.colVencimiento')}</th>
                <th className="py-2 pr-2 text-right">{t('cheques.colMonto')}</th>
                <th className="py-2 pr-2">{t('cheques.colEstado')}</th>
                <th className="py-2 pr-2">{t('cheques.colAcciones')}</th>
              </tr>
            </thead>
            <tbody>
              {cheques.map((cheque) => (
                <tr
                  key={cheque.id}
                  className="border-b border-slate-100 dark:border-slate-700"
                  data-testid={`cheque-row-${cheque.id}`}
                >
                  <td className="py-2 pr-2">
                    <span className="font-mono">{cheque.numero}</span>
                    <span
                      className={`ml-2 text-xs px-1 rounded ${
                        cheque.modalidad === 'echeq'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {t(`cheques.modalidad.${cheque.modalidad}`)}
                    </span>
                    {proximosIds.has(cheque.id) ? (
                      <span
                        className="ml-2 text-xs text-amber-700 dark:text-amber-300"
                        data-testid={`cheque-due-soon-${cheque.id}`}
                      >
                        {t('cheques.dueSoon')}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-2">{cheque.banco}</td>
                  <td className="py-2 pr-2">{formatDate(cheque.fechaVencimiento)}</td>
                  <td className="py-2 pr-2 text-right">{formatMoney(String(cheque.monto))}</td>
                  <td className="py-2 pr-2">{t(`cheques.estado.${cheque.estado}`)}</td>
                  <td className="py-2 pr-2 space-x-1">
                    {cheque.estado === 'en_cartera' ? (
                      <>
                        <button
                          type="button"
                          className="text-xs underline"
                          disabled={actionId === cheque.id}
                          data-testid={`cheque-depositar-${cheque.id}`}
                          onClick={() =>
                            void runAction(cheque.id, () => chequesAPI.depositar(cheque.id, { destino: 'Depósito' }))
                          }
                        >
                          {t('cheques.actions.depositar')}
                        </button>
                        <button
                          type="button"
                          className="text-xs underline"
                          disabled={actionId === cheque.id}
                          data-testid={`cheque-anular-${cheque.id}`}
                          onClick={() => void runAction(cheque.id, () => chequesAPI.anular(cheque.id))}
                        >
                          {t('cheques.actions.anular')}
                        </button>
                      </>
                    ) : null}
                    {cheque.estado === 'depositado' ? (
                      <button
                        type="button"
                        className="text-xs underline"
                        disabled={actionId === cheque.id}
                        data-testid={`cheque-cobrar-${cheque.id}`}
                        onClick={() => void runAction(cheque.id, () => chequesAPI.cobrar(cheque.id))}
                      >
                        {t('cheques.actions.cobrar')}
                      </button>
                    ) : null}
                    {cheque.estado === 'depositado' || cheque.estado === 'emitido' ? (
                      <button
                        type="button"
                        className="text-xs underline text-red-700"
                        disabled={actionId === cheque.id}
                        data-testid={`cheque-rechazar-${cheque.id}`}
                        onClick={() => void runAction(cheque.id, () => chequesAPI.rechazar(cheque.id))}
                      >
                        {t('cheques.actions.rechazar')}
                      </button>
                    ) : null}
                    {cheque.estado === 'rechazado' ? (
                      <button
                        type="button"
                        className="text-xs underline"
                        disabled={actionId === cheque.id}
                        data-testid={`cheque-devolver-${cheque.id}`}
                        onClick={() => void runAction(cheque.id, () => chequesAPI.devolverACartera(cheque.id))}
                      >
                        {t('cheques.actions.devolver')}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AsyncWrapper>
    </section>
  )
}
