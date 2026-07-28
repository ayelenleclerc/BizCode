import type { Store } from 'express-rate-limit'
import { RedisStore, type RedisReply } from 'rate-limit-redis'
import { getSharedRedisClient } from './sharedRedis'

/**
 * @en Builds a Redis-backed rate-limit store when `REDIS_URL` is set; otherwise `undefined` (memory default).
 * @es Construye store Redis de rate-limit si hay `REDIS_URL`; si no, `undefined` (memoria por defecto).
 * @pt-BR Constrói store Redis de rate-limit se houver `REDIS_URL`; senão, `undefined` (memória padrão).
 */
export function createRateLimitStore(prefix: string): Store | undefined {
  const client = getSharedRedisClient()
  if (!client) {
    return undefined
  }
  return new RedisStore({
    prefix: `bizcode:rl:${prefix}:`,
    sendCommand: (command: string, ...args: string[]) =>
      client.call(command, ...args) as Promise<RedisReply>,
  })
}
