import Redis from 'ioredis'

const BLACKLIST_PREFIX = 'bizcode:refresh:bl:'

/**
 * @en Abstract refresh-token blacklist (Redis or in-memory for unit tests).
 * @es Blacklist abstracta de refresh tokens (Redis o memoria para tests unitarios).
 * @pt-BR Blacklist abstrata de refresh tokens (Redis ou memória para testes unitários).
 */
export type RefreshTokenBlacklist = {
  add(tokenHash: string, ttlSeconds: number): Promise<void>
  has(tokenHash: string): Promise<boolean>
  disconnect(): Promise<void>
}

function createMemoryBlacklist(): RefreshTokenBlacklist {
  const store = new Map<string, number>()
  return {
    async add(tokenHash, ttlSeconds) {
      const ttl = Math.max(1, Math.floor(ttlSeconds))
      store.set(tokenHash, Date.now() + ttl * 1000)
    },
    async has(tokenHash) {
      const expiresAt = store.get(tokenHash)
      if (expiresAt == null) return false
      if (expiresAt <= Date.now()) {
        store.delete(tokenHash)
        return false
      }
      return true
    },
    async disconnect() {
      store.clear()
    },
  }
}

function createRedisBlacklist(url: string): RefreshTokenBlacklist {
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
    async add(tokenHash, ttlSeconds) {
      await ensureConnected()
      const ttl = Math.max(1, Math.floor(ttlSeconds))
      await client.set(`${BLACKLIST_PREFIX}${tokenHash}`, '1', 'EX', ttl)
    },
    async has(tokenHash) {
      await ensureConnected()
      const value = await client.get(`${BLACKLIST_PREFIX}${tokenHash}`)
      return value != null
    },
    async disconnect() {
      if (client.status !== 'end') {
        await client.quit().catch(() => undefined)
      }
    },
  }
}

let sharedBlacklist: RefreshTokenBlacklist | null = null

/**
 * @en Returns a process-wide refresh blacklist (Redis when REDIS_URL is set, else memory).
 * @es Devuelve la blacklist de refresh del proceso (Redis si hay REDIS_URL; si no, memoria).
 * @pt-BR Retorna a blacklist de refresh do processo (Redis se houver REDIS_URL; senão, memória).
 */
export function getRefreshTokenBlacklist(): RefreshTokenBlacklist {
  if (sharedBlacklist) return sharedBlacklist
  const url = process.env.REDIS_URL?.trim()
  sharedBlacklist = url ? createRedisBlacklist(url) : createMemoryBlacklist()
  return sharedBlacklist
}

/**
 * @en Replaces the shared blacklist (tests only).
 * @es Reemplaza la blacklist compartida (solo tests).
 * @pt-BR Substitui a blacklist compartilhada (somente testes).
 */
export function setRefreshTokenBlacklistForTests(blacklist: RefreshTokenBlacklist | null): void {
  sharedBlacklist = blacklist
}

/**
 * @en Creates an isolated in-memory blacklist for unit tests.
 * @es Crea una blacklist en memoria aislada para tests unitarios.
 * @pt-BR Cria uma blacklist em memória isolada para testes unitários.
 */
export function createMemoryRefreshTokenBlacklist(): RefreshTokenBlacklist {
  return createMemoryBlacklist()
}
