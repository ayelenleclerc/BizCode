import type { FiscalJurisdictionCode, ModuleKey } from '@bizcode/types'

type CacheEntry = {
  modules: readonly ModuleKey[]
  integrations: readonly string[]
  /**
   * @en Tax jurisdiction of the tenant (#207); cached with the modules since both live in the same row.
   * @es Jurisdicción fiscal del tenant (#207); se cachea junto a los módulos porque comparten fila.
   * @pt-BR Jurisdição fiscal do tenant (#207); armazenada junto aos módulos por compartilharem a mesma linha.
   */
  jurisdiction: FiscalJurisdictionCode
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
  jurisdiction: FiscalJurisdictionCode,
): void {
  cache.set(tenantId, {
    modules,
    integrations,
    jurisdiction,
    expiresAt: Date.now() + TTL_MS,
  })
}

export function invalidateTenantFeaturesCache(tenantId: number): void {
  cache.delete(tenantId)
}

export function clearTenantFeaturesCache(): void {
  cache.clear()
}
