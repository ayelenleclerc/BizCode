import type { TenantPlanSnapshot } from '../../src/lib/plans'

type CacheEntry = {
  snapshot: TenantPlanSnapshot
  expiresAt: number
}

const TTL_MS = 60_000
const cache = new Map<number, CacheEntry>()

export function getCachedTenantPlan(tenantId: number): TenantPlanSnapshot | undefined {
  const entry = cache.get(tenantId)
  if (!entry) {
    return undefined
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(tenantId)
    return undefined
  }
  return entry.snapshot
}

export function setCachedTenantPlan(tenantId: number, snapshot: TenantPlanSnapshot): void {
  cache.set(tenantId, {
    snapshot,
    expiresAt: Date.now() + TTL_MS,
  })
}

export function invalidateTenantPlanCache(tenantId: number): void {
  cache.delete(tenantId)
}

export function clearTenantPlanCache(): void {
  cache.clear()
}
