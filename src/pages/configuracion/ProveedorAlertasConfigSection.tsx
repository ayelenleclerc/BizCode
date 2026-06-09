import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { proveedorAlertasAPI, type AlertaProveedorConfigDTO } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

/**
 * @en Supplier payable alert settings (#275).
 * @es Configuración de alertas de facturas a pagar (#275).
 * @pt-BR Configuração de alertas de faturas a pagar (#275).
 */
export default function ProveedorAlertasConfigSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'suppliers.manage')

  const [config, setConfig] = useState<AlertaProveedorConfigDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await proveedorAlertasAPI.getConfig()
      setConfig(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateField = <K extends keyof AlertaProveedorConfigDTO>(
    key: K,
    value: AlertaProveedorConfigDTO[K],
  ) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!config || !canEdit) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await proveedorAlertasAPI.updateConfig(config)
      setConfig(updated)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfModule flag="finance.ledger">
      <section
        className="mt-8 border border-slate-200 dark:border-slate-600 rounded-lg p-4"
        aria-labelledby="proveedor-alertas-heading"
        data-testid="proveedor-alertas-config-section"
      >
        <h2
          id="proveedor-alertas-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1"
        >
          {t('proveedorAlertas.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('proveedorAlertas.hint')}</p>

        {loading && (
          <p role="status" aria-busy="true" className="text-sm text-slate-500">
            {t('proveedorAlertas.loading')}
          </p>
        )}
        {loadError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {loadError}
          </p>
        )}

        {!loading && !loadError && config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="alertas-dias-previo"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t('proveedorAlertas.diasPrevio')}
              </label>
              <input
                id="alertas-dias-previo"
                type="number"
                min={0}
                max={90}
                data-testid="input-alertas-dias-previo"
                value={config.diasPrevioAviso}
                disabled={!canEdit}
                onChange={(e) => updateField('diasPrevioAviso', Number.parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              />
            </div>
            <div>
              <label
                htmlFor="alertas-dias-critico"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t('proveedorAlertas.diasCritico')}
              </label>
              <input
                id="alertas-dias-critico"
                type="number"
                min={1}
                max={365}
                data-testid="input-alertas-dias-critico"
                value={config.diasCritico}
                disabled={!canEdit}
                onChange={(e) => updateField('diasCritico', Number.parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="alertas-notif-inapp"
                type="checkbox"
                data-testid="checkbox-alertas-notif-inapp"
                checked={config.notifInApp}
                disabled={!canEdit}
                onChange={(e) => updateField('notifInApp', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="alertas-notif-inapp" className="text-sm text-slate-700 dark:text-slate-300">
                {t('proveedorAlertas.notifInApp')}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="alertas-notif-email"
                type="checkbox"
                data-testid="checkbox-alertas-notif-email"
                checked={config.notifEmail}
                disabled={!canEdit}
                onChange={(e) => updateField('notifEmail', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="alertas-notif-email" className="text-sm text-slate-700 dark:text-slate-300">
                {t('proveedorAlertas.notifEmail')}
              </label>
            </div>
            <p className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400">
              {t('proveedorAlertas.emailNote')}
            </p>
          </div>
        )}

        {saveError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-400">
            {t('proveedorAlertas.saved')}
          </p>
        )}

        {canEdit && config && (
          <button
            type="button"
            data-testid="btn-save-alertas-proveedor"
            disabled={saving}
            onClick={() => void handleSave()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
          >
            {t('proveedorAlertas.save')}
          </button>
        )}
      </section>
    </IfModule>
  )
}
