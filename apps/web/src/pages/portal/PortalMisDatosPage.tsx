import { useTranslation } from 'react-i18next'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

export default function PortalMisDatosPage() {
  const { t } = useTranslation('portal')
  const { me } = usePortalAuth()

  if (!me) {
    return null
  }

  return (
    <section aria-labelledby="portal-mis-datos-title" data-testid="portal-mis-datos-page">
      <h1 id="portal-mis-datos-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t('misDatos.title')}
      </h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.rsocial')}</dt>
          <dd className="font-medium">{me.rsocial}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.codigo')}</dt>
          <dd className="font-medium">{me.codigo}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.email')}</dt>
          <dd className="font-medium">{me.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.telefono')}</dt>
          <dd className="font-medium">{me.telef ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.domicilio')}</dt>
          <dd className="font-medium">{me.domicilio ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t('misDatos.localidad')}</dt>
          <dd className="font-medium">{me.localidad ?? '—'}</dd>
        </div>
      </dl>
      {me.vendedor ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="font-medium text-slate-900 dark:text-slate-100">{t('misDatos.vendedorTitle')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('misDatos.vendedorContact', { name: me.vendedor.username })}
          </p>
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-600 dark:text-slate-400">{t('misDatos.sinVendedor')}</p>
      )}
    </section>
  )
}
