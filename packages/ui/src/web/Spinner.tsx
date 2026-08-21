import type { SpinnerPropsBase } from '../types'

export type SpinnerProps = SpinnerPropsBase

/**
 * @en Accessible loading spinner for web (role=status) (#157).
 * @es Spinner de carga accesible para web (role=status) (#157).
 * @pt-BR Spinner de carregamento acessível para web (role=status) (#157).
 */
export function Spinner({
  label,
  size = 'large',
  testID = 'ui-spinner',
}: SpinnerProps) {
  const box = size === 'small' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-2'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      data-testid={testID}
      className="inline-flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-300"
    >
      <span
        className={`inline-block animate-spin rounded-full border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400 ${box}`}
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : null}
    </div>
  )
}
