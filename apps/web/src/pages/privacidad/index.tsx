/**
 * @en Public privacy policy page aligned with the product data map (#195).
 * @es Página pública de privacidad alineada al mapa de datos del producto (#195).
 * @pt-BR Página pública de privacidade alinhada ao mapa de dados do produto (#195).
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'

export default function PrivacyPage() {
  const { t } = useTranslation('privacidad')

  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
      data-testid="privacy-page"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" data-testid="privacy-title">
            {t('title')}
          </h1>
          <LanguageSelect />
        </div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t('intro')}</p>

        <section aria-labelledby="privacy-inventory">
          <h2 id="privacy-inventory" className="text-lg font-semibold">
            {t('inventoryTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('inventoryBody')}</p>
        </section>

        <section aria-labelledby="privacy-rights">
          <h2 id="privacy-rights" className="text-lg font-semibold">
            {t('rightsTitle')}
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li>{t('rightsAccess')}</li>
            <li>{t('rightsRectification')}</li>
            <li>{t('rightsErasure')}</li>
            <li>{t('rightsOpposition')}</li>
          </ul>
        </section>

        <section aria-labelledby="privacy-retention">
          <h2 id="privacy-retention" className="text-lg font-semibold">
            {t('retentionTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('retentionBody')}</p>
        </section>

        <section aria-labelledby="privacy-aaip">
          <h2 id="privacy-aaip" className="text-lg font-semibold">
            {t('aaipTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('aaipBody')}</p>
        </section>

        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="text-lg font-semibold">
            {t('contactTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('contactBody')}</p>
        </section>

        <p>
          <Link
            to="/login"
            className="text-sm font-medium text-blue-700 underline dark:text-blue-400"
            data-testid="privacy-back-login"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  )
}
