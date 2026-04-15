import { useTranslation } from 'react-i18next'

/**
 * @en Logistics placeholder — delivery zones and order dispatch covered in Issues #30–#32.
 * @es Placeholder logística — zonas de entrega y despacho cubiertos en Issues #30–#32.
 * @pt-BR Placeholder logística — zonas de entrega e despacho cobertos nas Issues #30–#32.
 */
export default function LogisticaPage() {
  const { t } = useTranslation('common')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('nav.logistica')}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        {t('status.comingSoon')}
      </p>
    </div>
  )
}
