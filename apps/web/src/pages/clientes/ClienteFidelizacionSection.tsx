import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { fidelizacionAPI } from '@/lib/api'
import type { ClientePuntosDetail, MovimientoPuntosTipo } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'

type Props = {
  clienteId: number
}

function money(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * @en Customer loyalty balance panel with optional manual adjustment (#250).
 * @es Panel de saldo de puntos del cliente con ajuste manual opcional (#250).
 * @pt-BR Painel de saldo de pontos do cliente com ajuste manual opcional (#250).
 */
export default function ClienteFidelizacionSection({ clienteId }: Props) {
  const { t } = useTranslation('fidelizacion')
  const [data, setData] = useState<ClientePuntosDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ajustePuntos, setAjustePuntos] = useState('')
  const [ajusteConcepto, setAjusteConcepto] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await fidelizacionAPI.getClientePuntos(clienteId, { limit: 20, offset: 0 })
      setData(detail)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loadError'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [clienteId, t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleAjuste(event: FormEvent): Promise<void> {
    event.preventDefault()
    const puntos = Number.parseInt(ajustePuntos, 10)
    if (!Number.isInteger(puntos) || puntos === 0) return
    setSaving(true)
    try {
      const detail = await fidelizacionAPI.ajustar({
        clienteId,
        puntos,
        concepto: ajusteConcepto.trim() || null,
      })
      setData(detail)
      setAjustePuntos('')
      setAjusteConcepto('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading && !data) {
    return (
      <p className="text-sm text-slate-500" data-testid="cliente-fidelizacion-loading">
        …
      </p>
    )
  }

  if (error && !data) {
    return (
      <p role="alert" className="text-sm text-red-600" data-testid="cliente-fidelizacion-error">
        {error}
      </p>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-3" data-testid="cliente-fidelizacion-section">
      <h3 className="text-sm font-semibold">{t('cliente.title')}</h3>
      <div className="flex flex-wrap gap-4 text-sm">
        <p>
          {t('cliente.saldo')}:{' '}
          <span className="font-semibold tabular-nums" data-testid="cliente-fidelizacion-saldo">
            {data.puntos}
          </span>
        </p>
        <p>
          {t('cliente.equivalente')}:{' '}
          <span className="tabular-nums" data-testid="cliente-fidelizacion-equiv">
            {money(data.equivalenteDinero)}
          </span>
        </p>
      </div>

      <CanAccess permission="customers.manage">
        <form
          onSubmit={(e) => void handleAjuste(e)}
          className="flex flex-wrap items-end gap-2 rounded border p-3"
          data-testid="cliente-fidelizacion-ajuste-form"
        >
          <div>
            <label htmlFor="cliente-fidelizacion-ajuste-puntos" className="block text-xs mb-1">
              {t('cliente.ajustePuntos')}
            </label>
            <input
              id="cliente-fidelizacion-ajuste-puntos"
              type="number"
              value={ajustePuntos}
              onChange={(e) => setAjustePuntos(e.target.value)}
              className="w-28 rounded border px-2 py-1"
              data-testid="cliente-fidelizacion-ajuste-puntos"
              required
            />
          </div>
          <div className="flex-1 min-w-[10rem]">
            <label htmlFor="cliente-fidelizacion-ajuste-concepto" className="block text-xs mb-1">
              {t('cliente.ajusteConcepto')}
            </label>
            <input
              id="cliente-fidelizacion-ajuste-concepto"
              value={ajusteConcepto}
              onChange={(e) => setAjusteConcepto(e.target.value)}
              className="w-full rounded border px-2 py-1"
              data-testid="cliente-fidelizacion-ajuste-concepto"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            data-testid="cliente-fidelizacion-ajuste-submit"
          >
            {t('cliente.ajusteSubmit')}
          </button>
        </form>
      </CanAccess>

      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t('cliente.movimientos')}
      </h4>
      {data.movimientos.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="cliente-fidelizacion-empty">
          {t('cliente.empty')}
        </p>
      ) : (
        <ul className="space-y-1 text-sm" data-testid="cliente-fidelizacion-movimientos">
          {data.movimientos.map((mov) => (
            <li key={mov.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span>
                {t(`cliente.tipo.${mov.tipo as MovimientoPuntosTipo}`)}
                {mov.concepto ? ` — ${mov.concepto}` : ''}
              </span>
              <span className="tabular-nums font-medium">
                {mov.puntos > 0 ? `+${mov.puntos}` : mov.puntos}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
