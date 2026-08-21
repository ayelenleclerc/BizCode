import type { BadgeTone } from './types'

/**
 * @en Maps product status strings (Pedido / OE / Reparto / ruta) to badge tones; unknown → info (#157).
 * @es Mapea estados de producto (Pedido / OE / Reparto / ruta) a tonos de badge; desconocido → info (#157).
 * @pt-BR Mapeia status do produto (Pedido / OE / Reparto / rota) para tons de badge; desconhecido → info (#157).
 */
const STATUS_TONE_MAP: Readonly<Record<string, BadgeTone>> = {
  // PedidoEstado
  draft: 'info',
  confirmed: 'info',
  packed: 'info',
  shipped: 'warning',
  delivered: 'success',
  invoiced: 'success',
  collected: 'success',
  cancelled: 'error',
  // OrdenEntregaEstado (+ shared keys)
  pending: 'info',
  picking: 'info',
  ready: 'info',
  assigned: 'warning',
  in_transit: 'warning',
  failed: 'error',
  // RepartoEstado
  planned: 'info',
  on_route: 'warning',
  completed: 'success',
  // RepartoItemEstado
  not_delivered: 'error',
  returned: 'warning',
  // Seller ruta parada
  pendiente: 'info',
  visitado: 'success',
  no_visitado: 'error',
  postergado: 'warning',
}

export function resolveStatusTone(status: string): BadgeTone {
  const key = status.trim().toLowerCase()
  return STATUS_TONE_MAP[key] ?? 'info'
}
