import Redis from 'ioredis'

const CHALLENGE_PREFIX = 'bizcode:mfa:chal:'

/** @en MFA login challenge payload stored until verify (TTL 5 min). @es Payload del challenge MFA hasta verify (TTL 5 min). @pt-BR Payload do challenge MFA até verify (TTL 5 min). */
export type MfaChallengePayload = {
  userId: number
  tenantId: number
  rememberMe: boolean
}

/**
 * @en Abstract MFA challenge store (Redis or in-memory for unit tests).
 * @es Store abstracto de challenges MFA (Redis o memoria para tests unitarios).
 * @pt-BR Store abstrato de challenges MFA (Redis ou memória para testes unitários).
 */
export type MfaChallengeStore = {
  set(tokenHash: string, payload: MfaChallengePayload, ttlSeconds: number): Promise<void>
  /** @en Atomically get-and-delete (single-use). @es Obtiene y borra de forma atómica (uso único). @pt-BR Obtém e apaga de forma atômica (uso único). */
  take(tokenHash: string): Promise<MfaChallengePayload | null>
  disconnect(): Promise<void>
}

function createMemoryChallengeStore(): MfaChallengeStore {
  const store = new Map<string, { payload: MfaChallengePayload; expiresAt: number }>()
  return {
    async set(tokenHash, payload, ttlSeconds) {
      const ttl = Math.max(1, Math.floor(ttlSeconds))
      store.set(tokenHash, { payload, expiresAt: Date.now() + ttl * 1000 })
    },
    async take(tokenHash) {
      const entry = store.get(tokenHash)
      store.delete(tokenHash)
      if (!entry) return null
      if (entry.expiresAt <= Date.now()) return null
      return entry.payload
    },
    async disconnect() {
      store.clear()
    },
  }
}

function createRedisChallengeStore(url: string): MfaChallengeStore {
  const client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  })
  let connectPromise: Promise<void> | null = null
  const ensureConnected = async (): Promise<void> => {
    if (client.status === 'ready') return
    if (!connectPromise) {
      connectPromise = client.connect().then(() => undefined)
    }
    await connectPromise
  }
  return {
    async set(tokenHash, payload, ttlSeconds) {
      await ensureConnected()
      const ttl = Math.max(1, Math.floor(ttlSeconds))
      await client.set(`${CHALLENGE_PREFIX}${tokenHash}`, JSON.stringify(payload), 'EX', ttl)
    },
    async take(tokenHash) {
      await ensureConnected()
      const key = `${CHALLENGE_PREFIX}${tokenHash}`
      const raw = await client.getdel(key)
      if (raw == null) return null
      try {
        const parsed = JSON.parse(raw) as MfaChallengePayload
        if (
          typeof parsed.userId !== 'number' ||
          typeof parsed.tenantId !== 'number' ||
          typeof parsed.rememberMe !== 'boolean'
        ) {
          return null
        }
        return parsed
      } catch {
        return null
      }
    },
    async disconnect() {
      if (client.status !== 'end') {
        await client.quit().catch(() => undefined)
      }
    },
  }
}

let sharedStore: MfaChallengeStore | null = null

/**
 * @en Returns process-wide MFA challenge store (Redis when REDIS_URL is set, else memory).
 * @es Devuelve el store de challenges MFA del proceso (Redis si hay REDIS_URL; si no, memoria).
 * @pt-BR Retorna o store de challenges MFA do processo (Redis se houver REDIS_URL; senão, memória).
 */
export function getMfaChallengeStore(): MfaChallengeStore {
  if (sharedStore) return sharedStore
  const url = process.env.REDIS_URL?.trim()
  sharedStore = url ? createRedisChallengeStore(url) : createMemoryChallengeStore()
  return sharedStore
}

/**
 * @en Replaces the shared MFA challenge store (tests only).
 * @es Reemplaza el store compartido de challenges MFA (solo tests).
 * @pt-BR Substitui o store compartilhado de challenges MFA (somente testes).
 */
export function setMfaChallengeStoreForTests(store: MfaChallengeStore | null): void {
  sharedStore = store
}

/**
 * @en Creates an isolated in-memory MFA challenge store for unit tests.
 * @es Crea un store MFA en memoria aislado para tests unitarios.
 * @pt-BR Cria um store MFA em memória isolado para testes unitários.
 */
export function createMemoryMfaChallengeStore(): MfaChallengeStore {
  return createMemoryChallengeStore()
}

/** @en MFA challenge TTL in seconds (5 minutes). @es TTL del challenge MFA en segundos (5 minutos). @pt-BR TTL do challenge MFA em segundos (5 minutos). */
export const MFA_CHALLENGE_TTL_SECONDS = 300
