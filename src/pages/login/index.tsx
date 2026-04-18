import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthErrorI18nKey } from '@/lib/api'

const loginInputClassName =
  'w-full rounded border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/**
 * @en Login form (tenant, user, password) with i18n and cookie session via AuthProvider.
 * @es Formulario de inicio de sesión (tenant, usuario, contraseña) con i18n y sesión por cookie.
 * @pt-BR Formulário de login (tenant, usuário, senha) com i18n e sessão por cookie.
 */
export default function LoginPage() {
  const { t } = useTranslation('common')
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    try {
      await login({
        tenantSlug: data.tenantSlug.trim(),
        username: data.username.trim(),
        password: data.password,
      })
    } catch (err) {
      setSubmitError(t(getAuthErrorI18nKey(err)))
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t('app.name')}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('auth.subtitle')}</p>
        </header>

        <div className="mb-6 flex justify-end">
          <LanguageSelect data-testid="login-language" id="login-language-select" />
        </div>

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
          </div>

          <button
            type="submit"
            data-testid="login-submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
