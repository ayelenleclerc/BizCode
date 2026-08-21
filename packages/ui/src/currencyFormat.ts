import type { CurrencyLocale } from './types'

/**
 * @en Formats a number as currency via Intl (default ARS + es-AR) without React i18n (#157).
 * @es Formatea un número como moneda con Intl (ARS + es-AR por defecto) sin i18n React (#157).
 * @pt-BR Formata um número como moeda via Intl (ARS + es-AR por padrão) sem i18n React (#157).
 */
export function formatCurrency(
  amount: number,
  locale: CurrencyLocale = 'es-AR',
  currency = 'ARS',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
