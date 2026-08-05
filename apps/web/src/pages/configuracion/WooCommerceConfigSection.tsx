import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { woocommerceAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfIntegration from '@/components/IfIntegration'

/**
 * @en WooCommerce credential connection panel (Basic Auth: consumer key/secret), not OAuth (#188).
 * @es Panel de conexión de credenciales WooCommerce (Basic Auth: consumer key/secret), sin OAuth (#188).
 * @pt-BR Painel de conexão de credenciais WooCommerce (Basic Auth: consumer key/secret), sem OAuth (#188).
 */
export default function WooCommerceConfigSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit = claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [storeUrl, setStoreUrl] = useState<string | undefined>()
  const [storeName, setStoreName] = useState<string | undefined>()
  const [consumerKeyLast4, setConsumerKeyLast4] = useState<string | undefined>()
  const [hasWebhookSecret, setHasWebhookSecret] = useState(false)
  const [conectadoAt, setConectadoAt] = useState<string | undefined>()
  const [webhookUrl, setWebhookUrl] = useState<string | undefined>()

  const [formStoreUrl, setFormStoreUrl] = useState('')
  const [formConsumerKey, setFormConsumerKey] = useState('')
  const [formConsumerSecret, setFormConsumerSecret] = useState('')
  const [formWebhookSecret, setFormWebhookSecret] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const applyStatus = useCallback(
    (status: {
      connected: boolean
      storeUrl?: string
      storeName?: string
      consumerKeyLast4?: string
      hasWebhookSecret?: boolean
      conectadoAt?: string
      webhookUrl?: string
    }) => {
      setConnected(status.connected)
      setStoreUrl(status.storeUrl)
      setStoreName(status.storeName)
      setConsumerKeyLast4(status.consumerKeyLast4)
      setHasWebhookSecret(Boolean(status.hasWebhookSecret))
      setConectadoAt(status.conectadoAt)
      setWebhookUrl(status.webhookUrl)
    },
    [],
  )

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = await woocommerceAPI.getConfig()
      applyStatus(status)
    } catch {
      setError(t('woocommerce.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [applyStatus, t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const handleConnect = async () => {
    if (!canEdit) return
    setConnecting(true)
    setError(null)
    setSuccess(null)
    try {
      const status = await woocommerceAPI.verifyAndSave({
        storeUrl: formStoreUrl,
        consumerKey: formConsumerKey,
        consumerSecret: formConsumerSecret,
        webhookSecret: formWebhookSecret || undefined,
      })
      applyStatus(status)
      setFormConsumerKey('')
      setFormConsumerSecret('')
      setFormWebhookSecret('')
      setSuccess(t('woocommerce.connectSuccess'))
    } catch (err: unknown) {
      setError((err as Error).message || t('woocommerce.errors.connectFailed'))
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!canEdit) return
    setDisconnecting(true)
    setError(null)
    setSuccess(null)
    try {
      await woocommerceAPI.disconnect()
      setSuccess(t('woocommerce.disconnectSuccess'))
      await loadStatus()
    } catch (err: unknown) {
      setError((err as Error).message || t('woocommerce.errors.disconnectFailed'))
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <IfIntegration id="woocommerce">
      <section
        className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
        aria-labelledby="woocommerce-config-heading"
        data-testid="woocommerce-config-section"
      >
        <h2
          id="woocommerce-config-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {t('woocommerce.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t('woocommerce.subtitle')}
        </p>

        {!canEdit ? (
          <p className="mt-3 text-sm text-slate-500" data-testid="woocommerce-readonly-hint">
            {t('woocommerce.readOnlyHint')}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-slate-500" data-testid="woocommerce-loading">
            {t('woocommerce.loading')}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p
              className={`inline-flex rounded px-2 py-1 text-sm ${
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
              data-testid="woocommerce-connection-badge"
            >
              {connected
                ? t('woocommerce.connectedBadge', {
                    store: storeName ?? storeUrl ?? '—',
                    last4: consumerKeyLast4 ?? '????',
                  })
                : t('woocommerce.notConnectedBadge')}
            </p>

            {connected ? (
              <dl className="grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">{t('woocommerce.store')}</dt>
                  <dd data-testid="woocommerce-store">{storeName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('woocommerce.storeUrl')}</dt>
                  <dd data-testid="woocommerce-store-url">
                    {storeUrl ? (
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 dark:text-blue-300 underline"
                      >
                        {storeUrl}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">{t('woocommerce.connectedAt')}</dt>
                  <dd data-testid="woocommerce-connected-at">
                    {conectadoAt ? new Date(conectadoAt).toLocaleString() : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium">{t('woocommerce.webhookUrl')}</dt>
                  <dd data-testid="woocommerce-webhook-url" className="break-all font-mono text-xs">
                    {webhookUrl ?? '—'}
                  </dd>
                  {!hasWebhookSecret ? (
                    <p
                      className="mt-1 text-xs text-amber-700 dark:text-amber-400"
                      data-testid="woocommerce-webhook-secret-warning"
                    >
                      {t('woocommerce.webhookSecretWarning')}
                    </p>
                  ) : null}
                </div>
              </dl>
            ) : canEdit ? (
              <div className="space-y-3" data-testid="woocommerce-connect-form">
                <label className="block text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('woocommerce.fields.storeUrl')}
                  </span>
                  <input
                    type="url"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={formStoreUrl}
                    onChange={(e) => setFormStoreUrl(e.target.value)}
                    placeholder="https://mitienda.com"
                    data-testid="woocommerce-input-store-url"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('woocommerce.fields.consumerKey')}
                  </span>
                  <input
                    type="text"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={formConsumerKey}
                    onChange={(e) => setFormConsumerKey(e.target.value)}
                    data-testid="woocommerce-input-consumer-key"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('woocommerce.fields.consumerSecret')}
                  </span>
                  <input
                    type="password"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={formConsumerSecret}
                    onChange={(e) => setFormConsumerSecret(e.target.value)}
                    data-testid="woocommerce-input-consumer-secret"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('woocommerce.fields.webhookSecret')}
                  </span>
                  <input
                    type="password"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={formWebhookSecret}
                    onChange={(e) => setFormWebhookSecret(e.target.value)}
                    data-testid="woocommerce-input-webhook-secret"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    {t('woocommerce.fields.webhookSecretHint')}
                  </span>
                </label>
              </div>
            ) : null}

            {error ? (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
                data-testid="woocommerce-error"
              >
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                className="text-sm text-emerald-700 dark:text-emerald-300"
                role="status"
                data-testid="woocommerce-success"
              >
                {success}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              {!connected ? (
                <button
                  type="button"
                  className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
                  onClick={() => void handleConnect()}
                  disabled={
                    !canEdit ||
                    connecting ||
                    !formStoreUrl.trim() ||
                    !formConsumerKey.trim() ||
                    !formConsumerSecret.trim()
                  }
                  data-testid="woocommerce-connect-button"
                >
                  {connecting ? t('woocommerce.connecting') : t('woocommerce.connect')}
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40 disabled:opacity-60"
                  onClick={() => void handleDisconnect()}
                  disabled={!canEdit || disconnecting}
                  data-testid="woocommerce-disconnect-button"
                >
                  {disconnecting ? t('woocommerce.disconnecting') : t('woocommerce.disconnect')}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </IfIntegration>
  )
}
