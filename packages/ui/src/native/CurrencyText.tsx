import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { formatCurrency } from '../currencyFormat'
import type { CurrencyTextPropsBase } from '../types'

export type CurrencyTextProps = CurrencyTextPropsBase

/**
 * @en Renders a currency amount with Intl formatting on native (#157).
 * @es Renderiza un monto con formato Intl en native (#157).
 * @pt-BR Renderiza um valor monetário com formatação Intl no native (#157).
 */
export function CurrencyText({
  amount,
  locale = 'es-AR',
  currency = 'ARS',
  testID = 'ui-currency-text',
}: CurrencyTextProps) {
  return (
    <View testID={testID}>
      <Text>{formatCurrency(amount, locale, currency)}</Text>
    </View>
  )
}
