import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fiscalAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

/**
 * @en Uruguay DGI CFE mock homologación credentials (RUT only; no live DGI secrets) (#207).
 * @es Credenciales mock de homologación CFE DGI Uruguay (solo RUT; sin secretos DGI live) (#207).
 * @pt-BR Credenciais mock de homologação CFE DGI Uruguai (apenas RUT; sem segredos DGI live) (#207).
 */
export default function UruguayDgiFiscalSection() {
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
      const uy = providers.find((p) => p.provider === 'uruguay_dgi')
      setConfigured(Boolean(uy?.configured))
      setStatusRut(uy?.taxIdentifier)
      if (uy?.taxIdentifier) setRut(uy.taxIdentifier)
      if (uy?.environment === 'homologacion' || uy?.environment === 'produccion') {
        setAmbiente(uy.environment)
      }
    } catch {
      setSaveError(t('uruguayDgi.errors.loadFailed'))
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
        provider: 'uruguay_dgi',
        rut: rut.trim(),
        ambiente,
      })
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('uruguayDgi.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <IfModule flag="billing.dgi_cfe">
      <section
        data-testid="section-uruguay-dgi"
        className="mt-6 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="uruguay-dgi-heading"
      >
        <header>
          <h2 id="uruguay-dgi-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('uruguayDgi.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('uruguayDgi.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('uruguayDgi.loading')}
          </p>
        )}

        {!loading && configured && statusRut && (
          <p className="text-sm text-green-700 dark:text-green-300" data-testid="uruguay-dgi-configured-hint">
            {t('uruguayDgi.configuredHint', { rut: statusRut, ambiente })}
          </p>
        )}

        {!loading && !configured && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('uruguayDgi.notConfigured')}</p>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-3" data-testid="form-uruguay-dgi">
          <div>
            <label htmlFor="uruguay-dgi-rut" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('uruguayDgi.rut')}
            </label>
            <input
              id="uruguay-dgi-rut"
              data-testid="input-uruguay-dgi-rut"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={rut}
              disabled={!canEdit || saving}
              onChange={(e) => setRut(e.target.value)}
              autoComplete="off"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="uruguay-dgi-ambiente" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('uruguayDgi.ambiente')}
            </label>
            <select
              id="uruguay-dgi-ambiente"
              data-testid="select-uruguay-dgi-ambiente"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={ambiente}
              disabled={!canEdit || saving}
              onChange={(e) => setAmbiente(e.target.value as 'homologacion' | 'produccion')}
            >
              <option value="homologacion">{t('uruguayDgi.ambienteHomologacion')}</option>
              <option value="produccion">{t('uruguayDgi.ambienteProduccion')}</option>
            </select>
          </div>
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-700 dark:text-green-300" role="status">
              {t('uruguayDgi.saveSuccess')}
            </p>
          )}
          {canEdit && (
            <button
              type="submit"
              data-testid="btn-uruguay-dgi-save"
              disabled={saving || rut.replace(/[-.\s]/g, '').length < 12}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? t('uruguayDgi.saving') : t('uruguayDgi.save')}
            </button>
          )}
        </form>
      </section>
    </IfModule>
  )
}
