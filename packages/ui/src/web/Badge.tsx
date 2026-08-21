import type { BadgePropsBase, BadgeTone } from '../types'

const TONE_CLASS: Record<BadgeTone, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
}

export type BadgeProps = BadgePropsBase

/**
 * @en Compact status chip for web with success/warning/error/info tones (#157).
 * @es Chip compacto de estado para web con tonos success/warning/error/info (#157).
 * @pt-BR Chip compacto de status para web com tons success/warning/error/info (#157).
 */
export function Badge({ children, tone = 'info', testID = 'ui-badge' }: BadgeProps) {
  return (
    <span
      data-testid={testID}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}
