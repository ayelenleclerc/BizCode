import { Button as PaperButton } from 'react-native-paper'
import type { ButtonPropsBase, ButtonVariant } from '../types'

export type ButtonProps = ButtonPropsBase

function modeFor(variant: ButtonVariant): 'contained' | 'outlined' | 'text' {
  if (variant === 'secondary') return 'outlined'
  if (variant === 'ghost') return 'text'
  return 'contained'
}

/**
 * @en Thin react-native-paper Button wrapper with shared BizCode variants (#157).
 * @es Wrapper delgado de Button de react-native-paper con variantes BizCode (#157).
 * @pt-BR Wrapper fino de Button do react-native-paper com variantes BizCode (#157).
 */
export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onPress,
  testID = 'ui-button',
  accessibilityLabel,
}: ButtonProps) {
  return (
    <PaperButton
      mode={modeFor(variant)}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      buttonColor={variant === 'danger' ? '#dc2626' : undefined}
      textColor={variant === 'danger' ? '#ffffff' : undefined}
    >
      {/* Cast avoids dual @types/react ReactNode mismatch under Expo (#157). */}
      {children as string | number}
    </PaperButton>
  )
}
