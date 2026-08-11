import { getOfflineDb } from './db'
import { localYmd } from './localYmd'
import { allocateLocalId, enqueueOutbox } from './outbox'
import { upsertPedidoCache, upsertRuta, upsertVisita } from './repos'

/**
 * @en Queues pedido create+confirm for offline sync; returns provisional local id.
 * @es Encola create+confirm de pedido para sync offline; retorna id local provisional.
 * @pt-BR Enfileira create+confirm de pedido para sync offline; retorna id local provisório.
 */
export async function enqueuePedidoCreateConfirm(input: {
  body: Record<string, unknown>
  clienteId: number
}): Promise<number> {
  const db = await getOfflineDb()
  const localPedidoId = await allocateLocalId(db, 'pedido')
  const provisional = {
    id: localPedidoId,
    clienteId: input.clienteId,
    estado: 'confirmed',
    pendingSync: true,
    createdAt: new Date().toISOString(),
    ...input.body,
  }
  await upsertPedidoCache(db, provisional, { pendingSync: true })
  await enqueueOutbox(db, 'pedido_create_confirm', {
    localPedidoId,
    body: input.body,
  })
  return localPedidoId
}

/**
 * @en Queues spontaneous visit create offline.
 * @es Encola alta espontánea de visita offline.
 * @pt-BR Enfileira criação espontânea de visita offline.
 */
export async function enqueueVisitaCreate(input: {
  body: Record<string, unknown>
  clienteSnapshot?: Record<string, unknown>
}): Promise<number> {
  const db = await getOfflineDb()
  const localVisitaId = await allocateLocalId(db, 'visita')
  const fecha = String(input.body.fechaPlanificada ?? localYmd()).slice(0, 10)
  const provisional: Record<string, unknown> = {
    id: localVisitaId,
    fechaPlanificada: fecha,
    estadoPlan: 'pendiente',
    resultado: null,
    notasVisita: null,
    pedidoId: null,
    orden: 0,
    duracionMinutos: null,
    cliente: input.clienteSnapshot ?? undefined,
    ...input.body,
    pendingSync: true,
  }
  await upsertVisita(db, provisional, { pendingSync: true })
  await enqueueOutbox(db, 'visita_create', {
    localVisitaId,
    body: input.body,
  })
  return localVisitaId
}

/**
 * @en Queues visit result update offline.
 * @es Encola actualización de resultado de visita offline.
 * @pt-BR Enfileira atualização de resultado de visita offline.
 */
export async function enqueueVisitaUpdate(input: {
  visitaId: number
  body: Record<string, unknown>
  previous: Record<string, unknown>
}): Promise<void> {
  const db = await getOfflineDb()
  const merged = {
    ...input.previous,
    ...input.body,
    id: input.visitaId,
    pendingSync: true,
  }
  await upsertVisita(db, merged, { pendingSync: true })
  await enqueueOutbox(db, 'visita_update', {
    visitaId: input.visitaId,
    body: input.body,
  })
}

/**
 * @en Queues route create offline.
 * @es Encola creación de ruta offline.
 * @pt-BR Enfileira criação de rota offline.
 */
export async function enqueueRutaCreate(input: {
  body: Record<string, unknown>
}): Promise<number> {
  const db = await getOfflineDb()
  const localRutaId = await allocateLocalId(db, 'ruta')
  const provisional: Record<string, unknown> = {
    id: localRutaId,
    fecha: String(input.body.fecha ?? localYmd()).slice(0, 10),
    paradas: [],
    pendingSync: true,
    ...input.body,
  }
  await upsertRuta(db, provisional, { pendingSync: true })
  await enqueueOutbox(db, 'ruta_create', { localRutaId, body: input.body })
  return localRutaId
}

/**
 * @en Queues full stop list replace offline.
 * @es Encola reemplazo de paradas offline.
 * @pt-BR Enfileira substituição de paradas offline.
 */
export async function enqueueRutaParadasReplace(input: {
  rutaId: number
  body: Record<string, unknown>
  nextRuta: Record<string, unknown>
}): Promise<void> {
  const db = await getOfflineDb()
  await upsertRuta(db, { ...input.nextRuta, pendingSync: true }, { pendingSync: true })
  await enqueueOutbox(db, 'ruta_paradas_replace', {
    rutaId: input.rutaId,
    body: input.body,
  })
}

/**
 * @en Queues stop status patch offline.
 * @es Encola patch de estado de parada offline.
 * @pt-BR Enfileira patch de estado de parada offline.
 */
export async function enqueueRutaParadaPatch(input: {
  rutaId: number
  paradaId: number
  body: Record<string, unknown>
  nextRuta: Record<string, unknown>
}): Promise<void> {
  const db = await getOfflineDb()
  await upsertRuta(db, { ...input.nextRuta, pendingSync: true }, { pendingSync: true })
  await enqueueOutbox(db, 'ruta_parada_patch', {
    rutaId: input.rutaId,
    paradaId: input.paradaId,
    body: input.body,
  })
}
