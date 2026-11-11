import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fiscalAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

/**
 * @en Brazil SEFAZ NF-e mock homologación credentials (CNPJ only; no live SEFAZ secrets) (#211).
 * @es Credenciales mock de homologación NF-e SEFAZ Brasil (solo CNPJ; sin secretos SEFAZ live) (#211).
 * @pt-BR Credenciais mock de homologação NF-e SEFAZ Brasil (apenas CNPJ; sem segredos SEFAZ live) (#211).
 */
export default function BrazilSefazFiscalSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit = claims?.role != null && hasPermission(claims.role, 'settings.fiscal.manage')

  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [statusCnpj, setStatusCnpj] = useState<string | undefined>()
  const [cnpj, setCnpj] = useState('')
  const [ambiente, setAmbiente] = useState<'homologacion' | 'produccion'>('homologacion')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const providers = await fiscalAPI.getProvidersConfig()
      const br = providers.find((p) => p.provider === 'brazil_sefaz_nfe')
      setConfigured(Boolean(br?.configured))
      setStatusCnpj(br?.taxIdentifier)
      if (br?.taxIdentifier) setCnpj(br.taxIdentifier)
      if (br?.environment === 'homologacion' || br?.environment === 'produccion') {
        setAmbiente(br.environment)
      }
    } catch {
      setSaveError(t('brazilSefaz.errors.loadFailed'))
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
        provider: 'brazil_sefaz_nfe',
        cnpj: cnpj.trim(),
        ambiente,
      })
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('brazilSefaz.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const cnpjDigits = cnpj.replace(/\D/g, '')

  return (
    <IfModule flag="billing.nfe_sefaz">
      <section
        data-testid="section-brazil-sefaz"
        className="mt-6 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="brazil-sefaz-heading"
      >
        <header>
          <h2 id="brazil-sefaz-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('brazilSefaz.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('brazilSefaz.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('brazilSefaz.loading')}
          </p>
        )}

        {!loading && configured && statusCnpj && (
          <p className="text-sm text-green-700 dark:text-green-300" data-testid="brazil-sefaz-configured-hint">
            {t('brazilSefaz.configuredHint', { cnpj: statusCnpj, ambiente })}
          </p>
        )}

        {!loading && !configured && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('brazilSefaz.notConfigured')}</p>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-3" data-testid="form-brazil-sefaz">
          <div>
            <label htmlFor="brazil-sefaz-cnpj" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('brazilSefaz.cnpj')}
            </label>
            <input
              id="brazil-sefaz-cnpj"
              data-testid="input-brazil-sefaz-cnpj"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={cnpj}
              disabled={!canEdit || saving}
              onChange={(e) => setCnpj(e.target.value)}
              autoComplete="off"
              maxLength={18}
            />
          </div>
          <div>
            <label
              htmlFor="brazil-sefaz-ambiente"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('brazilSefaz.ambiente')}
            </label>
            <select
              id="brazil-sefaz-ambiente"
              data-testid="select-brazil-sefaz-ambiente"
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
              value={ambiente}
              disabled={!canEdit || saving}
              onChange={(e) => setAmbiente(e.target.value as 'homologacion' | 'produccion')}
            >
              <option value="homologacion">{t('brazilSefaz.ambienteHomologacion')}</option>
              <option value="produccion">{t('brazilSefaz.ambienteProduccion')}</option>
            </select>
          </div>
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-700 dark:text-green-300" role="status">
              {t('brazilSefaz.saveSuccess')}
            </p>
          )}
          {canEdit && (
            <button
              type="submit"
              data-testid="btn-brazil-sefaz-save"
              disabled={saving || cnpjDigits.length < 14}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? t('brazilSefaz.saving') : t('brazilSefaz.save')}
            </button>
          )}
        </form>
      </section>
    </IfModule>
  )
}
