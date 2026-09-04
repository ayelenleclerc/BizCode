import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fiscalAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

/**
 * @en Mexico SAT PAC mock homologación credentials (RFC only; no live PAC secrets) (#210).
 * @es Credenciales mock de homologación PAC SAT México (solo RFC; sin secretos PAC live) (#210).
 * @pt-BR Credenciais mock de homologação PAC SAT México (apenas RFC; sem segredos PAC live) (#210).
 */
export default function MexicoSatFiscalSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit = claims?.role != null && hasPermission(claims.role, 'settings.fiscal.manage')

  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [statusRfc, setStatusRfc] = useState<string | undefined>()
  const [rfc, setRfc] = useState('')
  const [ambiente, setAmbiente] = useState<'homologacion' | 'produccion'>('homologacion')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const providers = await fiscalAPI.getProvidersConfig()
      const mx = providers.find((p) => p.provider === 'mexico_sat_pac')
      setConfigured(Boolean(mx?.configured))
      setStatusRfc(mx?.taxIdentifier)
      if (mx?.taxIdentifier) setRfc(mx.taxIdentifier)
      if (mx?.environment === 'homologacion' || mx?.environment === 'produccion') {
        setAmbiente(mx.environment)
      }
    } catch {
      setSaveError(t('mexicoSat.errors.loadFailed'))
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
        provider: 'mexico_sat_pac',
        rfc: rfc.trim(),
        ambiente,
      })
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('mexicoSat.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfModule flag="billing.cfdi_sat">
      <section
        data-testid="section-mexico-sat"
        className="mt-6 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="mexico-sat-heading"
      >
        <header>
          <h2 id="mexico-sat-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('mexicoSat.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('mexicoSat.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('mexicoSat.loading')}
          </p>
        )}

        {!loading && configured && statusRfc && (
          <p className="text-sm text-green-700 dark:text-green-300" data-testid="mexico-sat-configured-hint">
            {t('mexicoSat.configuredHint', { rfc: statusRfc, ambiente })}
          </p>
        )}

        {!loading && !configured && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('mexicoSat.notConfigured')}</p>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-3" data-testid="form-mexico-sat">
          <div>
            <label htmlFor="mexico-sat-rfc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('mexicoSat.rfc')}
            </label>
            <input
              id="mexico-sat-rfc"
              data-testid="input-mexico-sat-rfc"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={rfc}
              disabled={!canEdit || saving}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              autoComplete="off"
              maxLength={13}
            />
          </div>
          <div>
            <label htmlFor="mexico-sat-ambiente" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('mexicoSat.ambiente')}
            </label>
            <select
              id="mexico-sat-ambiente"
              data-testid="select-mexico-sat-ambiente"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={ambiente}
              disabled={!canEdit || saving}
              onChange={(e) => setAmbiente(e.target.value as 'homologacion' | 'produccion')}
            >
              <option value="homologacion">{t('mexicoSat.ambienteHomologacion')}</option>
              <option value="produccion">{t('mexicoSat.ambienteProduccion')}</option>
            </select>
          </div>
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-700 dark:text-green-300" role="status">
              {t('mexicoSat.saveSuccess')}
            </p>
          )}
          {canEdit && (
            <button
              type="submit"
              data-testid="btn-mexico-sat-save"
              disabled={saving || rfc.trim().length < 12}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? t('mexicoSat.saving') : t('mexicoSat.save')}
            </button>
          )}
        </form>
      </section>
    </IfModule>
  )
}
