import type { ModuleKey } from '../../web/src/lib/modules'

type CacheEntry = {
  modules: readonly ModuleKey[]
  integrations: readonly string[]
  expiresAt: number
}

const TTL_MS = 60_000
const cache = new Map<number, CacheEntry>()

export function getCachedTenantFeatures(tenantId: number): CacheEntry | undefined {
  const entry = cache.get(tenantId)
  if (!entry) {
    return undefined
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(tenantId)
    return undefined
  }
  return entry
}

export function setCachedTenantFeatures(
  tenantId: number,
  modules: readonly ModuleKey[],
  integrations: readonly string[],
): void {
  cache.set(tenantId, {
    modules,
    integrations,
    expiresAt: Date.now() + TTL_MS,
  })
}

export function invalidateTenantFeaturesCache(tenantId: number): void {
  cache.delete(tenantId)
}

export function clearTenantFeaturesCache(): void {
  cache.clear()
}
