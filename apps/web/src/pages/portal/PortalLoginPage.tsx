import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { portalAPI } from '@/lib/portalApi'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

/**
 * @en Magic-link login for the B2B customer portal (#240).
 * @es Login por magic link del portal B2B (#240).
 * @pt-BR Login por magic link do portal B2B (#240).
 */
export default function PortalLoginPage() {
  const { t } = useTranslation('portal')
  const { tenantSlug, branding } = usePortalAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const schema = z.object({
    email: z.string().trim().min(1, t('login.validation.emailRequired')).email(t('login.validation.emailInvalid')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null)
    try {
      await portalAPI.requestMagicLink(tenantSlug, data.email)
      setSent(true)
    } catch {
      setSubmitError(t('login.errorGeneric'))
    }
  })

  if (branding && !branding.enabled) {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900"
        role="alert"
        data-testid="portal-unavailable"
      >
        {t('login.portalUnavailable')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('login.title')}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('login.subtitle')}</p>

      {sent ? (
        <p
          className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200"
          role="status"
          aria-live="polite"
          data-testid="portal-magic-link-sent"
        >
          {t('login.checkEmail')}
        </p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="portal-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('login.emailLabel')}
            </label>
            <input
              id="portal-email"
              type="email"
              autoComplete="email"
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              data-testid="portal-email-input"
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          {submitError ? (
            <p className="text-sm text-red-600" role="alert" aria-live="assertive">
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            data-testid="portal-login-submit"
          >
            {isSubmitting ? t('login.sending') : t('login.submit')}
          </button>
        </form>
      )}
    </div>
  )
}
