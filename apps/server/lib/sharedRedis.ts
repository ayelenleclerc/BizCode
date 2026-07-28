import Redis from 'ioredis'

let sharedClient: Redis | null = null
let sharedUrl: string | null = null

/**
 * @en Shared ioredis client for rate-limit / blacklist / MFA when `REDIS_URL` is set (#217).
 * @es Cliente ioredis compartido para rate-limit / blacklist / MFA si hay `REDIS_URL` (#217).
 * @pt-BR Cliente ioredis compartilhado para rate-limit / blacklist / MFA se houver `REDIS_URL` (#217).
 */
export function getSharedRedisClient(): Redis | null {
  const url = process.env.REDIS_URL?.trim()
  if (!url) {
    return null
  }
  if (sharedClient && sharedUrl === url) {
    return sharedClient
  }
  if (sharedClient) {
    void sharedClient.quit().catch(() => undefined)
  }
  sharedUrl = url
  sharedClient = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  })
  return sharedClient
}

/**
 * @en Disconnects the shared Redis client (tests / graceful shutdown).
 * @es Desconecta el cliente Redis compartido (tests / apagado ordenado).
 * @pt-BR Desconecta o cliente Redis compartilhado (testes / desligamento ordenado).
 */
export async function disconnectSharedRedisClient(): Promise<void> {
  if (sharedClient && sharedClient.status !== 'end') {
    await sharedClient.quit().catch(() => undefined)
  }
  sharedClient = null
  sharedUrl = null
}

/**
 * @en Test-only: clear shared Redis handle without quitting (after process.env changes).
 * @es Solo tests: limpia el handle Redis compartido sin quit (tras cambiar process.env).
 * @pt-BR Só testes: limpa o handle Redis compartilhado sem quit (após mudar process.env).
 */
export function resetSharedRedisClientForTests(): void {
  sharedClient = null
  sharedUrl = null
}
