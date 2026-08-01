import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ordenesEntregaAPI,
  type OrdenEntrega,
  type OrdenEntregaTrackingView,
  type ShippingTransportista,
} from '@/lib/api'

const TRANSPORTISTAS: ShippingTransportista[] = [
  'andreani',
  'correo_argentino',
  'propio',
  'meli_full',
]

type Props = {
  orden: OrdenEntrega
  canManage: boolean
}

/**
 * @en Carrier shipping panel for a selected delivery order (#193).
 * @es Panel de envío por transportista para una OE seleccionada (#193).
 * @pt-BR Painel de envio por transportadora para uma OE selecionada (#193).
 */
export default function OrdenEntregaShippingPanel({ orden, canManage }: Props) {
  const { t } = useTranslation('logistica')
  const [tracking, setTracking] = useState<OrdenEntregaTrackingView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportista, setTransportista] = useState<ShippingTransportista>('andreani')
  const [nro, setNro] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ordenesEntregaAPI.getTracking(orden.id)
      setTracking(data ?? null)
      if (data?.transportista) setTransportista(data.transportista)
      if (data?.nroSeguimiento) setNro(data.nroSeguimiento)
    } catch {
      setError(t('shipping.errors.load'))
      setTracking(null)
    } finally {
      setLoading(false)
    }
  }, [orden.id, t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleAssign(e: FormEvent) {
    e.preventDefault()
    if (!canManage) return
    setSaving(true)
    setError(null)
    try {
      const data = await ordenesEntregaAPI.assignTracking(orden.id, {
        transportista,
        nroSeguimiento: nro.trim(),
      })
      setTracking(data ?? null)
    } catch {
      setError(t('shipping.errors.save'))
    } finally {
      setSaving(false)
    }
  }

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    try {
      const data = await ordenesEntregaAPI.getTracking(orden.id, { refresh: true })
      setTracking(data ?? null)
    } catch {
      setError(t('shipping.errors.load'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
      data-testid="logistica-shipping-panel"
      aria-labelledby="logistica-shipping-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 id="logistica-shipping-title" className="text-lg font-semibold">
          {t('shipping.title', { id: orden.id })}
        </h2>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="text-sm underline"
          data-testid="logistica-shipping-refresh"
          disabled={loading}
        >
          {t('shipping.refresh')}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2" role="alert">
          {error}
        </p>
      )}

      {loading && !tracking ? (
        <p className="text-sm text-slate-500">{t('shipping.loading')}</p>
      ) : tracking?.nroSeguimiento ? (
        <div className="space-y-2 text-sm" data-testid="logistica-shipping-status">
          <p>
            <span className="text-slate-500">{t('shipping.carrier')}: </span>
            {tracking.transportista
              ? t(`shipping.carriers.${tracking.transportista}`)
              : '—'}
          </p>
          <p>
            <span className="text-slate-500">{t('shipping.number')}: </span>
            {tracking.nroSeguimiento}
          </p>
          <p>
            <span className="text-slate-500">{t('shipping.status')}: </span>
            {tracking.estadoEnvio
              ? t(`shipping.estadoEnvio.${tracking.estadoEnvio}`)
              : '—'}
          </p>
          {tracking.portalUrl && (
            <p>
              <a
                href={tracking.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
                data-testid="logistica-shipping-portal-link"
              >
                {t('shipping.openPortal')}
              </a>
            </p>
          )}
          {tracking.trackingEventos.length > 0 && (
            <ol className="mt-3 space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
              {tracking.trackingEventos.map((ev, i) => (
                <li key={`${ev.at}-${i}`} className="text-xs">
                  <time dateTime={ev.at}>{ev.at}</time> — {ev.status}
                  {ev.description ? `: ${ev.description}` : ''}
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-3" data-testid="logistica-shipping-empty">
          {t('shipping.empty')}
        </p>
      )}

      {canManage && (
        <form
          onSubmit={(e) => void handleAssign(e)}
          className="mt-4 grid gap-3 sm:grid-cols-3 items-end"
          data-testid="logistica-shipping-form"
        >
          <label className="text-sm block">
            {t('shipping.carrier')}
            <select
              value={transportista}
              onChange={(e) => setTransportista(e.target.value as ShippingTransportista)}
              className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
              data-testid="logistica-shipping-carrier"
            >
              {TRANSPORTISTAS.map((c) => (
                <option key={c} value={c}>
                  {t(`shipping.carriers.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block sm:col-span-1">
            {t('shipping.number')}
            <input
              value={nro}
              onChange={(e) => setNro(e.target.value)}
              required
              maxLength={80}
              className="mt-1 w-full border rounded px-2 py-1 dark:bg-slate-800"
              data-testid="logistica-shipping-number"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !nro.trim()}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            data-testid="logistica-shipping-assign"
          >
            {saving ? t('shipping.saving') : t('shipping.assign')}
          </button>
        </form>
      )}
    </section>
  )
}
