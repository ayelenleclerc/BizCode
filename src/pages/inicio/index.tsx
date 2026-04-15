import { useTranslation } from 'react-i18next'

/**
 * @en Home / dashboard placeholder — replaced by the real KPI dashboard in Issue #29.
 * @es Página de inicio — placeholder reemplazado por el dashboard real en Issue #29.
 * @pt-BR Página inicial — placeholder substituído pelo dashboard real na Issue #29.
 */
export default function InicioPage() {
  const { t } = useTranslation('common')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('nav.inicio')}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        {t('status.comingSoon')}
      </p>
    </div>
  )
}
