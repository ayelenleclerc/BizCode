import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fiscalAPI, type FiscalProviderStatusEntry } from '@/lib/api'
import IfModule from '@/components/IfModule'
import ArcaFiscalSection from './ArcaFiscalSection'

/**
 * @en Multi-organism fiscal e-invoicing section (#378, ADR-0018). Shows every registered
 *   provider's capabilities (implemented vs capability-only stub) and tenant status, then
 *   mounts `ArcaFiscalSection` unchanged for the `arca_wsfe` credentials form — only
 *   `arca_wsfe` has a working adapter today.
 * @es Sección de facturación electrónica multi-organismo (#378, ADR-0018). Muestra las
 *   capacidades de cada proveedor registrado (implementado vs. stub de capacidades) y el
 *   estado del tenant, y luego monta `ArcaFiscalSection` sin cambios para el formulario de
 *   credenciales `arca_wsfe` — solo `arca_wsfe` tiene adapter funcional hoy.
 * @pt-BR Seção de nota fiscal eletrônica multi-organismo (#378, ADR-0018). Mostra as
 *   capacidades de cada provedor registrado (implementado vs. stub de capacidades) e o
 *   status do tenant, e então monta `ArcaFiscalSection` sem mudanças para o formulário de
 *   credenciais `arca_wsfe` — apenas `arca_wsfe` tem adapter funcional hoje.
 */
export default function FiscalProviderSection() {
  const { t } = useTranslation('empresa')
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<FiscalProviderStatusEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadProviders = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fiscalAPI.getProvidersConfig()
      setProviders(data)
    } catch {
      setLoadError(t('fiscalProviders.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  return (
    <IfModule flag="billing.arca_cae">
      <section
        data-testid="section-fiscal-providers"
        className="mt-8 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="fiscal-providers-heading"
      >
        <header>
          <h2 id="fiscal-providers-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('fiscalProviders.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('fiscalProviders.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('fiscalProviders.loading')}
          </p>
        )}

        {loadError && (
          <p className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="polite">
            {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <ul data-testid="list-fiscal-providers" className="divide-y divide-slate-200 dark:divide-slate-700">
            {providers.map((provider) => (
              <li
                key={provider.provider}
                data-testid={`fiscal-provider-${provider.provider}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {provider.capabilities.displayName}
                    {provider.isDefault && (
                      <span
                        data-testid={`badge-default-${provider.provider}`}
                        className="ms-2 inline-flex items-center rounded bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200"
                      >
                        {t('fiscalProviders.defaultBadge')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{provider.countryCode}</p>
                </div>
                <span
                  data-testid={`badge-status-${provider.provider}`}
                  className={
                    provider.capabilities.implemented
                      ? provider.configured
                        ? 'inline-flex items-center rounded bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200'
                        : 'inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200'
                      : 'inline-flex items-center rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300'
                  }
                >
                  {provider.capabilities.implemented
                    ? provider.configured
                      ? t('fiscalProviders.configuredBadge')
                      : t('fiscalProviders.notConfiguredBadge')
                    : t('fiscalProviders.notImplementedBadge')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ArcaFiscalSection />
    </IfModule>
  )
}
