import type { PedidoEstado } from '@bizcode/types'

/**
 * @en Valid Pedido fulfillment/financial states (BP1-1 #391).
 * @es Estados válidos de cumplimiento/financieros de Pedido (BP1-1 #391).
 * @pt-BR Estados válidos de fulfillment/financeiros de Pedido (BP1-1 #391).
 */
export const PEDIDO_ESTADOS: readonly PedidoEstado[] = [
  'draft',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'invoiced',
  'collected',
  'cancelled',
] as const

export type PedidoTransitionAction =
  | 'confirm'
  | 'pack'
  | 'ship'
  | 'deliver'
  | 'invoice'
  | 'collect'
  | 'cancel'

/** Adjacency for explicit user/API transitions (early-invoice model). */
const TRANSITIONS: Record<PedidoTransitionAction, readonly PedidoEstado[]> = {
  confirm: ['draft'],
  pack: ['confirmed', 'invoiced'],
  ship: ['packed', 'invoiced'],
  deliver: ['shipped', 'invoiced'],
  invoice: ['confirmed', 'packed', 'shipped', 'delivered'],
  collect: ['invoiced', 'delivered'],
  cancel: ['draft', 'confirmed'],
}

const ACTION_TARGET: Record<Exclude<PedidoTransitionAction, 'invoice'>, PedidoEstado> = {
  confirm: 'confirmed',
  pack: 'packed',
  ship: 'shipped',
  deliver: 'delivered',
  collect: 'collected',
  cancel: 'cancelled',
}

/**
 * @en Rank for logistics sync (invoiced counts as pre-fulfillment when no pack yet).
 * @es Rango para sync logístico (invoiced cuenta como pre-cumplimiento).
 * @pt-BR Rank para sync logístico (invoiced conta como pré-fulfillment).
 */
export function fulfillmentRank(estado: PedidoEstado): number {
  switch (estado) {
    case 'draft':
      return -1
    case 'confirmed':
    case 'invoiced':
      return 0
    case 'packed':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    case 'collected':
      return 4
    case 'cancelled':
      return -2
    default:
      return -1
  }
}

export function isPedidoEstado(value: string): value is PedidoEstado {
  return (PEDIDO_ESTADOS as readonly string[]).includes(value)
}

export function canTransition(from: PedidoEstado, action: PedidoTransitionAction): boolean {
  return TRANSITIONS[action].includes(from)
}

/**
 * @en Resolves next estado for an action. Invoice keeps logistics estado when past confirmed.
 * @es Resuelve el próximo estado. Invoice conserva logística si ya avanzó.
 * @pt-BR Resolve o próximo estado. Invoice mantém logística se já avançou.
 */
export function nextEstadoAfter(
  from: PedidoEstado,
  action: PedidoTransitionAction,
): PedidoEstado | null {
  if (!canTransition(from, action)) {
    return null
  }
  if (action === 'invoice') {
    return from === 'confirmed' ? 'invoiced' : from
  }
  return ACTION_TARGET[action]
}

export function transitionTargetForAction(
  action: Exclude<PedidoTransitionAction, 'invoice' | 'cancel' | 'confirm'>,
): PedidoEstado {
  return ACTION_TARGET[action]
}

/** Map OpenAPI /transitions body `to` to internal action. */
export function actionForTargetEstado(to: PedidoEstado): PedidoTransitionAction | null {
  switch (to) {
    case 'confirmed':
      return 'confirm'
    case 'packed':
      return 'pack'
    case 'shipped':
      return 'ship'
    case 'delivered':
      return 'deliver'
    case 'invoiced':
      return 'invoice'
    case 'collected':
      return 'collect'
    case 'cancelled':
      return 'cancel'
    default:
      return null
  }
}
