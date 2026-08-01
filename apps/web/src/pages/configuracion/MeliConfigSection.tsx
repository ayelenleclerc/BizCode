import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { meliAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfIntegration from '@/components/IfIntegration'

/**
 * @en Mercado Libre OAuth connection panel for tenant settings (#183).
 * @es Panel de conexión OAuth Mercado Libre en configuración (#183).
 * @pt-BR Painel de conexão OAuth Mercado Livre nas configurações (#183).
 */
export default function MeliConfigSection() {
  const { t } = useTranslation('empresa')
  const [searchParams, setSearchParams] = useSearchParams()
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [nickname, setNickname] = useState<string | undefined>()
  const [sitio, setSitio] = useState<string | undefined>()
  const [meliUserId, setMeliUserId] = useState<string | undefined>()
  const [accessTokenLast4, setAccessTokenLast4] = useState<string | undefined>()
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | undefined>()
  const [conectadoAt, setConectadoAt] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = await meliAPI.getConfig()
      setConnected(status.connected)
      setNickname(status.nickname)
      setSitio(status.sitio)
      setMeliUserId(status.meliUserId)
      setAccessTokenLast4(status.accessTokenLast4)
      setTokenExpiresAt(status.tokenExpiresAt)
      setConectadoAt(status.conectadoAt)
    } catch {
      setError(t('meli.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useEffect(() => {
    if (searchParams.get('meli') !== 'connected') return
    setSuccess(t('meli.connectSuccess'))
    const next = new URLSearchParams(searchParams)
    next.delete('meli')
    setSearchParams(next, { replace: true })
    void meliAPI.getConfig().then((status) => {
      setConnected(status.connected)
      setNickname(status.nickname)
      setSitio(status.sitio)
      setMeliUserId(status.meliUserId)
      setAccessTokenLast4(status.accessTokenLast4)
      setTokenExpiresAt(status.tokenExpiresAt)
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
      const { authorizationUrl } = await meliAPI.getAuthorizeUrl()
      window.location.assign(authorizationUrl)
    } catch (err: unknown) {
      setError((err as Error).message || t('meli.errors.connectFailed'))
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!canEdit) return
    setDisconnecting(true)
    setError(null)
    setSuccess(null)
    try {
      await meliAPI.disconnect()
      setSuccess(t('meli.disconnectSuccess'))
      await loadStatus()
    } catch (err: unknown) {
      setError((err as Error).message || t('meli.errors.disconnectFailed'))
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <IfIntegration id="meli">
      <section
        className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
        aria-labelledby="meli-config-heading"
        data-testid="meli-config-section"
      >
        <h2
          id="meli-config-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {t('meli.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('meli.subtitle')}</p>

        {!canEdit ? (
          <p className="mt-3 text-sm text-slate-500" data-testid="meli-readonly-hint">
            {t('meli.readOnlyHint')}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-slate-500" data-testid="meli-loading">
            {t('meli.loading')}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p
              className={`inline-flex rounded px-2 py-1 text-sm ${
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
              data-testid="meli-connection-badge"
            >
              {connected
                ? t('meli.connectedBadge', {
                    nickname: nickname ?? meliUserId ?? '—',
                    sitio: sitio ?? '—',
                    last4: accessTokenLast4 ?? '????',
                  })
                : t('meli.notConnectedBadge')}
            </p>

            {connected ? (
              <dl className="grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">{t('meli.account')}</dt>
                  <dd data-testid="meli-account">{nickname ?? meliUserId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('meli.site')}</dt>
                  <dd data-testid="meli-site">{sitio ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t('meli.connectedAt')}</dt>
                  <dd data-testid="meli-connected-at">
                    {conectadoAt ? new Date(conectadoAt).toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">{t('meli.tokenExpiresAt')}</dt>
                  <dd data-testid="meli-token-expires">
                    {tokenExpiresAt ? new Date(tokenExpiresAt).toLocaleString() : '—'}
                  </dd>
                </div>
              </dl>
            ) : null}

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="meli-error">
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                className="text-sm text-emerald-700 dark:text-emerald-300"
                role="status"
                data-testid="meli-success"
              >
                {success}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              {!connected ? (
                <button
                  type="button"
                  className="rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-yellow-400 disabled:opacity-60"
                  onClick={() => void handleConnect()}
                  disabled={!canEdit || connecting}
                  data-testid="meli-connect-button"
                >
                  {connecting ? t('meli.connecting') : t('meli.connect')}
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40 disabled:opacity-60"
                  onClick={() => void handleDisconnect()}
                  disabled={!canEdit || disconnecting}
                  data-testid="meli-disconnect-button"
                >
                  {disconnecting ? t('meli.disconnecting') : t('meli.disconnect')}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </IfIntegration>
  )
}
