import { getSharedRedisClient } from './sharedRedis'
import { SUGERENCIAS_CACHE_TTL_SECONDS } from '../services/sugerenciasPedidoAlgo'

type MemoryEntry = { expiresAt: number; payload: string }

const memory = new Map<string, MemoryEntry>()

function cacheKey(tenantId: number, clienteId: number): string {
  return `bizcode:sug:${tenantId}:${clienteId}`
}

/**
 * @en Prefer in-process memory during API test bypass so Redis does not leak across cases.
 * @es En bypass de tests API usa solo memoria para que Redis no contamine casos.
 * @pt-BR No bypass de testes da API usa só memória para o Redis não contaminar casos.
 */
function preferMemoryCacheInTests(): boolean {
  return process.env.BIZCODE_TEST_AUTH_BYPASS === 'true'
}

/**
 * @en Reads cached suggestions JSON (Redis when available, else process memory).
 * @es Lee JSON de sugerencias cacheado (Redis si hay, si no memoria del proceso).
 * @pt-BR Lê JSON de sugestões em cache (Redis se houver, senão memória do processo).
 */
export async function getSugerenciasCache(
  tenantId: number,
  clienteId: number,
): Promise<string | null> {
  const key = cacheKey(tenantId, clienteId)
  const redis = preferMemoryCacheInTests() ? null : getSharedRedisClient()
  if (redis) {
    try {
      if (redis.status !== 'ready') {
        await redis.connect().catch(() => undefined)
      }
      const value = await redis.get(key)
      return value ?? null
    } catch {
      // fall through to memory
    }
  }
  const entry = memory.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memory.delete(key)
    return null
  }
  return entry.payload
}

/**
 * @en Stores suggestions JSON with 1h TTL.
 * @es Guarda JSON de sugerencias con TTL de 1 h.
 * @pt-BR Salva JSON de sugestões com TTL de 1 h.
 */
export async function setSugerenciasCache(
  tenantId: number,
  clienteId: number,
  payload: string,
): Promise<void> {
  const key = cacheKey(tenantId, clienteId)
  const redis = preferMemoryCacheInTests() ? null : getSharedRedisClient()
  if (redis) {
    try {
      if (redis.status !== 'ready') {
        await redis.connect().catch(() => undefined)
      }
      await redis.set(key, payload, 'EX', SUGERENCIAS_CACHE_TTL_SECONDS)
      return
    } catch {
      // fall through to memory
    }
  }
  memory.set(key, {
    expiresAt: Date.now() + SUGERENCIAS_CACHE_TTL_SECONDS * 1000,
    payload,
  })
}

/**
 * @en Clears in-process suggestion cache (and Redis `bizcode:sug:*` when connected).
 * @es Limpia el cache en memoria de sugerencias (y Redis `bizcode:sug:*` si hay conexión).
 * @pt-BR Limpa o cache em memória de sugestões (e Redis `bizcode:sug:*` se conectado).
 */
export async function clearSugerenciasMemoryCache(): Promise<void> {
  memory.clear()
  const redis = getSharedRedisClient()
  if (!redis) return
  try {
    if (redis.status !== 'ready') {
      await redis.connect().catch(() => undefined)
    }
    const keys = await redis.keys('bizcode:sug:*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // ignore Redis errors in tests / shutdown
  }
}
