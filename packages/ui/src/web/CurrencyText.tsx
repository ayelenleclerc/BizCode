import { formatCurrency } from '../currencyFormat'
import type { CurrencyTextPropsBase } from '../types'

export type CurrencyTextProps = CurrencyTextPropsBase

/**
 * @en Renders a currency amount with Intl formatting on web (#157).
 * @es Renderiza un monto con formato Intl en web (#157).
 * @pt-BR Renderiza um valor monetário com formatação Intl na web (#157).
 */
export function CurrencyText({
  amount,
  locale = 'es-AR',
  currency = 'ARS',
  testID = 'ui-currency-text',
}: CurrencyTextProps) {
  return <span data-testid={testID}>{formatCurrency(amount, locale, currency)}</span>
}
