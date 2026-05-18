import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * @en Placeholder for tenant module toggles UI (#225).
 * @es Placeholder para la UI de módulos por tenant (#225).
 * @pt-BR Placeholder para a UI de módulos por tenant (#225).
 */
export default function TenantModulesPage() {
  const { tenantId } = useParams()
  const { t } = useTranslation('common')

  return (
    <div className="p-8" data-testid="superadmin-modules-placeholder">
      <p className="mb-4">
        <Link
          to={tenantId ? `/superadmin/tenants/${tenantId}` : '/superadmin'}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('superadmin.backToDetail')}
        </Link>
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t('superadmin.modulesPlaceholderTitle')}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t('superadmin.modulesPlaceholderBody')}</p>
    </div>
  )
}
