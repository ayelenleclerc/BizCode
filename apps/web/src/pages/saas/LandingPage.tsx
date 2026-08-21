import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'

/**
 * @en Public marketing landing for SaaS self-service trial (#180).
 * @es Landing pública de marketing para trial SaaS self-service (#180).
 * @pt-BR Landing pública de marketing para trial SaaS self-service (#180).
 */
export default function LandingPage() {
  const { t } = useTranslation('saas')

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white"
      data-testid="saas-landing-page"
    >
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="text-2xl font-bold tracking-tight text-sky-300" data-testid="saas-landing-brand">
          {t('landing.brand')}
        </p>
        <div className="flex items-center gap-3">
          <LanguageSelect data-testid="saas-landing-language" id="saas-landing-language" />
          <Link
            to="/login"
            className="rounded px-3 py-2 text-sm text-slate-200 underline-offset-2 hover:underline"
            data-testid="saas-landing-login"
          >
            {t('landing.login')}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-24 pt-16">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl" data-testid="saas-landing-headline">
          {t('landing.headline')}
        </h1>
        <p className="max-w-2xl text-lg text-slate-300" data-testid="saas-landing-subhead">
          {t('landing.subhead')}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/registro"
            className="rounded bg-sky-500 px-6 py-3 text-base font-medium text-slate-950 hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            data-testid="saas-landing-cta"
          >
            {t('landing.cta')}
          </Link>
          <Link
            to="/privacidad"
            className="text-sm text-slate-300 underline-offset-2 hover:underline"
            data-testid="saas-landing-privacy"
          >
            {t('landing.privacy')}
          </Link>
        </div>
      </main>
    </div>
  )
}
