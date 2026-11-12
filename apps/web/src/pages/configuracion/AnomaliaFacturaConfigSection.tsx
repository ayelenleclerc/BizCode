import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ConfigAnomaliaFacturaRow } from '@bizcode/types'
import { anomaliasAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'

type EditableFields = Pick<
  ConfigAnomaliaFacturaRow,
  'minHistory' | 'zScoreThreshold' | 'discountThresholdPct' | 'newCustomerCreditFraction'
>

/**
 * @en Tenant billing anomaly thresholds editor (#200 residual).
 * @es Editor de umbrales de anomalía de facturación por tenant (#200 residual).
 * @pt-BR Editor de limiares de anomalia de faturamento por tenant (#200 residual).
 */
export default function AnomaliaFacturaConfigSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [config, setConfig] = useState<ConfigAnomaliaFacturaRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    if (!canEdit) {
      setForbidden(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    setForbidden(false)
    try {
      const data = await anomaliasAPI.getConfig()
      setConfig(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (/403|forbidden/i.test(message)) setForbidden(true)
      else setLoadError(message)
    } finally {
      setLoading(false)
    }
  }, [canEdit])

  useEffect(() => {
    void load()
  }, [load])

  const updateField = <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!config || !canEdit) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await anomaliasAPI.upsertConfig({
        minHistory: config.minHistory,
        zScoreThreshold: config.zScoreThreshold,
        discountThresholdPct: config.discountThresholdPct,
        newCustomerCreditFraction: config.newCustomerCreditFraction,
      })
      setConfig(updated)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="mt-8 border border-slate-200 dark:border-slate-600 rounded-lg p-4"
      aria-labelledby="anomalia-factura-heading"
      data-testid="anomalia-factura-config-section"
    >
      <h2
        id="anomalia-factura-heading"
        className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1"
      >
        {t('anomaliaFactura.title')}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('anomaliaFactura.hint')}</p>

      {forbidden && (
        <p role="status" data-testid="anomalia-factura-forbidden" className="text-sm text-slate-500">
          {t('anomaliaFactura.forbidden')}
        </p>
      )}

      {loading && (
        <p role="status" aria-busy="true" className="text-sm text-slate-500">
          {t('anomaliaFactura.loading')}
        </p>
      )}
      {loadError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      )}

      {!loading && !loadError && !forbidden && config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="anomalia-min-history"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('anomaliaFactura.minHistory')}
            </label>
            <input
              id="anomalia-min-history"
              type="number"
              min={1}
              max={1000}
              step={1}
              value={config.minHistory}
              onChange={(e) => updateField('minHistory', Number(e.target.value))}
              disabled={!canEdit || saving}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              data-testid="anomalia-min-history"
            />
          </div>
          <div>
            <label
              htmlFor="anomalia-zscore"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('anomaliaFactura.zScoreThreshold')}
            </label>
            <input
              id="anomalia-zscore"
              type="number"
              min={0.1}
              max={20}
              step={0.1}
              value={config.zScoreThreshold}
              onChange={(e) => updateField('zScoreThreshold', Number(e.target.value))}
              disabled={!canEdit || saving}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              data-testid="anomalia-zscore-threshold"
            />
          </div>
          <div>
            <label
              htmlFor="anomalia-discount"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('anomaliaFactura.discountThresholdPct')}
            </label>
            <input
              id="anomalia-discount"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={config.discountThresholdPct}
              onChange={(e) => updateField('discountThresholdPct', Number(e.target.value))}
              disabled={!canEdit || saving}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              data-testid="anomalia-discount-threshold"
            />
          </div>
          <div>
            <label
              htmlFor="anomalia-credit-fraction"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('anomaliaFactura.newCustomerCreditFraction')}
            </label>
            <input
              id="anomalia-credit-fraction"
              type="number"
              min={0.01}
              max={1}
              step={0.01}
              value={config.newCustomerCreditFraction}
              onChange={(e) => updateField('newCustomerCreditFraction', Number(e.target.value))}
              disabled={!canEdit || saving}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              data-testid="anomalia-credit-fraction"
            />
          </div>

          {saveError && (
            <p role="alert" className="md:col-span-2 text-sm text-red-600 dark:text-red-400">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" className="md:col-span-2 text-sm text-green-700 dark:text-green-400">
              {t('anomaliaFactura.saved')}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!canEdit || saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              data-testid="anomalia-config-save"
            >
              {saving ? t('anomaliaFactura.saving') : t('anomaliaFactura.save')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
