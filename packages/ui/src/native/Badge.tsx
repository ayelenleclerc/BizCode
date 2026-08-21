import { Chip } from 'react-native-paper'
import type { BadgePropsBase, BadgeTone } from '../types'

export type BadgeProps = BadgePropsBase

const TONE_BG: Record<BadgeTone, string> = {
  success: '#C8E6C9',
  warning: '#FFE082',
  error: '#FFCDD2',
  info: '#BBDEFB',
}

/**
 * @en Compact Chip badge for native with shared tones (#157).
 * @es Chip compacto nativo con tonos compartidos (#157).
 * @pt-BR Chip compacto nativo com tons compartilhados (#157).
 */
export function Badge({ children, tone = 'info', testID = 'ui-badge' }: BadgeProps) {
  return (
    <Chip compact testID={testID} style={{ backgroundColor: TONE_BG[tone] }}>
      {/* Cast avoids dual @types/react ReactNode mismatch under Expo (#157). */}
      {children as string | number}
    </Chip>
  )
}
