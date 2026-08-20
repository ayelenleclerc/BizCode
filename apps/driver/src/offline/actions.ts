import type { DevolucionEntregaRegisterInput, MotivoNoEntrega, RepartoItemRow } from '@bizcode/types'
import type { CobroCreateBody } from '@bizcode/api-client'
import { getOfflineDb } from './db'
import { enqueueOutbox } from './outbox'
import { loadRepartoCache, patchCachedItem, saveRepartoCache } from './repos'
import { mapProgressFromItems } from './types'
import type { DeliveredPodFields } from '../ruta/pod/podValidation'

function requireItem(repartoId: number, itemId: number, items: RepartoItemRow[]): RepartoItemRow {
  const item = items.find((row) => row.id === itemId)
  if (!item) {
    throw new Error(`REPARTO_ITEM_NOT_FOUND:${repartoId}:${itemId}`)
  }
  return item
}

/**
 * @en Optimistic local POD delivered + outbox enqueue.
 * @es POD entregado local optimista + cola outbox.
 * @pt-BR POD entregue local otimista + fila outbox.
 */
export async function enqueuePodDelivered(
  itemId: number,
  input: DeliveredPodFields,
): Promise<RepartoItemRow> {
  const db = await getOfflineDb()
  const cached = await loadRepartoCache(db)
  if (!cached) throw new Error('NO_CACHED_REPARTO')
  const item = requireItem(cached.id, itemId, cached.items)
  const next: RepartoItemRow = {
    ...item,
    estado: 'delivered',
    entregadoAt: new Date().toISOString(),
    receptorNombre: input.receptorNombre?.trim() ?? null,
    receptorDni: input.receptorDni?.trim() || null,
    notasEntrega: input.notasEntrega?.trim() || null,
    hasPod: true,
    motivoNoEntrega: null,
  }
  await enqueueOutbox(db, 'pod_delivered', {
    repartoId: cached.id,
    itemId,
    input: { ...input, outcome: 'delivered' },
  })
  await patchCachedItem(db, itemId, next)
  return next
}

/**
 * @en Optimistic local not-delivered + outbox enqueue.
 * @es No entrega local optimista + cola outbox.
 * @pt-BR Não entrega local otimista + fila outbox.
 */
export async function enqueuePodNotDelivered(
  itemId: number,
  motivo: MotivoNoEntrega,
): Promise<RepartoItemRow> {
  const db = await getOfflineDb()
  const cached = await loadRepartoCache(db)
  if (!cached) throw new Error('NO_CACHED_REPARTO')
  const item = requireItem(cached.id, itemId, cached.items)
  const next: RepartoItemRow = {
    ...item,
    estado: 'not_delivered',
    entregadoAt: new Date().toISOString(),
    motivoNoEntrega: motivo,
    receptorNombre: null,
    receptorDni: null,
    hasPod: false,
  }
  await enqueueOutbox(db, 'pod_not_delivered', { repartoId: cached.id, itemId, motivo })
  await patchCachedItem(db, itemId, next)
  return next
}

/**
 * @en Queues a collection create; cache is not a ledger (reload after sync).
 * @es Encola un cobro; el cache no es el libro (recarga tras sync).
 * @pt-BR Enfileira uma cobrança; o cache não é o livro (recarrega após sync).
 */
export async function enqueueCobroCreate(body: CobroCreateBody): Promise<void> {
  const db = await getOfflineDb()
  await enqueueOutbox(db, 'cobro_create', { body })
}

/**
 * @en Optimistic local return register + outbox enqueue.
 * @es Devolución local optimista + cola outbox.
 * @pt-BR Devolução local otimista + fila outbox.
 */
export async function enqueueDevolucionRegister(
  itemId: number,
  input: DevolucionEntregaRegisterInput,
): Promise<void> {
  const db = await getOfflineDb()
  const cached = await loadRepartoCache(db)
  if (!cached) throw new Error('NO_CACHED_REPARTO')
  const item = requireItem(cached.id, itemId, cached.items)
  const next: RepartoItemRow = {
    ...item,
    estado: 'returned',
    entregadoAt: new Date().toISOString(),
    motivoNoEntrega: input.motivo,
    hasPod: false,
  }
  await enqueueOutbox(db, 'devolucion_register', { repartoId: cached.id, itemId, input })
  const patched = await patchCachedItem(db, itemId, next)
  if (patched) await saveRepartoCache(db, { ...patched, progress: mapProgressFromItems(patched.items) })
}
