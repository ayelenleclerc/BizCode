import { Card as PaperCard } from 'react-native-paper'
import type { CardPropsBase } from '../types'

export type CardProps = CardPropsBase

/**
 * @en Paper Card wrapper for native layouts (#157).
 * @es Wrapper de Card de Paper para layouts native (#157).
 * @pt-BR Wrapper de Card do Paper para layouts native (#157).
 */
export function Card({ children, testID = 'ui-card' }: CardProps) {
  return (
    <PaperCard testID={testID} mode="elevated">
      {/* Cast avoids dual @types/react ReactNode mismatch under Expo (#157). */}
      <PaperCard.Content>{children as never}</PaperCard.Content>
    </PaperCard>
  )
}
