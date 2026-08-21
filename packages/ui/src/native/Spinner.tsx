import { ActivityIndicator, View } from 'react-native'
import { Text } from 'react-native-paper'
import type { SpinnerPropsBase } from '../types'

export type SpinnerProps = SpinnerPropsBase

/**
 * @en Native loading indicator (ActivityIndicator) with optional label (#157).
 * @es Indicador de carga native (ActivityIndicator) con etiqueta opcional (#157).
 * @pt-BR Indicador de carregamento native (ActivityIndicator) com rótulo opcional (#157).
 */
export function Spinner({
  label,
  size = 'large',
  testID = 'ui-spinner',
}: SpinnerProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      <ActivityIndicator size={size} />
      {label ? <Text>{label}</Text> : null}
    </View>
  )
}
