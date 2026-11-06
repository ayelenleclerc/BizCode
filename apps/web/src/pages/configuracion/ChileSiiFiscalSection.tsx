import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fiscalAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

/**
 * @en Chile SII DTE mock homologación credentials (RUT only; no live SII secrets) (#208).
 * @es Credenciales mock de homologación DTE SII Chile (solo RUT; sin secretos SII live) (#208).
 * @pt-BR Credenciais mock de homologação DTE SII Chile (apenas RUT; sem segredos SII live) (#208).
 */
export default function ChileSiiFiscalSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit = claims?.role != null && hasPermission(claims.role, 'settings.fiscal.manage')

  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [statusRut, setStatusRut] = useState<string | undefined>()
  const [rut, setRut] = useState('')
  const [ambiente, setAmbiente] = useState<'homologacion' | 'produccion'>('homologacion')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const providers = await fiscalAPI.getProvidersConfig()
      const cl = providers.find((p) => p.provider === 'chile_sii')
      setConfigured(Boolean(cl?.configured))
      setStatusRut(cl?.taxIdentifier)
      if (cl?.taxIdentifier) setRut(cl.taxIdentifier)
      if (cl?.environment === 'homologacion' || cl?.environment === 'produccion') {
        setAmbiente(cl.environment)
      }
    } catch {
      setSaveError(t('chileSii.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await fiscalAPI.putProvidersConfig({
        provider: 'chile_sii',
        rut: rut.trim(),
        ambiente,
      })
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('chileSii.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const rutDigits = rut.replace(/[-.\s]/g, '')

  return (
    <IfModule flag="billing.dte_sii">
      <section
        data-testid="section-chile-sii"
        className="mt-6 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="chile-sii-heading"
      >
        <header>
          <h2 id="chile-sii-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('chileSii.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('chileSii.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('chileSii.loading')}
          </p>
        )}

        {!loading && configured && statusRut && (
          <p className="text-sm text-green-700 dark:text-green-300" data-testid="chile-sii-configured-hint">
            {t('chileSii.configuredHint', { rut: statusRut, ambiente })}
          </p>
        )}

        {!loading && !configured && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('chileSii.notConfigured')}</p>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-3" data-testid="form-chile-sii">
          <div>
            <label htmlFor="chile-sii-rut" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('chileSii.rut')}
            </label>
            <input
              id="chile-sii-rut"
              data-testid="input-chile-sii-rut"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={rut}
              disabled={!canEdit || saving}
              onChange={(e) => setRut(e.target.value)}
              autoComplete="off"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="chile-sii-ambiente" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('chileSii.ambiente')}
            </label>
            <select
              id="chile-sii-ambiente"
              data-testid="select-chile-sii-ambiente"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={ambiente}
              disabled={!canEdit || saving}
              onChange={(e) => setAmbiente(e.target.value as 'homologacion' | 'produccion')}
            >
              <option value="homologacion">{t('chileSii.ambienteHomologacion')}</option>
              <option value="produccion">{t('chileSii.ambienteProduccion')}</option>
            </select>
          </div>
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-700 dark:text-green-300" role="status">
              {t('chileSii.saveSuccess')}
            </p>
          )}
          {canEdit && (
            <button
              type="submit"
              data-testid="btn-chile-sii-save"
              disabled={saving || rutDigits.length < 8}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? t('chileSii.saving') : t('chileSii.save')}
            </button>
          )}
        </form>
      </section>
    </IfModule>
  )
}
