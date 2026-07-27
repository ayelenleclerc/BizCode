import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authAPI, getAuthErrorI18nKey } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const inputClassName =
  'w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

type SetupState =
  | { step: 'idle' }
  | { step: 'qr'; otpauthUrl: string; qrDataUrl: string; secret: string }
  | { step: 'backup'; backupCodes: string[] }

/**
 * @en Account security page: MFA enroll (QR + confirm), backup codes, and disable (#213).
 * @es Página de seguridad: alta MFA (QR + confirmación), códigos de respaldo y desactivación (#213).
 * @pt-BR Página de segurança: cadastro MFA (QR + confirmação), códigos de backup e desativação (#213).
 */
export default function SeguridadPage() {
  const { t } = useTranslation('common')
  const { claims, refresh } = useAuth()
  const [setup, setSetup] = useState<SetupState>({ step: 'idle' })
  const [code, setCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const mfaEnabled = claims?.mfaEnabled === true

  const handleStart = async () => {
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      const data = await authAPI.mfaSetupStart()
      setSetup({
        step: 'qr',
        otpauthUrl: data.otpauthUrl,
        qrDataUrl: data.qrDataUrl,
        secret: data.secret,
      })
      setCode('')
    } catch (err) {
      setError(t(getAuthErrorI18nKey(err)))
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!code.trim()) return
    setError(null)
    setBusy(true)
    try {
      const data = await authAPI.mfaSetupConfirm({ code: code.trim() })
      setSetup({ step: 'backup', backupCodes: data.backupCodes })
      await refresh()
      setMessage(t('security.mfa.enabledSuccess'))
    } catch (err) {
      setError(t(getAuthErrorI18nKey(err)))
    } finally {
      setBusy(false)
    }
  }

  const handleDisable = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!disableCode.trim()) return
    setError(null)
    setBusy(true)
    try {
      await authAPI.mfaDisable({ code: disableCode.trim() })
      setDisableCode('')
      setSetup({ step: 'idle' })
      await refresh()
      setMessage(t('security.mfa.disabledSuccess'))
    } catch (err) {
      setError(t(getAuthErrorI18nKey(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8" data-testid="security-page">
      <div>
        <p className="mb-2 text-sm text-slate-500">
          <Link to="/configuracion" className="text-blue-600 hover:underline dark:text-blue-400">
            {t('nav.configuracion')}
          </Link>
          {' / '}
          {t('nav.seguridad')}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('security.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('security.subtitle')}</p>
      </div>

      {error ? (
        <div role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200" data-testid="security-error">
          {error}
        </div>
      ) : null}
      {message ? (
        <div role="status" className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200" data-testid="security-message">
          {message}
        </div>
      ) : null}

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800" aria-labelledby="mfa-section-title">
        <h2 id="mfa-section-title" className="text-lg font-semibold">
          {t('security.mfa.title')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="security-mfa-status">
          {mfaEnabled ? t('security.mfa.statusOn') : t('security.mfa.statusOff')}
        </p>

        {!mfaEnabled && setup.step === 'idle' ? (
          <button
            type="button"
            data-testid="security-mfa-start"
            disabled={busy}
            onClick={() => void handleStart()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {t('security.mfa.enable')}
          </button>
        ) : null}

        {setup.step === 'qr' ? (
          <div className="space-y-4" data-testid="security-mfa-qr">
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('security.mfa.scanQr')}</p>
            <img src={setup.qrDataUrl} alt={t('security.mfa.qrAlt')} className="h-48 w-48 rounded border border-slate-200 dark:border-slate-600" />
            <p className="break-all font-mono text-xs text-slate-500" data-testid="security-mfa-secret">
              {t('security.mfa.manualSecret')}: {setup.secret}
            </p>
            <form onSubmit={handleConfirm} className="space-y-3">
              <label htmlFor="security-mfa-confirm-code" className="block text-sm font-medium">
                {t('security.mfa.confirmCode')}
              </label>
              <input
                id="security-mfa-confirm-code"
                data-testid="security-mfa-confirm-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className={inputClassName}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={busy}
              />
              <button
                type="submit"
                data-testid="security-mfa-confirm"
                disabled={busy || !code.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {t('security.mfa.confirm')}
              </button>
            </form>
          </div>
        ) : null}

        {setup.step === 'backup' ? (
          <div className="space-y-3" data-testid="security-mfa-backup-codes" role="region" aria-label={t('security.mfa.backupTitle')}>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('security.mfa.backupWarning')}</p>
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setup.backupCodes.map((c) => (
                <li key={c} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-900">
                  {c}
                </li>
              ))}
            </ul>
            <button
              type="button"
              data-testid="security-mfa-backup-done"
              className="rounded border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
              onClick={() => setSetup({ step: 'idle' })}
            >
              {t('security.mfa.backupDone')}
            </button>
          </div>
        ) : null}

        {mfaEnabled && setup.step === 'idle' ? (
          <form onSubmit={handleDisable} className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('security.mfa.disableTitle')}</h3>
            <label htmlFor="security-mfa-disable-code" className="block text-sm font-medium">
              {t('security.mfa.disableCode')}
            </label>
            <input
              id="security-mfa-disable-code"
              data-testid="security-mfa-disable-code"
              type="text"
              className={inputClassName}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              disabled={busy}
            />
            <button
              type="submit"
              data-testid="security-mfa-disable"
              disabled={busy || !disableCode.trim()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {t('security.mfa.disable')}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  )
}
