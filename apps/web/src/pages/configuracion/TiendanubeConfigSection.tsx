import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { tiendanubeAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfIntegration from '@/components/IfIntegration'

/**
 * @en Tiendanube OAuth connection panel for tenant settings (#187).
 * @es Panel de conexión OAuth Tiendanube en configuración (#187).
 * @pt-BR Painel de conexão OAuth Tiendanube nas configurações (#187).
 */
export default function TiendanubeConfigSection() {
  const { t } = useTranslation('empresa')
  const [searchParams, setSearchParams] = useSearchParams()
  const { claims } = useAuth()
  const canEdit = claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [storeId, setStoreId] = useState<string | undefined>()
  const [storeName, setStoreName] = useState<string | undefined>()
  const [storeUrl, setStoreUrl] = useState<string | undefined>()
  const [accessTokenLast4, setAccessTokenLast4] = useState<string | undefined>()
  const [conectadoAt, setConectadoAt] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = await tiendanubeAPI.getConfig()
      setConnected(status.connected)
      setStoreId(status.storeId)
      setStoreName(status.storeName)
      setStoreUrl(status.storeUrl)
      setAccessTokenLast4(status.accessTokenLast4)
      setConectadoAt(status.conectadoAt)
    } catch {
      setError(t('tiendanube.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useEffect(() => {
    if (searchParams.get('tiendanube') !== 'connected') return
    setSuccess(t('tiendanube.connectSuccess'))
    const next = new URLSearchParams(searchParams)
    next.delete('tiendanube')
    setSearchParams(next, { replace: true })
    void tiendanubeAPI.getConfig().then((status) => {
      setConnected(status.connected)
      setStoreId(status.storeId)
      setStoreName(status.storeName)
      setStoreUrl(status.storeUrl)
      setAccessTokenLast4(status.accessTokenLast4)
      setConectadoAt(status.conectadoAt)
      setLoading(false)
    })
  }, [searchParams, setSearchParams, t])

  const handleConnect = async () => {
    if (!canEdit) return
    setConnecting(true)
    setError(null)
    setSuccess(null)
    try {
      const { authorizationUrl } = await tiendanubeAPI.getAuthorizeUrl()
      window.location.assign(authorizationUrl)
    } catch (err: unknown) {
      setError((err as Error).message || t('tiendanube.errors.connectFailed'))
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!canEdit) return
    setDisconnecting(true)
    setError(null)
    setSuccess(null)
    try {
      await tiendanubeAPI.disconnect()
      setSuccess(t('tiendanube.disconnectSuccess'))
      await loadStatus()
    } catch (err: unknown) {
      setError((err as Error).message || t('tiendanube.errors.disconnectFailed'))
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <IfIntegration id="tiendanube">
      <section
        className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
        aria-labelledby="tiendanube-config-heading"
        data-testid="tiendanube-config-section"
      >
        <h2
          id="tiendanube-config-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {t('tiendanube.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t('tiendanube.subtitle')}
        </p>

        {!canEdit ? (
          <p className="mt-3 text-sm text-slate-500" data-testid="tiendanube-readonly-hint">
            {t('tiendanube.readOnlyHint')}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-slate-500" data-testid="tiendanube-loading">
            {t('tiendanube.loading')}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p
              className={`inline-flex rounded px-2 py-1 text-sm ${
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
              data-testid="tiendanube-connection-badge"
            >
              {connected
                ? t('tiendanube.connectedBadge', {
                    store: storeName ?? storeId ?? '—',
                    last4: accessTokenLast4 ?? '????',
                  })
                : t('tiendanube.notConnectedBadge')}
            </p>

            {connected ? (
              <dl className="grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">{t('tiendanube.store')}</dt>
                  <dd data-testid="tiendanube-store">{storeName ?? storeId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('tiendanube.storeId')}</dt>
                  <dd data-testid="tiendanube-store-id">{storeId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('tiendanube.storeUrl')}</dt>
                  <dd data-testid="tiendanube-store-url">
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
                  <dt className="font-medium">{t('tiendanube.connectedAt')}</dt>
                  <dd data-testid="tiendanube-connected-at">
                    {conectadoAt ? new Date(conectadoAt).toLocaleString() : '—'}
                  </dd>
                </div>
              </dl>
            ) : null}

            {error ? (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
                data-testid="tiendanube-error"
              >
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                className="text-sm text-emerald-700 dark:text-emerald-300"
                role="status"
                data-testid="tiendanube-success"
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
                  disabled={!canEdit || connecting}
                  data-testid="tiendanube-connect-button"
                >
                  {connecting ? t('tiendanube.connecting') : t('tiendanube.connect')}
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40 disabled:opacity-60"
                  onClick={() => void handleDisconnect()}
                  disabled={!canEdit || disconnecting}
                  data-testid="tiendanube-disconnect-button"
                >
                  {disconnecting ? t('tiendanube.disconnecting') : t('tiendanube.disconnect')}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </IfIntegration>
  )
}
