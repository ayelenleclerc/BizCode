import type { CardPropsBase } from '../types'

export type CardProps = CardPropsBase

/**
 * @en Simple bordered card container for web layouts (#157).
 * @es Contenedor tipo card con borde para layouts web (#157).
 * @pt-BR Contêiner tipo card com borda para layouts web (#157).
 */
export function Card({ children, testID = 'ui-card' }: CardProps) {
  return (
    <div
      data-testid={testID}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      {children}
    </div>
  )
}
