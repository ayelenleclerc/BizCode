import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { fidelizacionAPI } from '@/lib/api'
import type { ConfigFidelizacionRow, FidelizacionDashboard } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

function money(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * @en Loyalty program config + points liability dashboard (#250).
 * @es Configuración del programa de fidelización y dashboard de pasivo (#250).
 * @pt-BR Configuração do programa de fidelização e dashboard de passivo (#250).
 */
export default function FidelizacionPage() {
  const { t } = useTranslation('fidelizacion')
  const [config, setConfig] = useState<ConfigFidelizacionRow | null>(null)
  const [dashboard, setDashboard] = useState<FidelizacionDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const [activo, setActivo] = useState(false)
  const [nombre, setNombre] = useState('Programa de Puntos')
  const [pesosPorPunto, setPesosPorPunto] = useState('100')
  const [puntosPorPeso, setPuntosPorPeso] = useState('1')
  const [mesesVencimiento, setMesesVencimiento] = useState('')
  const [montoMinCompra, setMontoMinCompra] = useState('0')
  const [aplicaEnDescuento, setAplicaEnDescuento] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [cfg, dash] = await Promise.all([
        fidelizacionAPI.getConfig(),
        fidelizacionAPI.getDashboard(),
      ])
      setConfig(cfg)
      setDashboard(dash)
      setActivo(cfg.activo)
      setNombre(cfg.nombre)
      setPesosPorPunto(String(cfg.pesosPorPunto))
      setPuntosPorPeso(String(cfg.puntosPorPeso))
      setMesesVencimiento(cfg.mesesVencimiento == null ? '' : String(cfg.mesesVencimiento))
      setMontoMinCompra(String(cfg.montoMinCompra))
      setAplicaEnDescuento(cfg.aplicaEnDescuento)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const updated = await fidelizacionAPI.upsertConfig({
        activo,
        nombre: nombre.trim() || undefined,
        pesosPorPunto: Number.parseFloat(pesosPorPunto),
        puntosPorPeso: Number.parseFloat(puntosPorPeso),
        mesesVencimiento: mesesVencimiento.trim() === '' ? null : Number.parseInt(mesesVencimiento, 10),
        montoMinCompra: Number.parseFloat(montoMinCompra) || 0,
        aplicaEnDescuento,
      })
      setConfig(updated)
      setSaveMsg(t('saveOk'))
      const dash = await fidelizacionAPI.getDashboard()
      setDashboard(dash)
    } catch {
      setSaveMsg(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-8" data-testid="fidelizacion-page">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>

        <AsyncWrapper loading={loading} error={loadError}>
          {config ? (
            <CanAccess permission="customers.manage">
              <form
                onSubmit={(e) => void handleSave(e)}
                className="max-w-xl space-y-4 rounded border border-slate-200 dark:border-slate-600 p-4"
                data-testid="fidelizacion-config-form"
                aria-labelledby="fidelizacion-config-title"
              >
                <h2 id="fidelizacion-config-title" className="text-lg font-semibold">
                  {t('config.title')}
                </h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    data-testid="fidelizacion-config-activo"
                  />
                  {t('config.activo')}
                </label>
                <div>
                  <label htmlFor="fidelizacion-nombre" className="block text-sm mb-1">
                    {t('config.nombre')}
                  </label>
                  <input
                    id="fidelizacion-nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                    data-testid="fidelizacion-config-nombre"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="fidelizacion-pesos" className="block text-sm mb-1">
                      {t('config.pesosPorPunto')}
                    </label>
                    <input
                      id="fidelizacion-pesos"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pesosPorPunto}
                      onChange={(e) => setPesosPorPunto(e.target.value)}
                      className="w-full rounded border px-3 py-2"
                      data-testid="fidelizacion-config-pesos"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="fidelizacion-puntos-peso" className="block text-sm mb-1">
                      {t('config.puntosPorPeso')}
                    </label>
                    <input
                      id="fidelizacion-puntos-peso"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={puntosPorPeso}
                      onChange={(e) => setPuntosPorPeso(e.target.value)}
                      className="w-full rounded border px-3 py-2"
                      data-testid="fidelizacion-config-puntos-peso"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="fidelizacion-meses" className="block text-sm mb-1">
                      {t('config.mesesVencimiento')}
                    </label>
                    <input
                      id="fidelizacion-meses"
                      type="number"
                      min="1"
                      value={mesesVencimiento}
                      onChange={(e) => setMesesVencimiento(e.target.value)}
                      className="w-full rounded border px-3 py-2"
                      data-testid="fidelizacion-config-meses"
                      placeholder={t('config.mesesVencimientoHint')}
                    />
                  </div>
                  <div>
                    <label htmlFor="fidelizacion-min" className="block text-sm mb-1">
                      {t('config.montoMinCompra')}
                    </label>
                    <input
                      id="fidelizacion-min"
                      type="number"
                      min="0"
                      step="0.01"
                      value={montoMinCompra}
                      onChange={(e) => setMontoMinCompra(e.target.value)}
                      className="w-full rounded border px-3 py-2"
                      data-testid="fidelizacion-config-min"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aplicaEnDescuento}
                    onChange={(e) => setAplicaEnDescuento(e.target.checked)}
                    data-testid="fidelizacion-config-descuento"
                  />
                  {t('config.aplicaEnDescuento')}
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  data-testid="fidelizacion-config-save"
                >
                  {t('config.save')}
                </button>
                {saveMsg ? (
                  <p className="text-sm" role="status" data-testid="fidelizacion-config-status">
                    {saveMsg}
                  </p>
                ) : null}
              </form>
            </CanAccess>
          ) : null}

          {dashboard ? (
            <section aria-labelledby="fidelizacion-dash-title" data-testid="fidelizacion-dashboard">
              <h2 id="fidelizacion-dash-title" className="text-lg font-semibold mb-3">
                {t('dashboard.title')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.emitidos')}</p>
                  <p className="text-xl font-semibold tabular-nums">{dashboard.puntosEmitidos}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.canjeados')}</p>
                  <p className="text-xl font-semibold tabular-nums">{dashboard.puntosCanjeados}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.vencidos')}</p>
                  <p className="text-xl font-semibold tabular-nums">{dashboard.puntosVencidos}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.ajustados')}</p>
                  <p className="text-xl font-semibold tabular-nums">{dashboard.puntosAjustados}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.pasivo')}</p>
                  <p className="text-xl font-semibold tabular-nums" data-testid="fidelizacion-pasivo">
                    {dashboard.pasivoPuntos}
                  </p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-slate-500">{t('dashboard.pasivoDinero')}</p>
                  <p className="text-xl font-semibold tabular-nums">{money(dashboard.pasivoDinero)}</p>
                </div>
              </div>
              <h3 className="font-medium mb-2">{t('dashboard.ranking')}</h3>
              {dashboard.ranking.length === 0 ? (
                <p className="text-sm text-slate-500" data-testid="fidelizacion-ranking-empty">
                  {t('dashboard.emptyRanking')}
                </p>
              ) : (
                <table className="w-full text-sm border-collapse" data-testid="fidelizacion-ranking">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">{t('dashboard.cliente')}</th>
                      <th className="py-2">{t('dashboard.puntos')}</th>
                      <th className="py-2">{t('dashboard.equivalente')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.ranking.map((row) => (
                      <tr key={row.clienteId} className="border-b border-slate-100">
                        <td className="py-2">
                          {row.codigo} — {row.rsocial}
                        </td>
                        <td className="py-2 tabular-nums">{row.puntos}</td>
                        <td className="py-2 tabular-nums">{money(row.equivalenteDinero)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ) : null}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
