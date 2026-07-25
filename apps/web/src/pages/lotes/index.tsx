import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { lotesAPI } from '@/lib/api'
import type { ConfigFefoRow, LoteRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

/**
 * @en FEFO lots list, expiring soon, and alert config (#202).
 * @es Listado de lotes FEFO, por vencer y config de alerta (#202).
 * @pt-BR Lista de lotes FEFO, a vencer e config de alerta (#202).
 */
export default function LotesPage() {
  const { t } = useTranslation('lotes')
  const [tab, setTab] = useState<'list' | 'expiring'>('list')
  const [lots, setLots] = useState<LoteRow[]>([])
  const [config, setConfig] = useState<ConfigFefoRow | null>(null)
  const [dias, setDias] = useState('30')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [cfg, list] = await Promise.all([
        lotesAPI.getConfig(),
        tab === 'expiring' ? lotesAPI.listExpiring() : lotesAPI.list({ soloActivos: true }),
      ])
      setConfig(cfg)
      setDias(String(cfg.diasAlertaVencimiento))
      setLots(list)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [t, tab])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const updated = await lotesAPI.upsertConfig({
        diasAlertaVencimiento: Number.parseInt(dias, 10),
      })
      setConfig(updated)
      setSaveMsg(t('saveOk'))
      await load()
    } catch {
      setSaveMsg(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6" data-testid="lotes-page">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>

        <AsyncWrapper loading={loading} error={loadError}>
          {config ? (
            <CanAccess permission="inventory.adjust">
              <form
                onSubmit={(e) => void handleSave(e)}
                className="max-w-md space-y-3 rounded border border-slate-200 dark:border-slate-600 p-4"
                data-testid="lotes-config-form"
                aria-labelledby="lotes-config-title"
              >
                <h2 id="lotes-config-title" className="text-lg font-semibold">
                  {t('config.title')}
                </h2>
                <label htmlFor="lotes-dias" className="block text-sm mb-1">
                  {t('config.dias')}
                </label>
                <input
                  id="lotes-dias"
                  type="number"
                  min={1}
                  max={365}
                  className="w-full border rounded px-2 py-1 dark:bg-slate-800"
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  data-testid="lotes-config-dias"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
                  disabled={saving}
                  data-testid="lotes-config-save"
                >
                  {t('config.save')}
                </button>
                {saveMsg ? (
                  <p className="text-sm" role="status" data-testid="lotes-config-status">
                    {saveMsg}
                  </p>
                ) : null}
              </form>
            </CanAccess>
          ) : null}

          <div className="flex gap-2" role="tablist" aria-label={t('title')}>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'list'}
              className={`px-3 py-1.5 rounded border ${tab === 'list' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
              data-testid="lotes-tab-list"
              onClick={() => setTab('list')}
            >
              {t('tabs.list')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'expiring'}
              className={`px-3 py-1.5 rounded border ${tab === 'expiring' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
              data-testid="lotes-tab-expiring"
              onClick={() => setTab('expiring')}
            >
              {t('tabs.expiring')}
            </button>
          </div>

          {lots.length === 0 ? (
            <p className="text-sm text-slate-500" data-testid="lotes-empty">
              {t('table.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" data-testid="lotes-table">
                <thead>
                  <tr className="text-left border-b">
                    <th scope="col" className="py-2 pr-3">
                      {t('table.nroLote')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('table.articulo')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('table.deposito')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('table.vencimiento')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('table.stock')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr key={lot.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-2 pr-3 font-mono">{lot.nroLote}</td>
                      <td className="py-2 pr-3">
                        {lot.articulo
                          ? `${lot.articulo.codigo} — ${lot.articulo.descripcion}`
                          : lot.articuloId}
                      </td>
                      <td className="py-2 pr-3">
                        {lot.deposito ? `${lot.deposito.codigo} — ${lot.deposito.nombre}` : lot.depositoId}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">{lot.fechaVencimiento}</td>
                      <td className="py-2 pr-3 tabular-nums">{lot.stockActual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
