import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import KeyboardHint, { useLoginShortcuts } from '@/components/shared/KeyboardHint'
import { useAuth } from '@/contexts/AuthContext'
import { ApiRequestFailedError, getAuthErrorI18nKey } from '@/lib/api'

const loginInputClassName =
  'w-full rounded border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

function resolveLockoutResetAt(rateLimitReset?: string): number | null {
  if (rateLimitReset) {
    const parsed = Date.parse(rateLimitReset)
    return Number.isFinite(parsed) ? parsed : null
  }
  return Date.now() + 15 * 60_000
}

function formatRetryCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * @en Login form (tenant, user, password) with optional MFA TOTP step (#213).
 * @es Formulario de inicio de sesión con paso opcional MFA TOTP (#213).
 * @pt-BR Formulário de login com passo opcional MFA TOTP (#213).
 */
export default function LoginPage() {
  const { t } = useTranslation('common')
  const loginShortcuts = useLoginShortcuts()
  const { login, verifyMfa } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSubmitting, setMfaSubmitting] = useState(false)

  const loginSchema = z.object({
    tenantSlug: z.string().min(1, t('auth.validation.tenantRequired')),
    username: z.string().min(1, t('auth.validation.usernameRequired')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  })

  type LoginFormData = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      tenantSlug: '',
      username: '',
      password: '',
    },
  })

  const retryCountdown =
    lockoutUntil !== null && lockoutUntil > now ? formatRetryCountdown(lockoutUntil - now) : null
  const isLockedOut = retryCountdown !== null
  const isLoginDisabled = isSubmitting || isLockedOut

  useEffect(() => {
    if (lockoutUntil === null || lockoutUntil <= Date.now()) {
      return
    }

    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(id)
  }, [lockoutUntil])

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    try {
      const outcome = await login({
        tenantSlug: data.tenantSlug.trim(),
        username: data.username.trim(),
        password: data.password,
      })
      setLockoutUntil(null)
      if (outcome.status === 'mfa_required') {
        setMfaToken(outcome.mfaToken)
        setMfaCode('')
      }
    } catch (err) {
      if (
        err instanceof ApiRequestFailedError &&
        (err.message === 'ACCOUNT_LOCKED' || err.httpStatus === 429)
      ) {
        const resetAt = resolveLockoutResetAt(err.rateLimitReset)
        if (resetAt !== null) {
          setLockoutUntil(resetAt)
        }
      } else {
        setLockoutUntil(null)
      }
      setSubmitError(t(getAuthErrorI18nKey(err)))
    }
  }

  const onMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mfaToken || !mfaCode.trim()) return
    setSubmitError(null)
    setMfaSubmitting(true)
    try {
      await verifyMfa(mfaToken, mfaCode.trim())
      setMfaToken(null)
    } catch (err) {
      setSubmitError(t(getAuthErrorI18nKey(err)))
    } finally {
      setMfaSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t('app.name')}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {mfaToken ? t('auth.mfa.subtitle') : t('auth.subtitle')}
          </p>
        </header>

        <div className="mb-6 flex justify-end">
          <LanguageSelect data-testid="login-language" id="login-language-select" />
        </div>

        {mfaToken ? (
          <form onSubmit={onMfaSubmit} noValidate aria-labelledby="mfa-heading">
            <h2 id="mfa-heading" className="sr-only">
              {t('auth.mfa.formTitle')}
            </h2>
            <div>
              <label htmlFor="login-mfa-code" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('auth.mfa.codeLabel')}
              </label>
              <input
                id="login-mfa-code"
                data-testid="login-mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className={loginInputClassName}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                disabled={mfaSubmitting}
                aria-describedby="login-mfa-hint"
              />
              <p id="login-mfa-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('auth.mfa.codeHint')}
              </p>
            </div>
            <div
              className="mt-4 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {submitError ?? ''}
            </div>
            <button
              type="submit"
              data-testid="login-mfa-submit"
              disabled={mfaSubmitting || !mfaCode.trim()}
              className="mt-2 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {mfaSubmitting ? t('auth.mfa.submitting') : t('auth.mfa.submit')}
            </button>
            <button
              type="button"
              data-testid="login-mfa-back"
              className="mt-3 w-full text-sm text-slate-600 underline dark:text-slate-400"
              onClick={() => {
                setMfaToken(null)
                setMfaCode('')
                setSubmitError(null)
              }}
            >
              {t('auth.mfa.back')}
            </button>
          </form>
        ) : (
          <>
            <KeyboardHint shortcuts={loginShortcuts} className="mb-4" />

            <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="login-heading">
              <h2 id="login-heading" className="sr-only">
                {t('auth.formTitle')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="login-tenant-slug" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('auth.fields.tenantSlug')}
                  </label>
                  {errors.tenantSlug ? (
                    <input
                      id="login-tenant-slug"
                      data-testid="login-tenant-slug"
                      type="text"
                      autoComplete="organization"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('tenantSlug')}
                      aria-invalid="true"
                      aria-describedby="login-tenant-slug-error"
                    />
                  ) : (
                    <input
                      id="login-tenant-slug"
                      data-testid="login-tenant-slug"
                      type="text"
                      autoComplete="organization"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('tenantSlug')}
                    />
                  )}
                  {errors.tenantSlug && (
                    <p id="login-tenant-slug-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.tenantSlug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('auth.fields.username')}
                  </label>
                  {errors.username ? (
                    <input
                      id="login-username"
                      data-testid="login-username"
                      type="text"
                      autoComplete="username"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('username')}
                      aria-invalid="true"
                      aria-describedby="login-username-error"
                    />
                  ) : (
                    <input
                      id="login-username"
                      data-testid="login-username"
                      type="text"
                      autoComplete="username"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('username')}
                    />
                  )}
                  {errors.username && (
                    <p id="login-username-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('auth.fields.password')}
                  </label>
                  {errors.password ? (
                    <input
                      id="login-password"
                      data-testid="login-password"
                      type="password"
                      autoComplete="current-password"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('password')}
                      aria-invalid="true"
                      aria-describedby="login-password-error"
                    />
                  ) : (
                    <input
                      id="login-password"
                      data-testid="login-password"
                      type="password"
                      autoComplete="current-password"
                      className={loginInputClassName}
                      disabled={isLoginDisabled}
                      {...register('password')}
                    />
                  )}
                  {errors.password && (
                    <p id="login-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mt-4 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {submitError ?? ''}
                {retryCountdown ? (
                  <p className="mt-1" data-testid="login-lockout-countdown">
                    {t('auth.lockout.retryIn', { time: retryCountdown })}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                data-testid="login-submit"
                disabled={isLoginDisabled}
                className="mt-2 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {isSubmitting ? t('auth.submitting') : t('auth.submit')}
              </button>

              <p className="mt-4 text-center text-sm">
                <a
                  href="/privacidad"
                  className="text-blue-700 underline dark:text-blue-400"
                  data-testid="login-privacy-link"
                >
                  {t('auth.privacyLink')}
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
