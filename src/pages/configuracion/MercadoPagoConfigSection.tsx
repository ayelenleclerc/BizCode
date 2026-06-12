import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
import { mercadopagoAPI, type MercadoPagoConfigInput } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfIntegration from '@/components/IfIntegration'

export default function MercadoPagoConfigSection() {
  const { t } = useTranslation('empresa')
  const formShortcuts = useFormShortcuts()
  const formRef = useRef<HTMLFormElement>(null)
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [accessTokenLast4, setAccessTokenLast4] = useState<string | undefined>()
  const [webhookSecretSet, setWebhookSecretSet] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [sandboxMode, setSandboxMode] = useState(true)
  const [activo, setActivo] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const status = await mercadopagoAPI.getConfig()
      setConfigured(status.configured)
      setAccessTokenLast4(status.accessTokenLast4)
      setWebhookSecretSet(Boolean(status.webhookSecretSet))
      if (status.publicKey) setPublicKey(status.publicKey)
      if (status.sandboxMode !== undefined) setSandboxMode(status.sandboxMode)
      if (status.activo !== undefined) setActivo(status.activo)
    } catch {
      setSaveError(t('mercadopago.errors.loadFailed'))
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
      const body: MercadoPagoConfigInput = {
        publicKey: publicKey.trim(),
        sandboxMode,
        activo,
      }
      if (accessToken.trim()) body.accessToken = accessToken.trim()
      if (webhookSecret.trim()) body.webhookSecret = webhookSecret.trim()
      await mercadopagoAPI.putConfig(body)
      setAccessToken('')
      setWebhookSecret('')
      setSaveSuccess(true)
      await loadStatus()
    } catch (err: unknown) {
      setSaveError((err as Error).message || t('mercadopago.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTestLoading(true)
    setTestMessage(null)
    try {
      const result = await mercadopagoAPI.testCredentials()
      setTestMessage(
        t('mercadopago.testSuccess', {
          accountName: result.accountName,
          email: result.email ?? '—',
        }),
      )
    } catch (err: unknown) {
      setTestMessage((err as Error).message || t('mercadopago.errors.testFailed'))
    } finally {
      setTestLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70'

  return (
    <IfIntegration id="mercadopago">
      <section
        data-testid="section-mercadopago"
        className="mt-8 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="mercadopago-heading"
      >
        <header>
          <h2 id="mercadopago-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('mercadopago.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('mercadopago.subtitle')}</p>
        </header>

        <KeyboardHint shortcuts={formShortcuts} className="mb-2" />

        {loading ? (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('mercadopago.loading')}
          </p>
        ) : (
          <>
            <p
              className={`text-sm ${configured ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}
              role="status"
              data-testid="mercadopago-status-badge"
            >
              {configured
                ? t('mercadopago.configuredBadge', { last4: accessTokenLast4 ?? '—' })
                : t('mercadopago.notConfiguredBadge')}
            </p>

            {configured && webhookSecretSet && (
              <p className="text-sm text-slate-600 dark:text-slate-400" role="status">
                {t('mercadopago.webhookSecretSet')}
              </p>
            )}

            {!canEdit && (
              <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
                {t('mercadopago.readOnlyHint')}
              </p>
            )}

            <form
              ref={formRef}
              data-testid="form-mercadopago"
              onSubmit={(e) => void handleSave(e)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="mp-access-token" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('mercadopago.accessToken')}
                </label>
                <input
                  id="mp-access-token"
                  type="password"
                  autoComplete="off"
                  data-testid="input-mp-access-token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={!canEdit}
                  className={inputClass}
                  placeholder={configured ? t('mercadopago.accessTokenPlaceholderUpdate') : t('mercadopago.accessTokenPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="mp-public-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('mercadopago.publicKey')}
                </label>
                <input
                  id="mp-public-key"
                  data-testid="input-mp-public-key"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  disabled={!canEdit}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="mp-webhook-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('mercadopago.webhookSecret')}
                </label>
                <input
                  id="mp-webhook-secret"
                  type="password"
                  autoComplete="off"
                  data-testid="input-mp-webhook-secret"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  disabled={!canEdit}
                  className={inputClass}
                  placeholder={configured ? t('mercadopago.webhookSecretPlaceholderUpdate') : t('mercadopago.webhookSecretPlaceholder')}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    data-testid="checkbox-mp-sandbox"
                    checked={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.checked)}
                    disabled={!canEdit}
                  />
                  {t('mercadopago.sandboxMode')}
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    data-testid="checkbox-mp-activo"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    disabled={!canEdit}
                  />
                  {t('mercadopago.activo')}
                </label>
              </div>

              {saveError && (
                <p className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="polite">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="text-green-700 dark:text-green-400 text-sm" role="status">
                  {t('mercadopago.saveSuccess')}
                </p>
              )}

              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    data-testid="btn-save-mercadopago"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                  >
                    {saving ? t('mercadopago.saving') : t('mercadopago.save')}
                  </button>
                  <button
                    type="button"
                    data-testid="btn-mp-test-credentials"
                    disabled={testLoading || !configured}
                    onClick={() => void handleTest()}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                  >
                    {testLoading ? t('mercadopago.testLoading') : t('mercadopago.testCredentials')}
                  </button>
                </div>
              )}

              {testMessage && (
                <p className="text-sm text-slate-700 dark:text-slate-300" role="status" aria-live="polite">
                  {testMessage}
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </IfIntegration>
  )
}
