import type { ButtonPropsBase, ButtonVariant } from '../types'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 disabled:bg-blue-300',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-400 disabled:text-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-300',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400 disabled:text-slate-400',
}

export type ButtonProps = ButtonPropsBase & {
  type?: 'button' | 'submit' | 'reset'
}

/**
 * @en Tailwind-compatible DOM button with shared BizCode variants (#157).
 * @es Botón DOM compatible con Tailwind y variantes compartidas BizCode (#157).
 * @pt-BR Botão DOM compatível com Tailwind e variantes compartilhadas BizCode (#157).
 */
export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onPress,
  testID = 'ui-button',
  accessibilityLabel,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onPress}
      aria-label={accessibilityLabel}
      data-testid={testID}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </button>
  )
}
