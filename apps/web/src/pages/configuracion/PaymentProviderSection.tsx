import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paymentsAPI, type PaymentProviderStatusEntry } from '@/lib/api'
import IfIntegration from '@/components/IfIntegration'
import MercadoPagoConfigSection from './MercadoPagoConfigSection'

/**
 * @en Multi-provider payments section (#377, ADR-0019). Lists registered providers and
 *   mounts `MercadoPagoConfigSection` for the live Mercado Pago credentials form.
 * @es Sección de cobros multi-proveedor (#377, ADR-0019). Lista proveedores y monta
 *   `MercadoPagoConfigSection` para el formulario live de Mercado Pago.
 * @pt-BR Seção de cobranças multi-provedor (#377, ADR-0019). Lista provedores e monta
 *   `MercadoPagoConfigSection` para o formulário live do Mercado Pago.
 */
export default function PaymentProviderSection() {
  const { t } = useTranslation('empresa')
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<PaymentProviderStatusEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadProviders = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await paymentsAPI.getProvidersConfig()
      setProviders(data)
    } catch {
      setLoadError(t('paymentProviders.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  return (
    <IfIntegration id="mercadopago">
      <section
        data-testid="section-payment-providers"
        className="mt-8 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        aria-labelledby="payment-providers-heading"
      >
        <header>
          <h2 id="payment-providers-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('paymentProviders.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('paymentProviders.subtitle')}</p>
        </header>

        {loading && (
          <p className="text-slate-600 dark:text-slate-400" role="status">
            {t('paymentProviders.loading')}
          </p>
        )}

        {loadError && (
          <p className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="polite">
            {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <ul data-testid="list-payment-providers" className="divide-y divide-slate-200 dark:divide-slate-700">
            {providers.map((provider) => (
              <li
                key={provider.provider}
                data-testid={`payment-provider-${provider.provider}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {provider.capabilities.displayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{provider.provider}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {provider.isDefault && (
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-900 dark:text-sky-100">
                      {t('paymentProviders.defaultBadge')}
                    </span>
                  )}
                  {provider.configured ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                      {t('paymentProviders.configuredBadge')}
                    </span>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {t('paymentProviders.notConfiguredBadge')}
                    </span>
                  )}
                  {!provider.capabilities.implemented && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                      {t('paymentProviders.notImplementedBadge')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <MercadoPagoConfigSection />
      </section>
    </IfIntegration>
  )
}
