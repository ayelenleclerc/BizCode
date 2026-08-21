import type { ReactNode } from 'react'

/**
 * @en Shared visual prop contracts for `@bizcode/ui` web and native entry points (#157).
 * @es Contratos de props visuales compartidos entre entradas web y native de `@bizcode/ui` (#157).
 * @pt-BR Contratos de props visuais compartilhados entre entradas web e native de `@bizcode/ui` (#157).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export type BadgeTone = 'success' | 'warning' | 'error' | 'info'

export type CurrencyLocale = 'es-AR' | 'en-US' | 'pt-BR'

export type ButtonPropsBase = {
  children: ReactNode
  variant?: ButtonVariant
  disabled?: boolean
  onPress?: () => void
  testID?: string
  accessibilityLabel?: string
}

export type BadgePropsBase = {
  children: ReactNode
  tone?: BadgeTone
  testID?: string
}

export type CardPropsBase = {
  children: ReactNode
  testID?: string
}

export type AvatarPropsBase = {
  /** Display initials when no image URL is provided. */
  initials?: string
  imageUrl?: string | null
  size?: number
  testID?: string
  accessibilityLabel?: string
}

export type SpinnerPropsBase = {
  label?: string
  size?: 'small' | 'large'
  testID?: string
}

export type StatusBadgePropsBase = {
  /** Domain status string (Pedido / OE / Reparto / item / ruta parada). */
  status: string
  children?: ReactNode
  testID?: string
}

export type CurrencyTextPropsBase = {
  amount: number
  locale?: CurrencyLocale
  currency?: string
  testID?: string
}
