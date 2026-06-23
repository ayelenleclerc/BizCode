import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
import { arcaAPI, type ArcaConfigInput } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

export default function ArcaFiscalSection() {
  const { t } = useTranslation('empresa')
  const formShortcuts = useFormShortcuts()
  const formRef = useRef<HTMLFormElement>(null)
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.fiscal.manage')

  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [statusCuit, setStatusCuit] = useState<string | undefined>()
  const [statusAmbiente, setStatusAmbiente] = useState<string | undefined>()
  const [cuit, setCuit] = useState('')
  const [certificate, setCertificate] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [ambiente, setAmbiente] = useState<'homologacion' | 'produccion'>('homologacion')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const status = await arcaAPI.getConfig()
      setConfigured(status.configured)
      setStatusCuit(status.cuit)
      setStatusAmbiente(status.ambiente)
      if (status.cuit) setCuit(status.cuit)
      if (status.ambiente === 'homologacion' || status.ambiente === 'produccion') {
        setAmbiente(status.ambiente)
      }
    } catch {
      setSaveError(t('arca.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useFormPageHotkeys({
    onSave: canEdit ? () => formRef.current?.requestSubmit() : undefined,
    onClose: () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    },
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const body: ArcaConfigInput = {
        cuit: cuit.trim(),
        certificate: certificate.trim(),
        privateKey: privateKey.trim(),
        ambiente,
      }
      await arcaAPI.putConfig(body)
      setCertificate('')
      setPrivateKey('')
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('arca.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleTestAuth = async () => {
    setAuthLoading(true)
    setAuthMessage(null)
    try {
      const ta = await arcaAPI.auth()
      setAuthMessage(t('arca.authSuccess', { expiration: new Date(ta.expiration).toLocaleString() }))
    } catch (err: unknown) {
      setAuthMessage((err as Error).message || t('arca.errors.authFailed'))
    } finally {
      setAuthLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70'

  return (
    <IfModule flag="billing.arca_cae">
      <section
        data-testid="section-arca-fiscal"
        className="mt-8 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="arca-fiscal-heading"
      >
        <header>
          <h2 id="arca-fiscal-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('arca.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('arca.subtitle')}</p>
        </header>

        <KeyboardHint shortcuts={formShortcuts} className="mb-2" />

        {loading ? (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('arca.loading')}
          </p>
        ) : (
          <>
            {configured && (
              <p className="text-sm text-green-700 dark:text-green-400" role="status" data-testid="arca-configured">
                {t('arca.configuredHint', { cuit: statusCuit ?? '—', ambiente: statusAmbiente ?? '—' })}
              </p>
            )}
            {!configured && (
              <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
                {t('arca.notConfigured')}
              </p>
            )}

            {!canEdit && (
              <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
                {t('arca.readOnlyHint')}
              </p>
            )}

            <form
              ref={formRef}
              data-testid="form-arca-fiscal"
              onSubmit={(e) => void handleSave(e)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="arca-cuit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('arca.cuit')}
                </label>
                <input
                  id="arca-cuit"
                  data-testid="input-arca-cuit"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  disabled={!canEdit}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="arca-certificate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('arca.certificate')}
                </label>
                <textarea
                  id="arca-certificate"
                  data-testid="input-arca-certificate"
                  value={certificate}
                  onChange={(e) => setCertificate(e.target.value)}
                  disabled={!canEdit}
                  rows={4}
                  className={`${inputClass} font-mono text-xs`}
                  placeholder={configured ? t('arca.certificatePlaceholderUpdate') : t('arca.certificatePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="arca-private-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('arca.privateKey')}
                </label>
                <textarea
                  id="arca-private-key"
                  data-testid="input-arca-private-key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  disabled={!canEdit}
                  rows={4}
                  className={`${inputClass} font-mono text-xs`}
                  placeholder={configured ? t('arca.privateKeyPlaceholderUpdate') : t('arca.privateKeyPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="arca-ambiente" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('arca.ambiente')}
                </label>
                <select
                  id="arca-ambiente"
                  data-testid="select-arca-ambiente"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value as 'homologacion' | 'produccion')}
                  disabled={!canEdit}
                  className={inputClass}
                >
                  <option value="homologacion">{t('arca.ambienteHomologacion')}</option>
                  <option value="produccion">{t('arca.ambienteProduccion')}</option>
                </select>
              </div>

              {saveError && (
                <p className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="polite">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="text-green-700 dark:text-green-400 text-sm" role="status">
                  {t('arca.saveSuccess')}
                </p>
              )}

              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    data-testid="btn-save-arca"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                  >
                    {saving ? t('arca.saving') : t('arca.save')}
                  </button>
                  <button
                    type="button"
                    data-testid="btn-arca-test-auth"
                    disabled={authLoading || !configured}
                    onClick={() => void handleTestAuth()}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                  >
                    {authLoading ? t('arca.authLoading') : t('arca.testAuth')}
                  </button>
                </div>
              )}

              {authMessage && (
                <p className="text-sm text-slate-700 dark:text-slate-300" role="status" aria-live="polite">
                  {authMessage}
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </IfModule>
  )
}
