import { resolveStatusTone } from '../statusVariant'
import type { StatusBadgePropsBase } from '../types'
import { Badge } from './Badge'

export type StatusBadgeProps = StatusBadgePropsBase

/**
 * @en Native badge mapping Pedido/OE/Reparto status strings to visual tones (#157).
 * @es Badge native que mapea estados Pedido/OE/Reparto a tonos visuales (#157).
 * @pt-BR Badge native que mapeia status Pedido/OE/Reparto para tons visuais (#157).
 */
export function StatusBadge({
  status,
  children,
  testID = 'ui-status-badge',
}: StatusBadgeProps) {
  const tone = resolveStatusTone(status)
  return (
    <Badge tone={tone} testID={testID}>
      {children ?? status}
    </Badge>
  )
}
