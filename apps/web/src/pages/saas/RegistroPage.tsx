import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { saasAPI, type SaasJurisdictionOption } from '@/lib/api'
import { DEFAULT_FISCAL_JURISDICTION } from '@bizcode/types'

/**
 * @en Public SaaS registration form (#180).
 * @es Formulario público de registro SaaS (#180).
 * @pt-BR Formulário público de registro SaaS (#180).
 */
export default function RegistroPage() {
  const { t } = useTranslation('saas')
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [cuit, setCuit] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tenantSlug, setTenantSlug] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  /**
   * @en Jurisdictions this installation offers (#437). Until they load, or when only one is offered,
   *   the selector stays hidden and the installation default applies.
   * @es Jurisdicciones que ofrece esta instalación (#437). Hasta que cargan, o si solo se ofrece una,
   *   el selector queda oculto y rige el default de la instalación.
   * @pt-BR Jurisdições oferecidas por esta instalação (#437). Até carregarem, ou se apenas uma for
   *   oferecida, o seletor fica oculto e vale o padrão da instalação.
   */
  const [jurisdictions, setJurisdictions] = useState<SaasJurisdictionOption[]>([])
  const [jurisdiccionFiscal, setJurisdiccionFiscal] = useState('')
  const selectedTaxIdKind =
    jurisdictions.find((option) => option.code === jurisdiccionFiscal)?.taxIdKind ?? 'cuit'
  /**
   * @en Labels follow the jurisdiction, not the identifier kind: Uruguay and Chile both call it
   *   RUT but expect different formats, so a shared label would show the wrong example (#208).
   * @es Las etiquetas siguen a la jurisdicción, no al tipo: Uruguay y Chile llaman RUT a formatos
   *   distintos, así que una etiqueta compartida mostraría el ejemplo equivocado (#208).
   * @pt-BR Os rótulos seguem a jurisdição, não o tipo: Uruguai e Chile chamam de RUT formatos
   *   diferentes, então um rótulo compartilhado mostraria o exemplo errado (#208).
   */
  const selectedJurisdiction = jurisdiccionFiscal || DEFAULT_FISCAL_JURISDICTION

  useEffect(() => {
    void saasAPI
      .jurisdictions()
      .then((data) => {
        setJurisdictions(data.enabled)
        setJurisdiccionFiscal(data.default)
      })
      .catch(() => {
        /* the installation default applies when the lookup fails */
      })
  }, [])

  useEffect(() => {
    if (businessName.trim().length < 2) return
    const handle = window.setTimeout(() => {
      void saasAPI
        .suggestSlug(businessName)
        .then((r) => {
          setTenantSlug((prev) => (prev.trim() ? prev : r.slug))
        })
        .catch(() => {
          /* suggestion is optional */
        })
    }, 300)
    return () => window.clearTimeout(handle)
  }, [businessName])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms || !acceptPrivacy) {
      setStatus('error')
      setErrorMessage(t('register.errorGeneric'))
      return
    }
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await saasAPI.register({
        businessName,
        cuit,
        jurisdiccionFiscal: jurisdiccionFiscal || undefined,
        email,
        phone: phone.trim() || undefined,
        tenantSlug,
        password,
        acceptTerms: true,
        acceptPrivacy: true,
      })
      setCreatedSlug(result.tenantSlug)
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : t('register.errorGeneric'))
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16" data-testid="saas-register-success">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('register.title')}</h1>
        <p className="mt-4 text-slate-700 dark:text-slate-300" role="status">
          {t('register.success')}
        </p>
        {createdSlug ? (
          <p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-400" data-testid="saas-register-slug">
            {createdSlug}
          </p>
        ) : null}
        <button
          type="button"
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          data-testid="saas-register-go-login"
          onClick={() => navigate('/login', { replace: true })}
        >
          {t('register.goLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12" data-testid="saas-register-page">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('register.title')}</h1>
      <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="saas-business-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('register.businessName')}
          </label>
          <input
            id="saas-business-name"
            data-testid="saas-register-business-name"
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            autoComplete="organization"
          />
        </div>
        {jurisdictions.length > 1 ? (
          <div>
            <label
              htmlFor="saas-jurisdiction"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('register.jurisdiction')}
            </label>
            <select
              id="saas-jurisdiction"
              data-testid="saas-register-jurisdiction"
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={jurisdiccionFiscal}
              onChange={(e) => setJurisdiccionFiscal(e.target.value)}
              required
            >
              {jurisdictions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="saas-cuit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t(`register.taxId.${selectedJurisdiction}`)}
          </label>
          <input
            id="saas-cuit"
            data-testid="saas-register-cuit"
            data-tax-id-kind={selectedTaxIdKind}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            required
            inputMode="numeric"
          />
        </div>
        <div>
          <label htmlFor="saas-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('register.email')}
          </label>
          <input
            id="saas-email"
            type="email"
            data-testid="saas-register-email"
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="saas-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('register.phone')}
          </label>
          <input
            id="saas-phone"
            type="tel"
            data-testid="saas-register-phone"
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="saas-slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('register.tenantSlug')}
          </label>
          <input
            id="saas-slug"
            data-testid="saas-register-slug-input"
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono dark:border-slate-600 dark:bg-slate-800"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="saas-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('register.password')}
          </label>
          <input
            id="saas-password"
            type="password"
            data-testid="saas-register-password"
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              data-testid="saas-register-accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>{t('register.acceptTerms')}</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              data-testid="saas-register-accept-privacy"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              required
            />
            <span>
              {t('register.acceptPrivacy')}{' '}
              <Link to="/privacidad" className="underline" data-testid="saas-register-privacy-link">
                {t('register.privacyLink')}
              </Link>
            </span>
          </label>
        </div>
        {status === 'error' && errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="saas-register-error">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          data-testid="saas-register-submit"
        >
          {status === 'loading' ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/" className="text-blue-600 underline dark:text-blue-400">
          {t('landing.brand')}
        </Link>
      </p>
    </div>
  )
}
