import { useTranslation } from 'react-i18next'

/**
 * @en Finance placeholder — reports and collections covered in Issue #33.
 * @es Placeholder finanzas — reportes y cobros cubiertos en Issue #33.
 * @pt-BR Placeholder finanças — relatórios e cobranças cobertos na Issue #33.
 */
export default function FinanzasPage() {
  const { t } = useTranslation('common')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('nav.finanzas')}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        {t('status.comingSoon')}
      </p>
    </div>
  )
}
